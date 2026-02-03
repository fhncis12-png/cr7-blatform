import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
};

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, unknown>, key) => {
      result[key] = obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])
        ? sortObject(obj[key] as Record<string, unknown>)
        : obj[key];
      return result;
    }, {});
}

async function createHmacSha512(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hexBytes = hexEncode(new Uint8Array(signature));
  return new TextDecoder().decode(hexBytes);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const ipnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the signature from headers
    const signature = req.headers.get('x-nowpayments-sig');
    const body = await req.text();
    const payload = JSON.parse(body);

    console.log('Webhook received:', payload);

    // Verify signature if IPN secret is configured
    if (ipnSecret && signature) {
      const sortedPayload = sortObject(payload);
      const calculatedSignature = await createHmacSha512(ipnSecret, JSON.stringify(sortedPayload));

      if (calculatedSignature !== signature) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const {
      payment_id,
      payment_status,
      order_id,
      pay_amount,
      actually_paid,
      pay_currency,
      outcome_amount,
      outcome_currency,
    } = payload;

    console.log(`Payment ${payment_id} status: ${payment_status}`);

    // Find the deposit by order_id
    const { data: deposit, error: findError } = await supabase
      .from('crypto_deposits')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (findError || !deposit) {
      console.error('Deposit not found for order:', order_id);
      return new Response(
        JSON.stringify({ success: false, error: 'Deposit not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already processed
    if (deposit.payment_status === 'finished' || deposit.payment_status === 'confirmed') {
      console.log('Deposit already processed');
      return new Response(
        JSON.stringify({ success: true, message: 'Already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update deposit status
    const { error: updateError } = await supabase
      .from('crypto_deposits')
      .update({
        payment_id: payment_id?.toString(),
        payment_status: payment_status,
        amount_crypto: actually_paid || pay_amount,
        confirmed_at: payment_status === 'finished' || payment_status === 'confirmed' ? new Date().toISOString() : null,
      })
      .eq('id', deposit.id);

    if (updateError) {
      console.error('Error updating deposit:', updateError);
      throw new Error('Failed to update deposit');
    }

    // If payment is confirmed, credit user's balance
    if (payment_status === 'finished' || payment_status === 'confirmed') {
      const creditAmount = outcome_amount || deposit.amount_usd;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: supabase.rpc('increment_balance', { user_id: deposit.user_id, amount: creditAmount }),
        })
        .eq('id', deposit.user_id);

      // Actually, we need to use a direct SQL approach or RPC
      // Let's update balance directly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', deposit.user_id)
        .single();

      if (profile && !profileError) {
        const newBalance = Number(profile.balance) + Number(creditAmount);
        await supabase
          .from('profiles')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', deposit.user_id);
      }

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: deposit.user_id,
          type: 'deposit',
          amount: creditAmount,
          description: `إيداع ${pay_currency?.toUpperCase() || deposit.currency} - ${order_id}`,
          status: 'completed',
        });

      // Trigger referral commission via the existing trigger
      console.log(`Credited $${creditAmount} to user ${deposit.user_id}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
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
