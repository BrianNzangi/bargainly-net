-- Fix Computers category - ensure all required fields are set
-- This will make it appear in the API response

-- First, check the current state
SELECT 
    id,
    name,
    slug,
    level,
    parent_id,
    sort_order,
    product_count,
    created_at
FROM public.categories
WHERE slug = 'computers';

-- Update the Computers category with proper values
UPDATE public.categories
SET 
    level = COALESCE(level, 2),  -- Set to level 2 if NULL
    parent_id = COALESCE(parent_id, 'ee1d64e8-1805-4afc-a3b0-2349a5cf4655'),  -- Electronics & Tech
    sort_order = COALESCE(sort_order, 0),  -- Set to 0 if NULL
    product_count = COALESCE(product_count, 0),  -- Set to 0 if NULL
    updated_at = NOW()
WHERE slug = 'computers';

-- Verify the update
SELECT 
    id,
    name,
    slug,
    level,
    parent_id,
    (SELECT name FROM public.categories WHERE id = parent_id) as parent_name,
    sort_order,
    product_count
FROM public.categories
WHERE slug = 'computers';

-- List all Electronics & Tech subcategories to confirm
SELECT 
    id,
    name,
    slug,
    level,
    sort_order
FROM public.categories
WHERE parent_id = 'ee1d64e8-1805-4afc-a3b0-2349a5cf4655'
ORDER BY sort_order, name;
