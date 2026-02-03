-- Table for crypto deposits
CREATE TABLE public.crypto_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id TEXT UNIQUE,
  invoice_id TEXT UNIQUE NOT NULL,
  order_id TEXT UNIQUE NOT NULL,
  amount_usd DECIMAL(12,2) NOT NULL,
  amount_crypto DECIMAL(20,8),
  currency TEXT NOT NULL,
  network TEXT,
  wallet_address TEXT,
  payment_status TEXT NOT NULL DEFAULT 'waiting',
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Table for crypto withdrawals
CREATE TABLE public.crypto_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  withdrawal_id TEXT UNIQUE,
  amount_usd DECIMAL(12,2) NOT NULL,
  amount_crypto DECIMAL(20,8),
  currency TEXT NOT NULL,
  network TEXT,
  wallet_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_hash TEXT,
  fee_amount DECIMAL(12,4),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.crypto_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS policies for deposits
CREATE POLICY "Users can view their own deposits"
ON public.crypto_deposits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deposits"
ON public.crypto_deposits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policies for withdrawals
CREATE POLICY "Users can view their own withdrawals"
ON public.crypto_withdrawals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals"
ON public.crypto_withdrawals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add last_withdrawal_at column to profiles for 24h cooldown
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_withdrawal_at TIMESTAMP WITH TIME ZONE;

-- Enable realtime for deposits (for live status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.crypto_deposits;