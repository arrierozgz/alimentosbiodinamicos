-- Add basic data integrity constraints for products
ALTER TABLE products 
  ADD CONSTRAINT products_name_length CHECK (char_length(name) > 0 AND char_length(name) <= 200);

-- Add constraint for photo_url format (allow null or valid http/https URLs)
ALTER TABLE products 
  ADD CONSTRAINT products_photo_url_format CHECK (photo_url IS NULL OR photo_url ~* '^https?://');

-- Add length limits for optional fields
ALTER TABLE products 
  ADD CONSTRAINT products_season_length CHECK (season IS NULL OR char_length(season) <= 100);

ALTER TABLE products 
  ADD CONSTRAINT products_product_type_length CHECK (product_type IS NULL OR char_length(product_type) <= 100);