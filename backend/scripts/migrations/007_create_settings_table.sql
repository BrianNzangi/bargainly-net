-- Migration: Create Settings Table
-- Description: Table for storing application settings and API configurations
-- Created: 2025-12-27

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_encrypted BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Create index on is_active for filtering active settings
CREATE INDEX IF NOT EXISTS idx_settings_is_active ON settings(is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Add comment to table
COMMENT ON TABLE settings IS 'Application settings and third-party API configurations';
COMMENT ON COLUMN settings.key IS 'Unique identifier for the setting';
COMMENT ON COLUMN settings.category IS 'Setting category (api_integration, system, email, etc.)';
COMMENT ON COLUMN settings.value IS 'JSONB value storing the setting data';
COMMENT ON COLUMN settings.is_encrypted IS 'Whether the value contains encrypted data';
COMMENT ON COLUMN settings.is_active IS 'Whether the setting/integration is currently active';
