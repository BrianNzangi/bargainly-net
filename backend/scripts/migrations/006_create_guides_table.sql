-- Migration: Create guides table
-- Description: Creates the guides table with all necessary columns, indexes, and constraints
-- Date: 2025-12-26

-- Create the guides table
CREATE TABLE IF NOT EXISTS public.guides (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NULL,
  excerpt TEXT NULL,
  intro TEXT NULL,
  conclusion TEXT NULL,
  seo_meta JSONB NULL DEFAULT '{}'::jsonb,
  featured_image TEXT NULL,
  featured_image_alt TEXT NULL,
  cover_image TEXT NULL,
  category TEXT NULL,
  tags TEXT[] NULL,
  items JSONB NULL DEFAULT '[]'::jsonb,
  author_id UUID NULL,
  author_name TEXT NULL,
  status TEXT NULL DEFAULT 'draft'::text,
  is_featured BOOLEAN NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  view_count INTEGER NULL DEFAULT 0,
  metadata JSONB NULL DEFAULT '{}'::jsonb,
  CONSTRAINT guides_pkey PRIMARY KEY (id),
  CONSTRAINT guides_slug_key UNIQUE (slug),
  CONSTRAINT guides_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT guides_status_check CHECK (
    status = ANY (
      ARRAY[
        'draft'::text,
        'published'::text,
        'archived'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_guides_slug ON public.guides USING btree (slug) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_guides_status ON public.guides USING btree (status) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_guides_category ON public.guides USING btree (category) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_guides_author_id ON public.guides USING btree (author_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_guides_published_at ON public.guides USING btree (published_at DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_guides_is_featured ON public.guides USING btree (is_featured) TABLESPACE pg_default
WHERE (is_featured = true);

CREATE INDEX IF NOT EXISTS idx_guides_created_at ON public.guides USING btree (created_at DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_guides_title_search ON public.guides USING gin (to_tsvector('english'::regconfig, title)) TABLESPACE pg_default;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_guides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_guides_updated_at
  BEFORE UPDATE ON public.guides
  FOR EACH ROW
  EXECUTE FUNCTION update_guides_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- Create policies for guides table
-- Policy: Allow public read access to published guides
CREATE POLICY "Public can view published guides"
  ON public.guides
  FOR SELECT
  USING (status = 'published');

-- Policy: Allow authenticated users to view all guides
CREATE POLICY "Authenticated users can view all guides"
  ON public.guides
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert guides
CREATE POLICY "Authenticated users can insert guides"
  ON public.guides
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow users to update their own guides
CREATE POLICY "Users can update their own guides"
  ON public.guides
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy: Allow users to delete their own guides
CREATE POLICY "Users can delete their own guides"
  ON public.guides
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Grant permissions
GRANT SELECT ON public.guides TO anon;
GRANT ALL ON public.guides TO authenticated;
GRANT ALL ON public.guides TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.guides IS 'Stores buying guides and product recommendations';
COMMENT ON COLUMN public.guides.id IS 'Unique identifier for the guide';
COMMENT ON COLUMN public.guides.title IS 'Title of the guide';
COMMENT ON COLUMN public.guides.slug IS 'URL-friendly version of the title';
COMMENT ON COLUMN public.guides.status IS 'Publication status: draft, published, or archived';
COMMENT ON COLUMN public.guides.items IS 'JSON array of guide items/products';
COMMENT ON COLUMN public.guides.seo_meta IS 'SEO metadata including title, description, keywords';
COMMENT ON COLUMN public.guides.is_featured IS 'Whether the guide should be featured on the homepage';
