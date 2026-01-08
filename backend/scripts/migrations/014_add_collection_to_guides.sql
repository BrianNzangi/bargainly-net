-- Migration: Add collection column to guides table
-- Description: Adds a collection field to categorize guides for homepage sections
-- Date: 2026-01-04

-- Add collection column to guides table
ALTER TABLE public.guides 
ADD COLUMN IF NOT EXISTS collection TEXT NULL;

-- Create index for better query performance when filtering by collection
CREATE INDEX IF NOT EXISTS idx_guides_collection 
ON public.guides USING btree (collection) 
TABLESPACE pg_default;

-- Add comment for documentation
COMMENT ON COLUMN public.guides.collection IS 'Homepage collection category: smart-homes, gaming, deals, tech, or health';

-- Add check constraint to ensure only valid collection values
ALTER TABLE public.guides 
ADD CONSTRAINT guides_collection_check 
CHECK (
  collection IS NULL OR collection = ANY (
    ARRAY[
      'smart-homes'::text,
      'gaming'::text,
      'deals'::text,
      'tech'::text,
      'health'::text
    ]
  )
);
