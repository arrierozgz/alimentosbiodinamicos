-- 1. Create the secure contact details table (bunker)
CREATE TABLE public.farmer_contact_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  contact_email text,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS - TOTAL LOCKDOWN
ALTER TABLE public.farmer_contact_details ENABLE ROW LEVEL SECURITY;

-- 3. ONLY the owner can see their own contact details - NO EXCEPTIONS
CREATE POLICY "Only owner can view their contact details"
  ON public.farmer_contact_details FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only owner can insert their contact details"
  ON public.farmer_contact_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only owner can update their contact details"
  ON public.farmer_contact_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only owner can delete their contact details"
  ON public.farmer_contact_details FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Migrate existing contact data to the secure table
INSERT INTO public.farmer_contact_details (user_id, contact_email, contact_phone)
SELECT user_id, contact_email, contact_phone
FROM public.farmer_profiles
WHERE contact_email IS NOT NULL OR contact_phone IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 5. Drop the public view first (it depends on the columns)
DROP VIEW IF EXISTS public.farmer_profiles_public;

-- 6. Remove sensitive columns from farmer_profiles permanently
ALTER TABLE public.farmer_profiles DROP COLUMN IF EXISTS contact_email;
ALTER TABLE public.farmer_profiles DROP COLUMN IF EXISTS contact_phone;

-- 7. Recreate the public view (now without any contact fields possible)
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
WHERE presentation IS NOT NULL AND presentation <> '';

-- 8. Add trigger for updated_at on new table
CREATE TRIGGER update_farmer_contact_details_updated_at
  BEFORE UPDATE ON public.farmer_contact_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();