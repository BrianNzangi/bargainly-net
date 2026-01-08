# API Templates Migration Guide

## Overview
API templates have been moved from hardcoded frontend constants to a database table for better management and flexibility.

## What Changed

### Before:
- API templates were hardcoded in `frontend/app/admin/settings/page.tsx`
- Adding new API types required code changes
- No way to disable/enable API types dynamically

### After:
- API templates stored in `api_templates` database table
- Can be managed through database or future admin UI
- Support for enabling/disabling templates
- Custom display ordering

## Migration Steps

### 1. Run Database Migration

Execute the migration script in Supabase SQL Editor:

```bash
# Location: backend/scripts/migrations/009_create_api_templates_table.sql
```

**Or manually run in Supabase:**

1. Go to https://app.supabase.com
2. Select your project
3. Click "SQL Editor" → "New Query"
4. Copy and paste the contents of `009_create_api_templates_table.sql`
5. Click "Run"

### 2. Verify Migration

Check that the table was created and seeded:

```sql
SELECT * FROM api_templates ORDER BY display_order;
```

You should see 6 API templates:
- Amazon Product Advertising API
- Commission Junction API
- Impact Partnership API
- AWIN API
- Rakuten Advertising API
- ShareASale API

## Database Schema

### Table: `api_templates`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `api_type` | VARCHAR(100) | Unique identifier (e.g., `amazon_pa_api`) |
| `label` | VARCHAR(255) | Display name |
| `description` | TEXT | What the API does |
| `field_schema` | JSONB | Required fields and defaults |
| `is_active` | BOOLEAN | Whether template is available |
| `display_order` | INTEGER | Display order in UI |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Example Record:

```json
{
  "id": "uuid-here",
  "api_type": "amazon_pa_api",
  "label": "Amazon Product Advertising API",
  "description": "Amazon PA API credentials for product data and affiliate links",
  "field_schema": {
    "access_key": "",
    "secret_key": "",
    "partner_tag": "",
    "region": "us-east-1"
  },
  "is_active": true,
  "display_order": 1
}
```

## Backend Components Created

### 1. Types (`backend/shared/types/database.ts`)
- `ApiTemplate` - Main interface
- `CreateApiTemplateInput` - For creating templates
- `UpdateApiTemplateInput` - For updating templates

### 2. Repository (`backend/server/repositories/api-template.repository.ts`)
- `findAll(activeOnly)` - Get all templates
- `findById(id)` - Get by ID
- `findByApiType(apiType)` - Get by API type
- `create(input)` - Create new template
- `update(id, input)` - Update template
- `delete(id)` - Delete template

### 3. Service (`backend/server/services/api-template.service.ts`)
- `getAllTemplates(activeOnly)` - Business logic for fetching
- `getTemplateById(id)` - Get single template
- `getTemplateByApiType(apiType)` - Get by type
- `createTemplate(input)` - Create with validation
- `updateTemplate(id, input)` - Update with validation
- `deleteTemplate(id)` - Delete with validation
- `toggleTemplateActive(id)` - Enable/disable template

### 4. API Endpoint (`backend/server/api/v1/api-templates.get.ts`)
- `GET /api/v1/api-templates` - Returns all active templates
- Query param: `?active_only=false` to include inactive

## Frontend Changes

### Settings Page (`frontend/app/admin/settings/page.tsx`)

**Removed:**
```typescript
const API_TEMPLATES: ApiTemplate[] = [...]
```

**Added:**
```typescript
const [apiTemplates, setApiTemplates] = useState<ApiTemplate[]>([])

const fetchApiTemplates = async () => {
    const response = await fetch('http://localhost:3001/api/v1/api-templates')
    const data = await response.json()
    setApiTemplates(data.map(template => ({
        api_type: template.api_type,
        label: template.label,
        description: template.description,
        value: template.field_schema
    })))
}
```

## Adding New API Templates

### Option 1: Direct Database Insert

```sql
INSERT INTO api_templates (api_type, label, description, field_schema, display_order)
VALUES (
    'new_api_type',
    'New API Service',
    'Description of the API service',
    '{"api_key": "", "api_secret": ""}'::jsonb,
    7
);
```

### Option 2: Via API (Future Enhancement)

```typescript
POST /api/v1/api-templates
{
    "api_type": "new_api_type",
    "label": "New API Service",
    "description": "Description of the API service",
    "field_schema": {
        "api_key": "",
        "api_secret": ""
    },
    "display_order": 7
}
```

## Managing Templates

### Disable a Template

```sql
UPDATE api_templates 
SET is_active = false 
WHERE api_type = 'rakuten_api';
```

### Change Display Order

```sql
UPDATE api_templates 
SET display_order = 10 
WHERE api_type = 'amazon_pa_api';
```

### Update Field Schema

```sql
UPDATE api_templates 
SET field_schema = '{
    "api_key": "",
    "api_secret": "",
    "new_field": ""
}'::jsonb
WHERE api_type = 'cj_api';
```

## Benefits

✅ **Dynamic Management** - Add/remove API types without code deployment  
✅ **Flexible Schema** - Each API can have different required fields  
✅ **Enable/Disable** - Turn templates on/off without deletion  
✅ **Ordering** - Control display order in UI  
✅ **Scalability** - Easy to add new integrations  
✅ **Centralized** - Single source of truth in database  

## Rollback

If needed, you can rollback by:

1. Dropping the table:
```sql
DROP TABLE IF EXISTS api_templates CASCADE;
```

2. Reverting frontend code to use hardcoded `API_TEMPLATES` array

## Future Enhancements

- Admin UI for managing templates (CRUD operations)
- Template versioning
- Field validation schemas
- Template categories/grouping
- Usage analytics per template
