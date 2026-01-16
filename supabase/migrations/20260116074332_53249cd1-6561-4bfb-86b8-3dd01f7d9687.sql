
-- =============================================
-- FASE 1: ESTRUCTURA DE DATOS COMPLETA
-- =============================================

-- 1. SISTEMA DE ROLES DE USUARIO
-- Enum para roles de la aplicación
CREATE TYPE public.app_role AS ENUM ('consumidor', 'agricultor', 'ganadero', 'elaborador');

-- Tabla de roles (permite múltiples roles por usuario)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función security definer para verificar roles (evita recursión en RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add roles to themselves"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own roles"
  ON public.user_roles FOR DELETE
  USING (auth.uid() = user_id);

-- 2. PERFILES DE AGRICULTOR/GANADERO
CREATE TABLE public.farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  farm_name TEXT NOT NULL,
  activity_types app_role[] NOT NULL DEFAULT '{}',
  approximate_location TEXT,
  postal_code TEXT,
  presentation TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_web TEXT,
  preferred_language TEXT DEFAULT 'es',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en farmer_profiles
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para farmer_profiles
CREATE POLICY "Anyone can view farmer profiles with presentation"
  ON public.farmer_profiles FOR SELECT
  USING (presentation IS NOT NULL AND presentation != '');

CREATE POLICY "Users can view their own profile"
  ON public.farmer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON public.farmer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.farmer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.farmer_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at en farmer_profiles
CREATE TRIGGER update_farmer_profiles_updated_at
  BEFORE UPDATE ON public.farmer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. CERTIFICACIONES DE PRODUCTO
CREATE TYPE public.certification_type AS ENUM ('conciencia', 'ecologica', 'demeter');

-- Añadir certificaciones a la tabla de productos existente
ALTER TABLE public.products 
  ADD COLUMN certifications certification_type[] DEFAULT '{}';

-- 4. VARIACIONES DE PRODUCTO
CREATE TYPE public.product_unit AS ENUM ('g', 'kg', 'unidad', 'litro', 'docena');

CREATE TABLE public.product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variety TEXT,
  packaging TEXT,
  net_price DECIMAL(10, 2),
  unit product_unit DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en product_variations
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

-- Función para verificar propiedad de producto
CREATE OR REPLACE FUNCTION public.owns_product(_product_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.products
    WHERE id = _product_id
      AND user_id = auth.uid()
  )
$$;

-- Políticas RLS para product_variations
CREATE POLICY "Anyone can view active product variations"
  ON public.product_variations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND is_active = true
    )
  );

CREATE POLICY "Owners can view their product variations"
  ON public.product_variations FOR SELECT
  USING (public.owns_product(product_id));

CREATE POLICY "Owners can create product variations"
  ON public.product_variations FOR INSERT
  WITH CHECK (public.owns_product(product_id));

CREATE POLICY "Owners can update their product variations"
  ON public.product_variations FOR UPDATE
  USING (public.owns_product(product_id));

CREATE POLICY "Owners can delete their product variations"
  ON public.product_variations FOR DELETE
  USING (public.owns_product(product_id));

-- Trigger para updated_at en product_variations
CREATE TRIGGER update_product_variations_updated_at
  BEFORE UPDATE ON public.product_variations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. PREPARADOS BIODINÁMICOS
CREATE TYPE public.preparation_type AS ENUM (
  '500', '501', '502', '503', '504', '505', '506', '507', '508', 'maria_thun'
);

CREATE TABLE public.biodynamic_preparations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preparation preparation_type NOT NULL,
  price DECIMAL(10, 2),
  unit TEXT DEFAULT 'unidad',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, preparation)
);

-- Habilitar RLS en biodynamic_preparations
ALTER TABLE public.biodynamic_preparations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para biodynamic_preparations
CREATE POLICY "Anyone can view active preparations"
  ON public.biodynamic_preparations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their own preparations"
  ON public.biodynamic_preparations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preparations"
  ON public.biodynamic_preparations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preparations"
  ON public.biodynamic_preparations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preparations"
  ON public.biodynamic_preparations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at en biodynamic_preparations
CREATE TRIGGER update_biodynamic_preparations_updated_at
  BEFORE UPDATE ON public.biodynamic_preparations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. PREFERENCIAS DE USUARIO (para recordar última unidad usada)
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_unit_used product_unit DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para updated_at en user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
