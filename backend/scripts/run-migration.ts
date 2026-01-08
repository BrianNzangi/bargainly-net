#!/usr/bin/env tsx
// Script to run database migrations
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env or .env.local
try {
    let envPath = join(process.cwd(), '.env.local');
    try {
        readFileSync(envPath, 'utf8');
    } catch {
        // Try parent directory
        envPath = join(process.cwd(), '..', '.env.local');
        try {
            readFileSync(envPath, 'utf8');
        } catch {
            envPath = join(process.cwd(), '.env');
        }
    }

    const envFile = readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
    console.log(`Loaded environment from ${envPath}`);
} catch (error) {
    console.error('Warning: Could not load environment file');
}

async function runMigration(migrationFile: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing required environment variables:');
        console.error('- SUPABASE_URL');
        console.error('- SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        const migrationPath = join(process.cwd(), 'scripts', 'migrations', migrationFile);
        const sql = readFileSync(migrationPath, 'utf8');

        console.log(`Running migration: ${migrationFile}`);
        console.log('Executing SQL...\n');

        // Split SQL by semicolons and execute each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

            if (error) {
                // If exec_sql RPC doesn't exist, try direct execution (this won't work for DDL in Supabase)
                console.error('Note: Direct SQL execution via RPC failed.');
                console.error('Please run this migration manually in the Supabase SQL Editor:');
                console.error('\n' + sql + '\n');
                throw error;
            }
        }

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.error('\nPlease run the following SQL manually in your Supabase SQL Editor:\n');
        const migrationPath = join(process.cwd(), 'scripts', 'migrations', migrationFile);
        const sql = readFileSync(migrationPath, 'utf8');
        console.log(sql);
        process.exit(1);
    }
}

const migrationFile = process.argv[2] || '001_create_users_table.sql';
runMigration(migrationFile);
