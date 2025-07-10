
-- Add google_calendar_refresh_token column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS google_calendar_refresh_token TEXT;
