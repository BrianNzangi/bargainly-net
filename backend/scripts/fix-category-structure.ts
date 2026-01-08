#!/usr/bin/env tsx
// Script to fix category structure issues
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

    console.log('\n🔧 Fixing Category Structure...\n')

    // Step 1: Fix "Computers" category - remove parent_id
    console.log('Step 1: Fixing "Computers" category data inconsistency...')
    const { data: computersData, error: computersError } = await supabase
        .from('categories')
        .update({ parent_id: null })
        .eq('name', 'Computers')
        .eq('level', 1)
        .select()

    if (computersError) {
        console.error('❌ Failed to fix Computers category:', computersError.message)
    } else if (computersData && computersData.length > 0) {
        console.log(`✅ Fixed "Computers" category - removed parent_id`)
    } else {
        console.log('⚠️  No "Computers" category found to fix')
    }

    // Step 2: Promote level 2 categories to level 1
    console.log('\nStep 2: Promoting level 2 categories to level 1...')

    const categoriesToPromote = ['Gadgets', 'Phone Accessories', 'Audio']

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

    // Step 3: Verify final state
    console.log('\n📊 Verifying final category structure...\n')

    const { data: allCategories, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('level', { ascending: true })
        .order('name', { ascending: true })

    if (fetchError) {
        console.error('❌ Failed to fetch categories:', fetchError.message)
        process.exit(1)
    }

    const level1 = allCategories?.filter(c => c.level === 1) || []
    const level2 = allCategories?.filter(c => c.level === 2) || []
    const inconsistent = level1.filter(c => c.parent_id !== null)

    console.log(`Total categories: ${allCategories?.length || 0}`)
    console.log(`Level 1 categories: ${level1.length}`)
    console.log(`Level 2 categories: ${level2.length}`)

    if (inconsistent.length > 0) {
        console.log(`\n⚠️  WARNING: ${inconsistent.length} level 1 categories still have parent_id set:`)
        inconsistent.forEach(c => {
            console.log(`   - ${c.name} (parent_id: ${c.parent_id})`)
        })
    } else {
        console.log('\n✅ All level 1 categories have parent_id = null')
    }

    console.log('\nLevel 1 Categories:')
    level1.forEach(c => {
        console.log(`  - ${c.name}`)
    })

    if (level2.length > 0) {
        console.log('\nLevel 2 Categories:')
        level2.forEach(c => {
            const parent = allCategories?.find(p => p.id === c.parent_id)
            console.log(`  - ${c.name} (under ${parent?.name || 'unknown'})`)
        })
    }

    console.log('\n✅ Category structure fix completed!')
}

main()
