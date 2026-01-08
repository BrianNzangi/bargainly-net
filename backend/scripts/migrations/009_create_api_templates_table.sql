-- Migration: Create API Templates Table
-- Description: Store available API integration templates in the database
-- This allows dynamic management of API types without code changes

-- Create api_templates table
CREATE TABLE IF NOT EXISTS api_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_type VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    field_schema JSONB NOT NULL, -- Defines the fields required for this API type
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE api_templates IS 'Available API integration templates';
COMMENT ON COLUMN api_templates.api_type IS 'Unique identifier for the API type (e.g., amazon_pa_api)';
COMMENT ON COLUMN api_templates.label IS 'Display name for the API';
COMMENT ON COLUMN api_templates.description IS 'Description of what this API integration does';
COMMENT ON COLUMN api_templates.field_schema IS 'JSON schema defining required fields and their default values';
COMMENT ON COLUMN api_templates.is_active IS 'Whether this template is available for use';
COMMENT ON COLUMN api_templates.display_order IS 'Order in which to display templates in UI';

-- Create index on api_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_templates_api_type ON api_templates(api_type);
CREATE INDEX IF NOT EXISTS idx_api_templates_is_active ON api_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_api_templates_display_order ON api_templates(display_order);

-- Insert existing API templates
INSERT INTO api_templates (api_type, label, description, field_schema, display_order) VALUES
(
    'amazon_pa_api',
    'Amazon Product Advertising API',
    'Amazon PA API credentials for product data and affiliate links',
    '{
        "access_key": "",
        "secret_key": "",
        "partner_tag": "",
        "region": "us-east-1"
    }'::jsonb,
    1
),
(
    'cj_api',
    'Commission Junction API',
    'CJ Affiliate API credentials for commission tracking',
    '{
        "api_key": "",
        "website_id": ""
    }'::jsonb,
    2
),
(
    'impact_api',
    'Impact Partnership API',
    'Impact.com API credentials for affiliate partnerships',
    '{
        "account_sid": "",
        "auth_token": ""
    }'::jsonb,
    3
),
(
    'awin_api',
    'AWIN API',
    'AWIN affiliate network API credentials',
    '{
        "api_key": "",
        "publisher_id": ""
    }'::jsonb,
    4
),
(
    'rakuten_api',
    'Rakuten Advertising API',
    'Rakuten affiliate network API credentials',
    '{
        "api_key": "",
        "sid": ""
    }'::jsonb,
    5
),
(
    'shareasale_api',
    'ShareASale API',
    'ShareASale affiliate network API credentials',
    '{
        "api_token": "",
        "api_secret": "",
        "affiliate_id": ""
    }'::jsonb,
    6
)
ON CONFLICT (api_type) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_api_templates_updated_at
    BEFORE UPDATE ON api_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_api_templates_updated_at();
