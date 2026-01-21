-- 1. BIODYNAMIC PREPARATIONS: Make prices visible only to authenticated users
DROP POLICY IF EXISTS "Anyone can view active preparations" ON public.biodynamic_preparations;
DROP POLICY IF EXISTS "Authenticated users can view active preparations" ON public.biodynamic_preparations;

CREATE POLICY "Authenticated users can view active preparations"
  ON public.biodynamic_preparations FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 2. PRODUCT VARIATIONS: Make prices visible only to authenticated users  
DROP POLICY IF EXISTS "Anyone can view active product variations" ON public.product_variations;

CREATE POLICY "Authenticated users can view active product variations"
  ON public.product_variations FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = product_variations.product_id 
    AND products.is_active = true
  ));