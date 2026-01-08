# API Integration Storage & Usage

## Database Structure

Your Amazon API credentials are stored in the **`settings`** table in the database.

### Tables Involved:

#### 1. **`api_templates`** Table
- Stores available API integration templates (like Amazon PA API, CJ, AWIN, etc.)
- Defines the field schema for each API type
- Location: `backend/scripts/migrations/009_create_api_templates_table.sql`

**Columns:**
- `id`: UUID primary key
- `api_type`: Unique identifier (e.g., 'amazon_pa_api')
- `label`: Display name (e.g., 'Amazon Product Advertising API')
- `description`: What the API does
- `field_schema`: JSONB defining required fields
- `is_active`: Whether template is available
- `display_order`: UI display order

#### 2. **`settings`** Table
- Stores actual API configuration values (encrypted)
- Each API integration instance is a row in this table
- Location: `backend/scripts/migrations/007_create_settings_table.sql`

**Columns:**
- `id`: UUID primary key
- `key`: Unique identifier (e.g., 'amazon_pa_api_1735331234_abc123')
- `category`: 'api_integration' for API configs
- `label`: Display name (e.g., 'Amazon Product Advertising API')
- `description`: Optional description
- `value`: **JSONB containing encrypted credentials**
- `is_encrypted`: Boolean (true for API credentials)
- `is_active`: Whether integration is active
- `created_at`, `updated_at`: Timestamps

### Example Settings Row for Amazon:

```json
{
  "id": "uuid-here",
  "key": "amazon_pa_api_1735331234_abc123",
  "category": "api_integration",
  "label": "Amazon Product Advertising API",
  "value": {
    "region": "us-east-1",
    "access_key": "encrypted:iv:ciphertext",
    "secret_key": "encrypted:iv:ciphertext",
    "partner_tag": "encrypted:iv:ciphertext"
  },
  "is_encrypted": true,
  "is_active": true
}
```

## How Products Can Access Amazon Credentials

### Method 1: Using SettingService (Recommended)

```typescript
import { SettingService } from '~/server/services/setting.service'

// In your product service or API endpoint
const settingService = new SettingService()

// Get Amazon credentials (automatically decrypted)
const amazonCreds = await settingService.getAmazonCredentials()

if (amazonCreds) {
  console.log(amazonCreds.region)       // "us-east-1"
  console.log(amazonCreds.access_key)   // "AKIAIOSFODNN7EXAMPLE"
  console.log(amazonCreds.secret_key)   // "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  console.log(amazonCreds.partner_tag)  // "reeviw04-20"
}
```

### Method 2: Get Any API Credentials by Type

```typescript
// Get CJ API credentials
const cjCreds = await settingService.getApiCredentialsByType('cj_api')

// Get AWIN credentials
const awinCreds = await settingService.getApiCredentialsByType('awin_api')
```

### Method 3: Direct Query (Not Recommended - Use Service Instead)

```typescript
// This is handled by SettingService, but for reference:
const settingRepo = new SettingRepository()
const settings = await settingRepo.findByCategory('api_integration')
const amazonSetting = settings.find(s => s.key.startsWith('amazon_pa_api') && s.is_active)
// Then decrypt using settingService.processValueForRetrieval()
```

## Example: Using Amazon Credentials in Product Import

```typescript
// backend/server/services/amazon-product.service.ts
import { SettingService } from './setting.service'
import { ProductAdvertisingAPIv1 } from 'paapi5-nodejs-sdk'

export class AmazonProductService {
  private settingService: SettingService

  constructor() {
    this.settingService = new SettingService()
  }

  async searchProducts(keywords: string) {
    // Get credentials
    const creds = await this.settingService.getAmazonCredentials()
    
    if (!creds) {
      throw new Error('Amazon API credentials not configured')
    }

    // Initialize Amazon PA API client
    const client = ProductAdvertisingAPIv1.getInstance()
    client.accessKey = creds.access_key
    client.secretKey = creds.secret_key
    client.partnerTag = creds.partner_tag
    client.region = creds.region

    // Make API call
    // ... your Amazon PA API logic here
  }

  async getProductDetails(asin: string) {
    const creds = await this.settingService.getAmazonCredentials()
    
    if (!creds) {
      throw new Error('Amazon API credentials not configured')
    }

    // Use credentials to fetch product details
    // ... your logic here
  }
}
```

## Security Notes

1. **Encryption**: All sensitive fields (access_key, secret_key, partner_tag) are encrypted using AES-256-CBC
2. **Decryption**: Only happens server-side via `SettingService`
3. **Never expose**: Decrypted credentials should never be sent to the frontend
4. **Region field**: Not encrypted (as specified in your requirements)

## Multiple Instances

You can have multiple Amazon API configurations:
- Each gets a unique key: `amazon_pa_api_<timestamp>_<random>`
- The service methods return the **first active** configuration
- You can filter by specific key if needed

## API Endpoints

The settings are managed via:
- `GET /api/v1/settings?category=api_integration` - List all API integrations
- `POST /api/v1/settings` - Create new API integration
- `PATCH /api/v1/settings/:key` - Update existing integration
- `DELETE /api/v1/settings/:key` - Delete integration

## Summary

**Your Amazon credentials are stored in:**
- **Table**: `settings`
- **Category**: `api_integration`
- **Key Pattern**: `amazon_pa_api_*`
- **Value**: JSONB with encrypted credentials

**To use in products:**
```typescript
const settingService = new SettingService()
const creds = await settingService.getAmazonCredentials()
// Use creds.partner_tag, creds.access_key, etc.
```
