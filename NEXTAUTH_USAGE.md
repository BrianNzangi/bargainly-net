# NextAuth & JWT Authentication - Usage Guide

## Environment Variables

### Frontend (.env.local)
```env
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000
```

### Backend (.env)
```env
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
```

**IMPORTANT:** The `NEXTAUTH_SECRET` must be the same in both files!

To generate a secure secret, run:
```bash
openssl rand -base64 32
```

---

## Frontend Usage

### 1. Sign In (Client Component)
```tsx
'use client'
import { signIn } from 'next-auth/react'

export default function LoginForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false
    })
    
    if (result?.error) {
      console.error('Login failed:', result.error)
    } else {
      // Redirect or update UI
      window.location.href = '/dashboard'
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

### 2. Get Session (Server Component)
```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }
  
  return <div>Welcome {session.user.email}</div>
}
```

### 3. Call Protected Backend API
```tsx
'use client'
import { useSession } from 'next-auth/react'

export default function ProductList() {
  const { data: session } = useSession()
  
  const fetchProducts = async () => {
    const response = await fetch('http://localhost:3001/api/v1/products', {
      headers: {
        'Authorization': `Bearer ${session?.accessToken}`
      }
    })
    
    const products = await response.json()
    return products
  }
  
  // Use in useEffect or React Query
}
```

---

## Backend Usage

### 1. Protected API Endpoint
```typescript
// server/api/v1/orders.post.ts
import { requireAuth } from '../../utils/auth'
import { getSupabaseAdmin } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)
  
  // User is authenticated, access via event.context.user
  const userId = event.context.user.id
  
  const body = await readBody(event)
  
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      ...body
    })
    .select()
    .single()
  
  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  
  return data
})
```

### 2. Public API Endpoint (No Auth)
```typescript
// server/api/v1/collections.get.ts
import { getSupabaseAdmin } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  // No requireAuth() call = public endpoint
  
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_public', true)
  
  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  
  return data
})
```

---

## API Versioning Structure

```
backend/server/api/
└── v1/
    ├── products.get.ts       → GET /api/v1/products
    ├── products.post.ts      → POST /api/v1/products
    ├── orders.get.ts         → GET /api/v1/orders
    ├── orders.post.ts        → POST /api/v1/orders
    └── collections.get.ts    → GET /api/v1/collections
```

**Always use versioned APIs** (`/api/v1/...`) to allow for future breaking changes without affecting existing clients.

---

## Shared Types

Import shared types in both frontend and backend:

```typescript
// Frontend
import { Product, User } from '../../../shared/types'

// Backend
import { Product, User } from '../../../shared/types'
```

---

## Testing

### 1. Test NextAuth Endpoint
```bash
curl http://localhost:3000/api/auth/signin
```

### 2. Test Protected Backend API (Should Fail)
```bash
curl http://localhost:3001/api/v1/products
# Expected: 401 Unauthorized
```

### 3. Test with Valid JWT
First, sign in and get the JWT token from the browser (DevTools → Application → Cookies → `next-auth.session-token`), then:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/api/v1/products
```

---

## Next Steps

1. ✅ Add environment variables to `.env` files
2. ✅ Replace placeholder `authorize` function in NextAuth route with Supabase logic
3. ✅ Test authentication flow
4. ✅ Create additional protected endpoints as needed
