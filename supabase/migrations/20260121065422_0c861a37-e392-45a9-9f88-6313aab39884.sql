-- 1. VERIFY RLS is enabled on farmer_contact_details (it already is, but let's be explicit)
-- Also add explicit DENY for anonymous users
ALTER TABLE public.farmer_contact_details ENABLE ROW LEVEL SECURITY;

-- Explicit deny for anonymous access
DROP POLICY IF EXISTS "Anon users cannot access contact details" ON public.farmer_contact_details;
CREATE POLICY "Anon users cannot access contact details"
  ON public.farmer_contact_details FOR SELECT
  TO anon
  USING (false);

-- 2. Add is_public consent column to farmer_profiles
ALTER TABLE public.farmer_profiles 
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- 3. Recreate the public view to respect consent flag
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
  created_at,
  updated_at
FROM public.farmer_profiles
WHERE is_public = true 
  AND presentation IS NOT NULL 
  AND presentation <> '';