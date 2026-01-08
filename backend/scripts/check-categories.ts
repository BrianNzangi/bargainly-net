#!/usr/bin/env tsx
// Script to check current category structure
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function main() {
    const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NUXT_SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing environment variables')
        process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all categories
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true })

    if (error) {
        console.error('Error fetching categories:', error)
        process.exit(1)
    }

    console.log('\n📊 Category Structure:\n')
    console.log(`Total categories: ${categories?.length || 0}\n`)

    // Group by level
    const level1 = categories?.filter(c => c.level === 1) || []
    const level2 = categories?.filter(c => c.level === 2) || []

    console.log(`Level 1 categories: ${level1.length}`)
    level1.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.slug})`)
        console.log(`    ID: ${cat.id}`)
        console.log(`    Parent ID: ${cat.parent_id || 'null'}`)
        console.log(`    Product Count: ${cat.product_count}`)

        // Show children
        const children = level2.filter(c => c.parent_id === cat.id)
        if (children.length > 0) {
            console.log(`    Children (${children.length}):`)
            children.forEach(child => {
                console.log(`      - ${child.name} (${child.slug})`)
            })
        }
        console.log('')
    })

    console.log(`\nLevel 2 categories without parent: ${level2.filter(c => !c.parent_id).length}`)
    const orphans = level2.filter(c => !c.parent_id)
    if (orphans.length > 0) {
        console.log('Orphaned level 2 categories:')
        orphans.forEach(cat => {
            console.log(`  - ${cat.name} (${cat.slug})`)
        })
    }
}

main()
