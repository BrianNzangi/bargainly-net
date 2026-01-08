-- Migration: Update Settings Table to Allow Multiple API Instances
-- Description: Remove unique constraint on key and add api_type field to support multiple instances of the same API
-- Created: 2025-12-27

-- Drop the unique constraint on key
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_key_key;

-- Add api_type column to store the type of API (e.g., 'amazon_pa_api', 'awin_api')
ALTER TABLE settings ADD COLUMN IF NOT EXISTS api_type VARCHAR(100);

-- Add instance_name column to allow users to name their API instances
ALTER TABLE settings ADD COLUMN IF NOT EXISTS instance_name VARCHAR(255);

-- Update existing records to set api_type from key
UPDATE settings SET api_type = key WHERE api_type IS NULL;

-- Create composite unique index on key to ensure uniqueness
-- Key will now be a combination of api_type and a unique identifier
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_unique_key ON settings(key);

-- Create index on api_type for filtering
CREATE INDEX IF NOT EXISTS idx_settings_api_type ON settings(api_type);

-- Add comments
COMMENT ON COLUMN settings.api_type IS 'Type of API integration (e.g., amazon_pa_api, awin_api)';
COMMENT ON COLUMN settings.instance_name IS 'User-defined name for this API instance';
COMMENT ON COLUMN settings.key IS 'Unique identifier for the setting (combination of api_type and UUID)';
