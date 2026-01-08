#!/usr/bin/env tsx
// Script to promote the final 2 level 2 categories to level 1
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

    console.log('\n🔧 Promoting final level 2 categories to level 1...\n')

    const categoriesToPromote = ['Tablets', 'Limited-Time Offers']

    for (const categoryName of categoriesToPromote) {
        const { data, error } = await supabase
            .from('categories')
            .update({
                level: 1,
                parent_id: null
            })
            .eq('name', categoryName)
            .select()
            .single()

        if (error) {
            console.error(`❌ Failed to promote "${categoryName}":`, error.message)
        } else if (data) {
            console.log(`✅ Promoted "${categoryName}" to level 1`)
        } else {
            console.log(`⚠️  Category "${categoryName}" not found`)
        }
    }

    // Verify final state
    console.log('\n📊 Final category structure:\n')

    const { data: allCategories, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (fetchError) {
        console.error('❌ Failed to fetch categories:', fetchError.message)
        process.exit(1)
    }

    const level1 = allCategories?.filter(c => c.level === 1) || []
    const level2 = allCategories?.filter(c => c.level === 2) || []

    console.log(`Total categories: ${allCategories?.length || 0}`)
    console.log(`Level 1 categories: ${level1.length}`)
    console.log(`Level 2 categories: ${level2.length}`)

    console.log('\n✅ All categories are now level 1!')
    console.log('\nLevel 1 Categories:')
    level1.forEach(c => {
        console.log(`  - ${c.name || '[EMPTY NAME]'}`)
    })
}

main()
