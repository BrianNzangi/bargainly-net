# 🚀 Quick Reference - NextAuth & JWT Setup

## 📋 Checklist

- [ ] Add `NEXTAUTH_SECRET` to `frontend/.env.local`
- [ ] Add `NEXTAUTH_SECRET` to `backend/.env` (same value!)
- [ ] Add `NEXTAUTH_URL=http://localhost:3000` to `frontend/.env.local`
- [ ] Replace placeholder auth in `frontend/app/api/auth/[...nextauth]/route.ts`
- [ ] Test login at `http://localhost:3000/login`

## 🔑 Generate Secret

```bash
openssl rand -base64 32
```

## 📁 Key Files Created

| File | Purpose |
|------|---------|
| `frontend/app/api/auth/[...nextauth]/route.ts` | NextAuth API handler |
| `frontend/app/providers/AuthProvider.tsx` | Session provider wrapper |
| `frontend/app/login/page.tsx` | Example login page |
| `backend/server/utils/auth.ts` | JWT verification utility |
| `backend/server/api/v1/products.get.ts` | Protected API example |
| `shared/types/index.ts` | Shared type definitions |

## 🔐 Frontend Usage

### Sign In
```tsx
import { signIn } from 'next-auth/react'

await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  redirect: false
})
```

### Get Session (Client)
```tsx
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
```

### Get Session (Server)
```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const session = await getServerSession(authOptions)
```

## 🛡️ Backend Usage

### Protected Endpoint
```typescript
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)
  
  const userId = event.context.user.id
  // Your logic here
})
```

### Public Endpoint
```typescript
export default defineEventHandler(async (event) => {
  // No requireAuth() call = public
})
```

## 🧪 Testing

```bash
# Test login page
http://localhost:3000/login

# Test protected API (should fail)
curl http://localhost:3001/api/v1/products

# Test with JWT
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/v1/products
```

## 📚 Full Documentation

- **Setup Guide:** [ENV_SETUP.md](file:///c:/Users/Nzzangi/Desktop/Brian/bargainly/ENV_SETUP.md)
- **Usage Guide:** [NEXTAUTH_USAGE.md](file:///c:/Users/Nzzangi/Desktop/Brian/bargainly/NEXTAUTH_USAGE.md)
- **Walkthrough:** [walkthrough.md](file:///C:/Users/Nzzangi/.gemini/antigravity/brain/0bc75ff6-0ebc-48ca-afb3-3fa6415cc8b7/walkthrough.md)
