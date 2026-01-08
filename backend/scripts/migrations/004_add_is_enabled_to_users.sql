-- Add is_enabled column to users table
alter table public.users 
add column if not exists is_enabled boolean not null default true;

-- Create index on is_enabled for faster queries
create index if not exists idx_users_is_enabled on public.users(is_enabled);

-- Update existing users to be enabled by default
update public.users set is_enabled = true where is_enabled is null;

-- Add comment to the column
comment on column public.users.is_enabled is 'Whether the user account is enabled and can access the system';
