#!/usr/bin/env tsx
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
try {
    const envPath = join(process.cwd(), '.env.local');
    const envFile = readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
            process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
    });
} catch (e) {
    console.error('Could not load .env.local');
}

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing env vars');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Testing exec_sql RPC...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1;' });

    if (error) {
        console.error('RPC Failed:', error);
    } else {
        console.log('RPC Success:', data);
    }
}

main();
