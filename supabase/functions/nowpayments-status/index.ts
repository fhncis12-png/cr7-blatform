import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const paymentId = url.searchParams.get('payment_id');

    if (paymentId) {
      // Get specific payment status from NOWPayments
      const statusResponse = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
        headers: { 'x-api-key': apiKey },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        return new Response(
          JSON.stringify({ success: true, payment: statusData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get user's deposits
    const { data: deposits, error: depositsError } = await supabase
      .from('crypto_deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get user's withdrawals
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('crypto_withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get user profile for withdrawal cooldown
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance, last_withdrawal_at')
      .eq('id', user.id)
      .single();

    let nextWithdrawalAt = null;
    let canWithdraw = true;

    if (profile?.last_withdrawal_at) {
      const lastWithdrawal = new Date(profile.last_withdrawal_at);
      nextWithdrawalAt = new Date(lastWithdrawal.getTime() + 24 * 60 * 60 * 1000);
      canWithdraw = new Date() >= nextWithdrawalAt;
    }

    return new Response(
      JSON.stringify({
        success: true,
        balance: profile?.balance || 0,
        deposits: deposits || [],
        withdrawals: withdrawals || [],
        canWithdraw,
        nextWithdrawalAt: nextWithdrawalAt?.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Status error:', error);
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
