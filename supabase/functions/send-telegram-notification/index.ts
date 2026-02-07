import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = '8328507661:AAH7PJMpCDLbf7TsnjkhjU0jCWoE3ksSVwU';
const TELEGRAM_CHAT_ID = '8508057441';

interface TelegramNotificationRequest {
  userEmail: string;
  amount: number;
  wallet: string;
  currency?: string;
  network?: string;
  status: string;
  requestId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: TelegramNotificationRequest = await req.json();
    const { userEmail, amount, wallet, currency = 'USDT', network = 'TRC20', status, requestId } = body;

    // Build Telegram message
    const message = `🚨 New Withdraw Request

User: ${userEmail}
Amount: $${amount}
Wallet: ${wallet}
Currency: ${currency}
Network: ${network}
Status: ${status}`;

    // Inline Keyboard for Accept/Reject
    const replyMarkup = requestId ? {
      inline_keyboard: [
        [
          { text: "✅ Accept", callback_data: `approve:${requestId}` },
          { text: "❌ Reject", callback_data: `reject:${requestId}` }
        ]
      ]
    } : undefined;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        reply_markup: replyMarkup
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', result);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send Telegram notification', details: result }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
