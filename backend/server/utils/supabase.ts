import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
    const config = useRuntimeConfig()

    return createClient(
        config.supabaseUrl,
        config.supabaseServiceKey,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        }
    )
}

// Lazy getter for supabaseAdmin to avoid initialization errors
let _supabaseAdmin: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
    if (!_supabaseAdmin) {
        const config = useRuntimeConfig()
        _supabaseAdmin = createClient(
            config.supabaseUrl,
            config.supabaseServiceKey,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        )
    }
    return _supabaseAdmin
}
