-- Create user_roles table for admin access control
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update all profiles  
CREATE POLICY "Admin can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all withdrawals
CREATE POLICY "Admin can view all withdrawals"
ON public.crypto_withdrawals
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update withdrawals
CREATE POLICY "Admin can update withdrawals"
ON public.crypto_withdrawals
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can insert/update admin_settings
CREATE POLICY "Admin can insert admin settings"
ON public.admin_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update admin settings"
ON public.admin_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all activity logs
CREATE POLICY "Admin can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));