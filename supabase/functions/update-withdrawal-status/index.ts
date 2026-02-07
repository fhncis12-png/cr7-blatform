import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authorization required'
      }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { withdrawalId, status, notes } = body;

    // Validate input
    if (!withdrawalId || !status) {
      return new Response(JSON.stringify({
        success: false,
        error: 'معرف السحب والحالة مطلوبان'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate status
    if (!['paid', 'rejected', 'pending', 'completed'].includes(status)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'حالة غير صحيحة'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('crypto_withdrawals')
      .select('*, profiles(email, balance)')
      .eq('id', withdrawalId)
      .single();

    if (withdrawalError || !withdrawal) {
      return new Response(JSON.stringify({
        success: false,
        error: 'لم يتم العثور على طلب السحب'
      }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Handle rejection - refund balance
    if (status === 'rejected' && withdrawal.status === 'pending') {
      const newBalance = Number(withdrawal.profiles.balance) + Number(withdrawal.amount_usd);
      
      // Update user balance
      const { error: balanceError } = await supabaseAdmin
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', withdrawal.user_id);

      if (balanceError) {
        console.error('Balance refund error:', balanceError);
        return new Response(JSON.stringify({
          success: false,
          error: 'فشل في إرجاع الرصيد'
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Create refund transaction
      await supabaseAdmin.from('transactions').insert({
        user_id: withdrawal.user_id,
        type: 'deposit',
        amount: withdrawal.amount_usd,
        description: `إرجاع رصيد - رفض طلب السحب`,
        status: 'completed'
      });
    }

    // Update withdrawal status
    const updateData: any = {
      status,
      processed_at: new Date().toISOString()
    };

    if (notes) {
      updateData.withdrawal_id = notes;
    }

    const { error: updateError } = await supabaseAdmin
      .from('crypto_withdrawals')
      .update(updateData)
      .eq('id', withdrawalId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({
        success: false,
        error: 'فشل في تحديث حالة السحب'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Update transaction status
    await supabaseAdmin
      .from('transactions')
      .update({ status: status === 'rejected' ? 'failed' : 'completed' })
      .eq('user_id', withdrawal.user_id)
      .eq('type', 'withdrawal')
      .eq('status', 'pending');

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      action: `WITHDRAWAL_${status.toUpperCase()}`,
      target_id: withdrawalId,
      details: { status, notes, amount: withdrawal.amount_usd }
    });

    return new Response(JSON.stringify({
      success: true,
      message: status === 'paid' ? 'تم تحديث الحالة إلى مدفوع' : 
               status === 'rejected' ? 'تم رفض الطلب وإرجاع الرصيد' : 
               'تم تحديث الحالة بنجاح'
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
