-- Migration: Create RLS policies for bargainly-uploads storage bucket
-- Description: Adds Row-Level Security policies to allow authenticated uploads and public read access
-- Date: 2025-12-29
-- Note: RLS is already enabled on storage.objects by default in Supabase

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads to bargainly-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to bargainly-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to bargainly-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to bargainly-uploads" ON storage.objects;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to bargainly-uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bargainly-uploads');

-- Policy: Allow public read access to all files
CREATE POLICY "Allow public read access to bargainly-uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bargainly-uploads');

-- Policy: Allow authenticated users to update files
CREATE POLICY "Allow authenticated updates to bargainly-uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bargainly-uploads');

-- Policy: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes to bargainly-uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bargainly-uploads');
