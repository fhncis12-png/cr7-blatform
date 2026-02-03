-- Change vip_level column to numeric to support decimal levels like 0.5
ALTER TABLE public.profiles 
ALTER COLUMN vip_level TYPE numeric(3,1) USING vip_level::numeric(3,1);

-- Set default value
ALTER TABLE public.profiles 
ALTER COLUMN vip_level SET DEFAULT 0;