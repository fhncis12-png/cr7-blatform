import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const MINIMUM_DEPOSIT_USD = 4;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!apiKey) throw new Error('NOWPAYMENTS_API_KEY is not configured');
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase configuration missing');

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create supabase client with user's token
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, currency } = await req.json();

    // Validate minimum deposit
    if (!amount || amount < MINIMUM_DEPOSIT_USD) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `الحد الأدنى للإيداع هو $${MINIMUM_DEPOSIT_USD}`,
          minimumDeposit: MINIMUM_DEPOSIT_USD 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!currency) {
      return new Response(
        JSON.stringify({ success: false, error: 'Currency is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique order ID
    const orderId = `DEP-${user.id.slice(0, 8)}-${Date.now()}`;

    // Create payment invoice via NOWPayments
    const invoiceResponse = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency.toLowerCase(),
        order_id: orderId,
        order_description: `Deposit $${amount} to CR7 Platform`,
        ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`,
        success_url: `${supabaseUrl.replace('.supabase.co', '')}/profile`,
        cancel_url: `${supabaseUrl.replace('.supabase.co', '')}/profile`,
      }),
    });

    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      console.error('NOWPayments invoice error:', errorText);
      throw new Error(`Failed to create invoice: ${invoiceResponse.status}`);
    }

    const invoiceData = await invoiceResponse.json();
    console.log('Invoice created:', invoiceData);

    // Get payment details with wallet address
    let paymentDetails = null;
    if (invoiceData.id) {
      // Create a payment from the invoice to get wallet address
      const paymentResponse = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_amount: amount,
          price_currency: 'usd',
          pay_currency: currency.toLowerCase(),
          order_id: orderId,
          order_description: `Deposit $${amount} to CR7 Platform`,
          ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`,
        }),
      });

      if (paymentResponse.ok) {
        paymentDetails = await paymentResponse.json();
        console.log('Payment created:', paymentDetails);
      }
    }

    // Save deposit record to database
    const { error: insertError } = await supabase
      .from('crypto_deposits')
      .insert({
        user_id: user.id,
        invoice_id: invoiceData.id?.toString() || orderId,
        order_id: orderId,
        payment_id: paymentDetails?.payment_id?.toString(),
        amount_usd: amount,
        amount_crypto: paymentDetails?.pay_amount,
        currency: currency.toUpperCase(),
        network: paymentDetails?.network || currency.toUpperCase(),
        wallet_address: paymentDetails?.pay_address,
        payment_status: 'waiting',
        expires_at: paymentDetails?.expiration_estimate_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save deposit record');
    }

    return new Response(
      JSON.stringify({
        success: true,
        deposit: {
          orderId,
          invoiceId: invoiceData.id,
          invoiceUrl: invoiceData.invoice_url,
          payAddress: paymentDetails?.pay_address,
          payAmount: paymentDetails?.pay_amount,
          payCurrency: paymentDetails?.pay_currency?.toUpperCase(),
          network: paymentDetails?.network,
          expiresAt: paymentDetails?.expiration_estimate_date,
          qrCode: paymentDetails?.pay_address ? 
            `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentDetails.pay_address}` : null,
        },
        message: 'يرجى إرسال المبلغ المطلوب بالإضافة إلى رسوم الشبكة لإتمام المعاملة',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Deposit error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
