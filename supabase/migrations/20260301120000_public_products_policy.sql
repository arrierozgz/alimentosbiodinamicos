-- Allow anyone (including anonymous) to view active products
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Allow anonymous users to view the public farmer profiles view
-- (the view already filters by is_public=true and presentation not empty)
