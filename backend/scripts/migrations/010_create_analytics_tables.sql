-- Migration: Create Analytics Tables and System Settings
-- Description: Create tables for analytic tools and seed default system settings
-- Created: 2025-12-27

-- 1. Create analytics_templates table
CREATE TABLE IF NOT EXISTS analytics_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'google_analytics', 'brevo'
    label VARCHAR(255) NOT NULL,
    description TEXT,
    field_schema JSONB NOT NULL, -- Defines the fields required (e.g., tracking_id)
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE analytics_templates IS 'Available analytic tool templates';
COMMENT ON COLUMN analytics_templates.provider IS 'Unique identifier for the analytics provider';

-- 2. Create analytics_tools table
CREATE TABLE IF NOT EXISTS analytics_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES analytics_templates(id),
    name VARCHAR(255) NOT NULL, -- User defined name
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb, -- Store credentials/IDs (encrypted if needed)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_analytics_tools_template_id ON analytics_tools(template_id);

-- Add trigger for updated_at
CREATE TRIGGER trigger_update_analytics_templates_updated_at
    BEFORE UPDATE ON analytics_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_api_templates_updated_at(); -- Reusing existing function

CREATE TRIGGER trigger_update_analytics_tools_updated_at
    BEFORE UPDATE ON analytics_tools
    FOR EACH ROW
    EXECUTE FUNCTION update_api_templates_updated_at(); -- Reusing existing function

-- 3. Seed Analytics Templates
INSERT INTO analytics_templates (provider, label, description, field_schema, display_order) VALUES
(
    'google_analytics',
    'Google Analytics 4',
    'Track website traffic and user behavior with GA4',
    '{
        "measurement_id": { "label": "Measurement ID", "type": "text", "placeholder": "G-XXXXXXXXXX", "required": true }
    }'::jsonb,
    1
),
(
    'brevo',
    'Brevo (formerly Sendinblue)',
    'Email marketing and CRM integration',
    '{
        "client_key": { "label": "Client Key", "type": "text", "required": true }
    }'::jsonb,
    2
),
(
    'facebook_pixel',
    'Facebook Pixel',
    'Track conversions from Facebook ads',
    '{
        "pixel_id": { "label": "Pixel ID", "type": "text", "required": true }
    }'::jsonb,
    3
)
ON CONFLICT (provider) DO NOTHING;

-- 4. Seed Default System Settings (Bargainly Data)
-- We use the existing 'settings' table with category 'system'
INSERT INTO settings (key, category, label, description, value, is_encrypted, is_active) VALUES
(
    'general_site_settings',
    'system',
    'General Site Settings',
    'Core configuration for the application',
    '{
        "site_name": "Bargainly",
        "seo_title": "Bargainly - Best Deals & Discounts",
        "contact_email": "support@bargainly.com",
        "currency": "USD",
        "support_phone": "",
        "social_links": {
            "facebook": "",
            "twitter": "",
            "instagram": ""
        }
    }'::jsonb,
    false,
    true
)
ON CONFLICT (key) DO NOTHING;
