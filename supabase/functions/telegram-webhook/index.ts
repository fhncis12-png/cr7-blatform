import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Telegram Webhook received:', body)

    // Handle Callback Query (Button clicks)
    if (body.callback_query) {
      const callbackQuery = body.callback_query
      const data = callbackQuery.data // format: "approve:id" or "reject:id"
      const [action, id] = data.split(':')
      const chatId = callbackQuery.message.chat.id
      const messageId = callbackQuery.message.message_id
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')

      console.log(`Action: ${action}, ID: ${id}`)

      // 1. Get withdrawal details
      const { data: withdrawal, error: getError } = await supabase
        .from('crypto_withdrawals')
        .select('*, profiles(email)')
        .eq('id', id)
        .single()

      if (getError || !withdrawal) {
        throw new Error('Withdrawal not found')
      }

      let newStatus = ''
      let responseText = ''

      if (action === 'approve') {
        newStatus = 'paid'
        responseText = `✅ تم قبول طلب السحب للمستخدم: ${withdrawal.profiles.email}\nالمبلغ: $${withdrawal.amount}\nالحالة: مدفوع`
      } else if (action === 'reject') {
        newStatus = 'rejected'
        responseText = `❌ تم رفض طلب السحب للمستخدم: ${withdrawal.profiles.email}\nالمبلغ: $${withdrawal.amount}\nالحالة: مرفوض (تم إرجاع الرصيد)`
      }

      // 2. Update status via the existing function logic or direct update
      // For simplicity and reliability, we'll call the update-withdrawal-status logic here
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/update-withdrawal-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ id, status: newStatus })
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Failed to update status: ${errText}`)
      }

      // 3. Update the Telegram message to show the result
      await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: responseText
        })
      })

      // 4. Answer callback query to remove loading state on button
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQuery.id,
          text: `تم التحديث إلى ${newStatus}`
        })
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
