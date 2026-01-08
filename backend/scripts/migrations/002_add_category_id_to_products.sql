-- Add category_id column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id uuid NULL;

-- Add foreign key constraint to categories table
ALTER TABLE public.products
ADD CONSTRAINT fk_products_category
FOREIGN KEY (category_id) 
REFERENCES public.categories(id)
ON DELETE SET NULL;

-- Create index on category_id for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category_id 
ON public.products USING btree (category_id);

