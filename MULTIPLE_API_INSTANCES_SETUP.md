# API Integration Multiple Instances Setup

## Overview
This update allows you to create multiple instances of the same API type (e.g., multiple Amazon PA API configurations, multiple AWIN API configurations, etc.).

## Required Steps

### 1. Run Database Migration

You need to run the following SQL in your Supabase SQL Editor:

```sql
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
```

### 2. How to Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Paste the SQL above
6. Click "Run" or press Ctrl+Enter

### 3. Verify the Migration

After running the migration, you can verify it worked by running:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'settings'
ORDER BY ordinal_position;
```

You should see the new `api_type` and `instance_name` columns.

## Features

### Multiple Instances
- You can now create multiple instances of the same API type
- Each instance can have a custom name to help you identify it
- Example: "Amazon PA API - US Store", "Amazon PA API - UK Store"

### Instance Naming
- When creating a new API integration, you'll be prompted to enter an optional instance name
- If you provide a name, it will be appended to the label for easy identification
- If you don't provide a name, the default label will be used

### Unique Keys
- Each API instance gets a unique auto-generated key
- Format: `{api_type}_{timestamp}_{random_string}`
- Example: `amazon_pa_api_1735315200000_abc123`

## Usage

1. Navigate to http://localhost:3000/admin/settings
2. Click "Create API Integration"
3. Select the API type you want to create
4. Enter an optional instance name (e.g., "Production", "Testing", "US Store")
5. Click to create
6. The new instance will appear in the list
7. Click "Edit" to configure the credentials
8. Toggle "Enable this integration" and save

## Backend Changes

The backend has been updated to:
- Auto-generate unique keys when creating settings
- Support the new `api_type` and `instance_name` fields
- Allow multiple instances of the same API type

## Frontend Changes

The frontend has been updated to:
- Remove the restriction on creating duplicate API types
- Prompt for instance names when creating new integrations
- Display instance names in the API integration cards
- Support creating unlimited instances of each API type
