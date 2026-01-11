-- Add google_sheets_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN google_sheets_url TEXT,
ADD COLUMN has_completed_setup BOOLEAN DEFAULT false;

-- Update the trigger to set has_completed_setup to false for new users
COMMENT ON COLUMN public.profiles.google_sheets_url IS 'User''s Google Sheets URL for data sync';
COMMENT ON COLUMN public.profiles.has_completed_setup IS 'Whether user has completed initial setup';