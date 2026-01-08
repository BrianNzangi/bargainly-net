import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://samaiyifzjsyjehxtvyj.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function addCategoryIdColumn() {
    console.log('Adding category_id column to products table...')

    const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
      -- Add category_id column to products table
      ALTER TABLE public.products 
      ADD COLUMN IF NOT EXISTS category_id uuid NULL;

      -- Add foreign key constraint to categories table
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_products_category'
        ) THEN
          ALTER TABLE public.products
          ADD CONSTRAINT fk_products_category
          FOREIGN KEY (category_id) 
          REFERENCES public.categories(id)
          ON DELETE SET NULL;
        END IF;
      END $$;

      -- Create index on category_id for better query performance
      CREATE INDEX IF NOT EXISTS idx_products_category_id 
      ON public.products USING btree (category_id);
    `
    })

    if (error) {
        console.error('Error adding category_id column:', error)
        process.exit(1)
    }

    console.log('Successfully added category_id column to products table')
}

addCategoryIdColumn()
