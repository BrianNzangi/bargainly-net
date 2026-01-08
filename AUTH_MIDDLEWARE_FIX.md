# Auth Middleware Fix

## Problem

The auth middleware was being applied to **all routes** globally, causing "Authorization header missing" errors on public endpoints.

## Root Cause

In Nuxt/Nitro, any file placed in `server/middleware/` automatically runs on **every single request** to the server. This is different from Next.js where middleware needs to be explicitly applied.

## Solution

Moved the auth logic from `server/middleware/auth.ts` to `server/utils/auth.ts` as a **composable function** called `requireAuth()`.

### Before (Middleware - Applied Globally)
```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // This runs on EVERY request
})
```

### After (Utility Function - Applied Selectively)
```typescript
// server/utils/auth.ts
export async function requireAuth(event: H3Event) {
  // Only runs when explicitly called
}
```

## Usage

### Protected Route
```typescript
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event) // ✅ Requires authentication
  
  // Protected logic here
})
```

### Public Route
```typescript
export default defineEventHandler(async (event) => {
  // No requireAuth() call = ✅ Public endpoint
  
  // Public logic here
})
```

## Key Takeaway

In Nuxt/Nitro:
- `server/middleware/` = **Global** (runs on every request)
- `server/utils/` = **Selective** (runs only when called)

For authentication, we want **selective** application, so we use a utility function instead of middleware.
