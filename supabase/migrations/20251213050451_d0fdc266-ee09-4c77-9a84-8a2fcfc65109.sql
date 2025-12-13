-- Add email_verified column to profiles table
ALTER TABLE public.profiles ADD COLUMN email_verified boolean DEFAULT false;

-- Create verification_codes table for OTP storage
CREATE TABLE public.verification_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_verification_codes_email ON public.verification_codes(email);

-- Enable RLS on verification_codes (only accessible via service role in edge functions)
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only edge functions with service role access this table