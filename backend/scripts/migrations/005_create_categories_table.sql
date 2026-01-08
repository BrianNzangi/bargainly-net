-- Create categories table
create table if not exists public.categories (
  id uuid not null default gen_random_uuid (),
  name character varying(255) not null,
  slug character varying(255) not null,
  meta_title text null,
  meta_description text null,
  keywords text null,
  seo_content text null,
  level integer null default 1,
  parent_id uuid null,
  sort_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  l2_categories text null,
  image_url text null,
  product_count integer null default 0,
  constraint categories_pkey primary key (id),
  constraint categories_slug_key unique (slug),
  constraint categories_parent_id_fkey foreign key (parent_id) references categories (id) on delete cascade,
  constraint categories_level_check check ((level = any (array[1, 2]))),
  constraint check_level2_has_parent check (
    (
      (level = 1)
      or (
        (level = 2)
        and (parent_id is not null)
      )
    )
  )
) tablespace pg_default;

-- Create indexes
create index if not exists idx_categories_slug on public.categories using btree (slug) tablespace pg_default;

create index if not exists idx_categories_level on public.categories using btree (level) tablespace pg_default;

create index if not exists idx_categories_parent_id on public.categories using btree (parent_id) tablespace pg_default;

create index if not exists idx_categories_sort_order on public.categories using btree (sort_order) tablespace pg_default;

-- Create trigger function for updated_at if it doesn't exist (reuse from products table)
-- The function should already exist from the products migration
-- If not, uncomment the following:
-- create or replace function update_updated_at_column()
-- returns trigger as $$
-- begin
--   new.updated_at = now();
--   return new;
-- end;
-- $$ language plpgsql;

-- Create trigger for updated_at
drop trigger if exists update_categories_updated_at on public.categories;
create trigger update_categories_updated_at 
  before update on public.categories 
  for each row 
  execute function update_updated_at_column();

-- Enable Row Level Security
alter table public.categories enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Public can view categories" on public.categories;
drop policy if exists "Admin users can manage categories" on public.categories;

-- Policy: Public can view all categories
create policy "Public can view categories"
on public.categories
for select
using (true);

-- Policy: Admin users can insert, update, delete categories
create policy "Admin users can manage categories"
on public.categories
for all
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role in ('SUPER_ADMIN', 'ADMIN')
    and users.is_enabled = true
  )
);

-- Grant necessary permissions
grant usage on schema public to authenticated, anon;
grant select on public.categories to authenticated, anon;
grant insert, update, delete on public.categories to authenticated;
