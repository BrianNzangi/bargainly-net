-- Check the full details of the Computers category
SELECT 
    id,
    name,
    slug,
    level,
    parent_id,
    sort_order,
    product_count,
    created_at,
    updated_at
FROM public.categories
WHERE slug = 'computers';

-- Also check if the parent_id is valid (should be Electronics & Tech)
SELECT 
    c.id,
    c.name,
    c.slug,
    c.level,
    c.parent_id,
    p.name as parent_name,
    c.sort_order
FROM public.categories c
LEFT JOIN public.categories p ON c.parent_id = p.id
WHERE c.slug = 'computers';

-- If the category has issues, fix it with this update:
-- UPDATE public.categories
-- SET 
--     level = 2,
--     parent_id = 'ee1d64e8-1805-4afc-a3b0-2349a5cf4655', -- Electronics & Tech
--     sort_order = 0
-- WHERE slug = 'computers';
