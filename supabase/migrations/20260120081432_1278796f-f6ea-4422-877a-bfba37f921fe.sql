-- 1. Drop existing public view and recreate WITHOUT contact fields
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
  -- EXCLUDED: contact_email, contact_phone
FROM public.farmer_profiles
WHERE presentation IS NOT NULL AND presentation <> '';

-- 2. Update the RLS policy on farmer_profiles to prevent direct access to contact fields
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view farmer profiles" ON public.farmer_profiles;

-- Create new policy: Only owner can see their full profile (including contact info)
-- Other users MUST use the public view which excludes contact fields
CREATE POLICY "Users can only view own profile or via public view"
  ON public.farmer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);