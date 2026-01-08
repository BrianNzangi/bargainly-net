#!/usr/bin/env tsx
// Script to inspect and document database schema
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const TABLES = ['categories', 'guides', 'products', 'roles', 'users'];

async function getTableSchema(supabase: any, tableName: string) {
    // Get column information from information_schema
    const { data: columns, error } = await supabase
        .rpc('exec_sql', {
            query: `
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    character_maximum_length
                FROM information_schema.columns
                WHERE table_schema = 'public' 
                AND table_name = '${tableName}'
                ORDER BY ordinal_position;
            `
        });

    if (error) {
        // Fallback: Try to get a sample row to infer schema
        const { data: sample } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
            .single();

        if (sample) {
            return Object.keys(sample).map(key => ({
                column_name: key,
                data_type: typeof sample[key],
                value_sample: sample[key]
            }));
        }

        throw new Error(`Failed to get schema for ${tableName}: ${error.message}`);
    }

    return columns;
}

async function inspectDatabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing environment variables');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('🔍 Inspecting Database Schema\n');
    console.log('═'.repeat(80));

    for (const tableName of TABLES) {
        try {
            console.log(`\n📋 Table: ${tableName.toUpperCase()}`);
            console.log('─'.repeat(80));

            // Get row count
            const { count } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });

            console.log(`Rows: ${count || 0}\n`);

            // Get sample data
            const { data: samples } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);

            if (samples && samples.length > 0) {
                const sample = samples[0];
                console.log('Columns:');

                Object.entries(sample).forEach(([key, value]) => {
                    const type = value === null ? 'null' : typeof value;
                    const displayValue = value === null ? 'NULL' :
                        typeof value === 'object' ? JSON.stringify(value).substring(0, 50) :
                            String(value).substring(0, 50);

                    console.log(`  • ${key.padEnd(25)} ${type.padEnd(15)} ${displayValue}`);
                });
            } else {
                console.log('  (No data available)');
            }

        } catch (error: any) {
            console.error(`  ❌ Error: ${error.message}`);
        }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Schema inspection complete!\n');
}

inspectDatabase();
