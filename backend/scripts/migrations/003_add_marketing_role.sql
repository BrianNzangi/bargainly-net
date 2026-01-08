-- Update users table to include MARKETING role
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check CHECK (
  role = ANY (ARRAY['ADMIN'::text, 'EDITOR'::text, 'VIEWER'::text, 'MARKETING'::text])
);

-- Note: Existing data is preserved. This just updates the constraint to allow MARKETING role.
