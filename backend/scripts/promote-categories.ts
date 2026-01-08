#!/usr/bin/env tsx
// Script to promote level 2 categories to level 1
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing environment variables')
        process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Categories to promote to level 1 (by slug)
    const categoriesToPromote = [
        'smartphones',
        'audio',
        'laptops',
        'tablets',
        'computer-peripherals',
        'headphones-earbuds',
        'phone-accessories',
        'chargers',
        'gadgets'
    ]

    console.log('\n🔄 Promoting categories to level 1...\n')

    for (const slug of categoriesToPromote) {
        const { data, error } = await supabase
            .from('categories')
            .update({
                level: 1,
                parent_id: null
            })
            .eq('slug', slug)
            .select()
            .single()

        if (error) {
            console.error(`❌ Failed to promote ${slug}:`, error.message)
        } else if (data) {
            console.log(`✅ Promoted: ${data.name} (${slug})`)
        } else {
            console.log(`⚠️  Category not found: ${slug}`)
        }
    }

    console.log('\n✅ Done! Fetching updated category list...\n')

    // Fetch and display updated categories
    const { data: categories, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true })

    if (fetchError) {
        console.error('Error fetching categories:', fetchError)
        process.exit(1)
    }

    const level1 = categories?.filter(c => c.level === 1) || []
    const level2 = categories?.filter(c => c.level === 2) || []

    console.log(`📊 Updated Category Structure:`)
    console.log(`   Total categories: ${categories?.length || 0}`)
    console.log(`   Level 1 categories: ${level1.length}`)
    console.log(`   Level 2 categories: ${level2.length}\n`)

    console.log('Level 1 Categories:')
    level1.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.slug})`)
    })
}

main()
