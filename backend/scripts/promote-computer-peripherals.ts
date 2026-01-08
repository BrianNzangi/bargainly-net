#!/usr/bin/env tsx
// Final fix to promote Computer Peripherals to level 1
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing environment variables')
        process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('\n🔧 Promoting Computer Peripherals to level 1...\n')

    const { data, error } = await supabase
        .from('categories')
        .update({
            level: 1,
            parent_id: null
        })
        .eq('name', 'Computer Peripherals')
        .select()

    if (error) {
        console.error(`❌ Failed:`, error.message)
    } else if (data && data.length > 0) {
        console.log(`✅ Promoted "Computer Peripherals" to level 1`)
    }

    // Final verification
    const { data: all } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    const level1 = all?.filter(c => c.level === 1) || []
    console.log(`\n✅ Final state: ${level1.length} level 1 categories`)
}

main()
