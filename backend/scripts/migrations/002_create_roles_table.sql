-- Create roles table for role-based access control
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK (name IN ('ADMIN', 'EDITOR', 'VIEWER', 'MARKETING')),
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on role name for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);

-- Enable Row Level Security
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access to roles"
    ON public.roles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy to allow all authenticated users to read roles
CREATE POLICY "Authenticated users can read roles"
    ON public.roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow only admins to modify roles
CREATE POLICY "Only admins can modify roles"
    ON public.roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id::text = auth.uid()::text
            AND role = 'ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id::text = auth.uid()::text
            AND role = 'ADMIN'
        )
    );

-- Insert default roles with their permissions
INSERT INTO public.roles (name, description, permissions) VALUES
    ('ADMIN', 'Full system access with all permissions', 
     '["users:read", "users:write", "users:delete", "reviews:read", "reviews:write", "reviews:delete", "categories:read", "categories:write", "categories:delete", "products:read", "products:write", "products:delete", "settings:read", "settings:write"]'::jsonb),
    ('EDITOR', 'Content management access', 
     '["reviews:read", "reviews:write", "categories:read", "products:read", "products:write"]'::jsonb),
    ('MARKETING', 'Marketing and analytics access',
     '["reviews:read", "categories:read", "products:read", "analytics:read", "analytics:write", "campaigns:read", "campaigns:write"]'::jsonb),
    ('VIEWER', 'Read-only access', 
     '["reviews:read", "categories:read", "products:read"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
