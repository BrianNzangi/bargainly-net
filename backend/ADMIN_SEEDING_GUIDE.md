# Admin User Seeding Guide

## Overview

The `seed-admin.ts` script allows you to manage admin users in your Supabase database.

## Prerequisites

1. **Environment Variables**: Ensure your `backend/.env` file contains:
   ```env
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Database Migrations**: Run the user and role migrations first:
   ```bash
   # Run migrations in order
   001_create_users_table.sql
   002_create_roles_table.sql
   004_add_is_enabled_to_users.sql
   ```

## Usage

### Seed Superadmin
Creates the main admin user (`admin@workit.com`):
```bash
npm run seed:admin seed
```

**Output:**
```
🌱 Seeding superadmin user...
✅ Created admin user: admin@workit.com
   Role: ADMIN
   Enabled: true

✅ Operation completed successfully!
```

### Seed Marketing Admin
Creates a marketing admin user (`marketing@workit.com`):
```bash
npm run seed:admin seed-marketing
```

### Verify Superadmin
Check if the superadmin exists and is configured correctly:
```bash
npm run seed:admin verify
```

### Reset Superadmin
Delete and recreate the superadmin user:
```bash
npm run seed:admin reset
```

### List All Admins
Display all admin, editor, and marketing users:
```bash
npm run seed:admin list
```

**Output:**
```
📋 Admin Users:
────────────────────────────────────────────────────────────────────────────────

Super Admin
  Email:   admin@workit.com
  Role:    ADMIN
  Enabled: ✅
  Created: 12/27/2025

Marketing Admin
  Email:   marketing@workit.com
  Role:    MARKETING
  Enabled: ✅
  Created: 12/27/2025

────────────────────────────────────────────────────────────────────────────────
```

## Default Admin Credentials

- **Email**: `admin@workit.com`
- **Role**: `ADMIN`
- **Enabled**: `true`

> [!IMPORTANT]
> This script only creates users in the database. You'll need to set up authentication (passwords) separately using NextAuth or Supabase Auth.

## User Roles

The system supports four roles:

| Role | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | Full system access | All permissions |
| **EDITOR** | Content management | Reviews, products, categories (read/write) |
| **MARKETING** | Marketing & analytics | Reviews, products, analytics, campaigns |
| **VIEWER** | Read-only access | Reviews, products, categories (read-only) |

## Troubleshooting

### "Missing required environment variables"
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are in `backend/.env`
- Check that the `.env` file is in the correct location

### "Admin user already exists"
- Use `npm run seed:admin reset` to delete and recreate
- Or use `npm run seed:admin verify` to check the existing admin

### Database connection errors
- Verify your Supabase URL and service role key are correct
- Check that your Supabase project is running
- Ensure the users table exists (run migrations first)

## Integration with NextAuth

After seeding admin users, you'll need to:

1. **Set up authentication** in NextAuth's `authorize` function
2. **Hash passwords** if storing them in the database
3. **Verify user credentials** during login

Example NextAuth integration:
```typescript
async authorize(credentials) {
  const supabase = getSupabaseAdmin()
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', credentials?.email)
    .eq('is_enabled', true)
    .single()
  
  if (!user) return null
  
  // Verify password here (if using password auth)
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}
```
