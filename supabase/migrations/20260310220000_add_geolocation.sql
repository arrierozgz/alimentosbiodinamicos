-- Add latitude and longitude columns to farmer_profiles
ALTER TABLE public.farmer_profiles 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Update the public view to include the new columns
DROP VIEW IF EXISTS public.farmer_profiles_public;

CREATE VIEW public.farmer_profiles_public
WITH (security_invoker = true, security_barrier = true) AS
SELECT 
  id,
  user_id,
  farm_name,
  presentation,
  approximate_location,
  postal_code,
  contact_web,
  preferred_language,
  activity_types,
  latitude,
  longitude,
  created_at,
  updated_at
FROM public.farmer_profiles
WHERE is_public = true 
  AND presentation IS NOT NULL 
  AND presentation <> '';
