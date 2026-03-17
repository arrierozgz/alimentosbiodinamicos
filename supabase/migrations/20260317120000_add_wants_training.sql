-- Add training interest field for farmers
ALTER TABLE public.farmer_profiles ADD COLUMN IF NOT EXISTS wants_training boolean DEFAULT false;

-- Also update the public view if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'farmer_profiles_public') THEN
    DROP VIEW IF EXISTS public.farmer_profiles_public;
    CREATE VIEW public.farmer_profiles_public AS
      SELECT id, user_id, farm_name, presentation, approximate_location, postal_code, province,
             contact_web, activity_types, is_public, preferred_language, created_at, updated_at,
             latitude, longitude, wants_training
      FROM public.farmer_profiles
      WHERE is_public = true;
    GRANT SELECT ON public.farmer_profiles_public TO anon;
    GRANT SELECT ON public.farmer_profiles_public TO authenticated;
  END IF;
END $$;
