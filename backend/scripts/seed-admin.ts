#!/usr/bin/env tsx
// CLI script to seed admin users
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env
config();

interface User {
    id?: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'EDITOR' | 'VIEWER' | 'MARKETING';
    is_enabled: boolean;
}

async function seedSuperadmin(supabase: any) {
    const adminUser: User = {
        email: 'admin@workit.com',
        name: 'Super Admin',
        role: 'ADMIN',
        is_enabled: true
    };

    // Check if admin already exists
    const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminUser.email)
        .single();

    if (existing) {
        console.log('⚠️  Admin user already exists:', adminUser.email);
        return existing;
    }

    // Create admin user
    const { data, error } = await supabase
        .from('users')
        .insert([adminUser])
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create admin user: ${error.message}`);
    }

    console.log('✅ Created admin user:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   Enabled:', adminUser.is_enabled);
    return data;
}

async function seedMarketingAdmin(supabase: any) {
    const marketingUser: User = {
        email: 'marketing@workit.com',
        name: 'Marketing Admin',
        role: 'MARKETING',
        is_enabled: true
    };

    const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', marketingUser.email)
        .single();

    if (existing) {
        console.log('⚠️  Marketing user already exists:', marketingUser.email);
        return existing;
    }

    const { data, error } = await supabase
        .from('users')
        .insert([marketingUser])
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create marketing user: ${error.message}`);
    }

    console.log('✅ Created marketing user:', marketingUser.email);
    return data;
}

async function verifySuperadmin(supabase: any) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@workit.com')
        .eq('role', 'ADMIN')
        .single();

    if (error || !data) {
        console.log('❌ Superadmin not found or invalid');
        return false;
    }

    console.log('✅ Superadmin verified:');
    console.log('   Email:', data.email);
    console.log('   Role:', data.role);
    console.log('   Enabled:', data.is_enabled);
    return true;
}

async function resetSuperadmin(supabase: any) {
    // Delete existing admin
    await supabase
        .from('users')
        .delete()
        .eq('email', 'admin@workit.com');

    console.log('🗑️  Deleted existing admin user');

    // Create new admin
    await seedSuperadmin(supabase);
}

async function listAdmins(supabase: any) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['ADMIN', 'EDITOR', 'MARKETING'])
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to list admins: ${error.message}`);
    }

    console.log('\n📋 Admin Users:');
    console.log('─'.repeat(80));

    if (!data || data.length === 0) {
        console.log('No admin users found');
        return;
    }

    data.forEach((user: any) => {
        console.log(`\n${user.name || 'Unnamed'}`);
        console.log(`  Email:   ${user.email}`);
        console.log(`  Role:    ${user.role}`);
        console.log(`  Enabled: ${user.is_enabled ? '✅' : '❌'}`);
        console.log(`  Created: ${new Date(user.created_at).toLocaleDateString()}`);
    });
    console.log('\n' + '─'.repeat(80));
}

async function main() {
    const command = process.argv[2];

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing required environment variables:');
        console.error('   - SUPABASE_URL');
        console.error('   - SUPABASE_SERVICE_ROLE_KEY');
        console.error('');
        console.error('Make sure .env file exists with these variables.');
        process.exit(1);
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        switch (command) {
            case 'seed':
                console.log('🌱 Seeding superadmin user...');
                await seedSuperadmin(supabase);
                break;

            case 'seed-marketing':
                console.log('🌱 Seeding marketing admin user...');
                await seedMarketingAdmin(supabase);
                break;

            case 'verify':
                console.log('🔍 Verifying superadmin...');
                const isValid = await verifySuperadmin(supabase);
                process.exit(isValid ? 0 : 1);
                break;

            case 'reset':
                console.log('🔄 Resetting superadmin...');
                await resetSuperadmin(supabase);
                break;

            case 'list':
                console.log('📋 Listing admin users...');
                await listAdmins(supabase);
                break;

            default:
                console.log('Usage: tsx scripts/seed-admin.ts <command>');
                console.log('');
                console.log('Commands:');
                console.log('  seed            - Create the superadmin user (admin@workit.com)');
                console.log('  seed-marketing  - Create the marketing admin user');
                console.log('  verify          - Check if superadmin exists and has correct role');
                console.log('  reset           - Delete and recreate superadmin user');
                console.log('  list            - List all admin, editor, and marketing users');
                process.exit(1);
        }

        console.log('\n✅ Operation completed successfully!');
    } catch (error) {
        console.error('\n❌ Operation failed:', error);
        process.exit(1);
    }
}

main();

