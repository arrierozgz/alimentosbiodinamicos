-- 1. BIODYNAMIC_PREPARATIONS: Cambiar política para que solo usuarios autenticados vean los precios
DROP POLICY IF EXISTS "Anyone can view active preparations" ON public.biodynamic_preparations;

CREATE POLICY "Authenticated users can view active preparations"
  ON public.biodynamic_preparations FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 2. FARMER_PROFILES: Crear vista pública sin datos de contacto sensibles
CREATE OR REPLACE VIEW public.farmer_profiles_public
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  farm_name,
  presentation,
  approximate_location,
  postal_code,
  activity_types,
  preferred_language,
  contact_web,
  created_at,
  updated_at
  -- EXCLUYE: contact_email, contact_phone
FROM public.farmer_profiles
WHERE presentation IS NOT NULL AND presentation <> '';

-- Eliminar política pública existente
DROP POLICY IF EXISTS "Anyone can view farmer profiles with presentation" ON public.farmer_profiles;

-- Crear política para usuarios autenticados (pueden ver todo incluyendo contactos)
CREATE POLICY "Authenticated users can view farmer profiles"
  ON public.farmer_profiles FOR SELECT
  TO authenticated
  USING (presentation IS NOT NULL AND presentation <> '');

-- Bloquear acceso directo anónimo a la tabla base
CREATE POLICY "Anon users cannot access farmer_profiles directly"
  ON public.farmer_profiles FOR SELECT
  TO anon
  USING (false);