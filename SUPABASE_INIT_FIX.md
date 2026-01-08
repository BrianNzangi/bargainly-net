# Supabase Initialization Fix

## Problem

Getting error: `Cannot access 'renderer$1' before initialization`

## Root Cause

The `supabaseAdmin` constant was trying to access `process.env` at module initialization time:

```typescript
// ❌ This causes initialization errors in Nuxt
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || '',
    { ... }
)
```

In Nuxt/Nitro, environment variables should be accessed through the runtime config, not `process.env` at module level.

## Solution

Changed `supabaseAdmin` from a constant to a **lazy getter function** `getSupabaseAdmin()`:

```typescript
// ✅ Lazy initialization using runtime config
let _supabaseAdmin: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
    if (!_supabaseAdmin) {
        const config = useRuntimeConfig()
        _supabaseAdmin = createClient(
            config.supabaseUrl,
            config.supabaseServiceKey,
            { ... }
        )
    }
    return _supabaseAdmin
}
```

## Updated Usage

### Before
```typescript
import { supabaseAdmin } from '../../utils/supabase'

const { data } = await supabaseAdmin.from('products').select('*')
```

### After
```typescript
import { getSupabaseAdmin } from '../../utils/supabase'

const supabase = getSupabaseAdmin()
const { data } = await supabase.from('products').select('*')
```

## Why This Works

1. **Lazy initialization**: The Supabase client is only created when first called, not at module load time
2. **Runtime config**: Uses `useRuntimeConfig()` which is available during request handling
3. **Singleton pattern**: The client is cached after first creation for performance

This pattern is the recommended approach for Nuxt/Nitro server utilities that need runtime configuration.
