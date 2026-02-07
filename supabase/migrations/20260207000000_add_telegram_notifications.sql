-- Add wallet column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet TEXT;

-- Add payout_type column to crypto_withdrawals if not exists
ALTER TABLE public.crypto_withdrawals ADD COLUMN IF NOT EXISTS payout_type TEXT DEFAULT 'manual';

-- Update crypto_withdrawals status check constraint to include 'paid' and 'rejected'
ALTER TABLE public.crypto_withdrawals DROP CONSTRAINT IF EXISTS crypto_withdrawals_status_check;
ALTER TABLE public.crypto_withdrawals ADD CONSTRAINT crypto_withdrawals_status_check 
  CHECK (status IN ('pending', 'processing', 'completed', 'paid', 'rejected', 'error', 'cancelled'));

-- Create function to send Telegram notification
CREATE OR REPLACE FUNCTION notify_telegram_withdrawal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_wallet TEXT;
  telegram_message TEXT;
  telegram_url TEXT;
  telegram_bot_token TEXT := '8328507661:AAH7PJMpCDLbf7TsnjkhjU0jCWoE3ksSVwU';
  telegram_chat_id TEXT := '8508057441';
BEGIN
  -- Only send notification for new pending withdrawals
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Get user email and wallet from profiles
    SELECT email, wallet INTO user_email, user_wallet
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Build Telegram message
    telegram_message := '🚨 New Withdraw Request' || E'\n' ||
                       'User: ' || COALESCE(user_email, 'Unknown') || E'\n' ||
                       'Amount: $' || NEW.amount_usd || E'\n' ||
                       'Wallet: ' || COALESCE(NEW.wallet_address, user_wallet, 'Not provided') || E'\n' ||
                       'Currency: ' || NEW.currency || E'\n' ||
                       'Network: ' || COALESCE(NEW.network, 'N/A') || E'\n' ||
                       'Status: Pending' || E'\n' ||
                       'Request ID: ' || NEW.id;
    
    -- Build Telegram API URL
    telegram_url := 'https://api.telegram.org/bot' || telegram_bot_token || '/sendMessage';
    
    -- Send notification via HTTP request (requires pg_net extension)
    BEGIN
      PERFORM net.http_post(
        url := telegram_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object(
          'chat_id', telegram_chat_id,
          'text', telegram_message,
          'parse_mode', 'HTML'
        )
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE WARNING 'Failed to send Telegram notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for Telegram notifications
DROP TRIGGER IF EXISTS on_withdrawal_created ON public.crypto_withdrawals;
CREATE TRIGGER on_withdrawal_created
AFTER INSERT ON public.crypto_withdrawals
FOR EACH ROW EXECUTE FUNCTION notify_telegram_withdrawal();

-- Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
