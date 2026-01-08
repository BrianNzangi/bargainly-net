#!/usr/bin/env tsx
// CLI script to seed the required categories
import { createClient } from '@supabase/supabase-js';
import { CategoriesSeeder } from '../src/lib/database/seeders/categories-seeder';
import { Database } from '../src/lib/supabase/types';

async function main() {
  const command = process.argv[2];
  
  // Get Supabase credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Create Supabase client with service role key
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const seeder = new CategoriesSeeder(supabase);

  try {
    switch (command) {
      case 'seed':
        console.log('🌱 Seeding categories...');
        await seeder.seedCategories();
        break;

      case 'verify':
        console.log('🔍 Verifying categories...');
        const isValid = await seeder.verifyCategories();
        process.exit(isValid ? 0 : 1);
        break;

      case 'reset':
        console.log('🔄 Resetting categories...');
        await seeder.resetCategories();
        break;

      case 'list':
        console.log('📋 Listing required categories...');
        const categories = await seeder.getRequiredCategories();
        console.table(categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description?.substring(0, 50) + '...'
        })));
        break;

      default:
        console.log('Usage: npm run seed:categories <command>');
        console.log('');
        console.log('Commands:');
        console.log('  seed    - Create the required categories');
        console.log('  verify  - Check if all required categories exist');
        console.log('  reset   - Delete all categories and recreate required ones');
        console.log('  list    - List all required categories');
        process.exit(1);
    }

    console.log('✅ Operation completed successfully!');
  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  }
}

main();