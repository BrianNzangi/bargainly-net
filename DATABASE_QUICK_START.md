# Database Schema Summary

## Quick Reference

Run this command to inspect your database schema:
```bash
npm run inspect:schema
```

## Tables

| Table | Rows | Status | Documentation |
|-------|------|--------|---------------|
| **users** | 3 | ✅ Active | User accounts with roles |
| **roles** | 3 | ✅ Active | ADMIN, EDITOR, MARKETING |
| **categories** | 0 | 📝 Empty | Product/guide categories |
| **guides** | 0 | 📝 Empty | Shopping guides & reviews |
| **products** | 0 | 📝 Empty | Product catalog |

## Files Created

### Documentation
- **[DATABASE_SCHEMA.md](file:///c:/Users/Nzzangi/Desktop/Brian/bargainly/DATABASE_SCHEMA.md)** - Full schema documentation with examples

### TypeScript Types
- **[shared/types/database.ts](file:///c:/Users/Nzzangi/Desktop/Brian/bargainly/shared/types/database.ts)** - Complete type definitions for:
  - All table interfaces
  - Create/Update input types
  - Query filters
  - Pagination types
  - Extended types with relations

### Scripts
- **[scripts/inspect-schema.ts](file:///c:/Users/Nzzangi/Desktop/Brian/bargainly/backend/scripts/inspect-schema.ts)** - Database inspection tool

## Next Steps

### 1. Create Repository Layer
Create data access classes for each table:
```
backend/server/repositories/
├── user.repository.ts
├── role.repository.ts
├── category.repository.ts
├── guide.repository.ts
└── product.repository.ts
```

### 2. Create Service Layer
Create business logic services:
```
backend/server/services/
├── user.service.ts
├── auth.service.ts
├── category.service.ts
├── guide.service.ts
└── product.service.ts
```

### 3. Create API Routes
Create versioned API endpoints:
```
backend/server/api/v1/
├── users.get.ts
├── users.post.ts
├── categories.get.ts
├── guides.get.ts
└── products.get.ts
```

## Usage Example

### Import Types
```typescript
import {
  User,
  Guide,
  Product,
  CreateGuideInput,
  GuideWithAuthor
} from '../../../shared/types/database'
```

### Create a Repository
```typescript
import { getSupabaseAdmin } from '../utils/supabase'
import type { Guide, CreateGuideInput } from '../../../shared/types/database'

export class GuideRepository {
  async findAll(): Promise<Guide[]> {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('guides')
      .select('*')
    
    if (error) throw error
    return data
  }
  
  async create(input: CreateGuideInput): Promise<Guide> {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('guides')
      .insert([input])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
```

### Create an API Route
```typescript
import { requireAuth } from '../../utils/auth'
import { GuideRepository } from '../../repositories/guide.repository'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  
  const repo = new GuideRepository()
  const guides = await repo.findAll()
  
  return guides
})
```

## Permission System

Permissions follow the format: `"resource:action"`

**Example:**
```typescript
const adminPermissions = [
  "users:read",
  "users:write",
  "users:delete",
  "guides:read",
  "guides:write",
  "guides:delete"
]
```

Check permissions in your services:
```typescript
function hasPermission(user: User, permission: string): boolean {
  // Get user's role permissions from roles table
  // Check if permission exists in the array
}
```
