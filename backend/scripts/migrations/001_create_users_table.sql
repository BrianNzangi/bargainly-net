-- Create users table for authentication and authorization
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    role TEXT NOT NULL DEFAULT 'VIEWER' CHECK (role IN ('ADMIN', 'EDITOR', 'VIEWER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Create index on role for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access to users"
    ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read their own data"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text);

-- Create policy to allow admins to read all users
CREATE POLICY "Admins can read all users"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id::text = auth.uid()::text
            AND role = 'ADMIN'
        )
    );
