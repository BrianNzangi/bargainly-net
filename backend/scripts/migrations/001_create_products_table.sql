-- Create products table
create table if not exists public.products (
  id uuid not null default gen_random_uuid (),
  source text not null,
  external_id text not null,
  title text not null,
  brand text null,
  category text null,
  tags text[] null,
  images jsonb null,
  price_current numeric(10, 2) null,
  price_original numeric(10, 2) null,
  currency text null default 'USD'::text,
  product_url text null,
  affiliate_url text null,
  affiliate_network text null,
  availability text null,
  rating numeric(3, 2) null,
  total_ratings integer null,
  merchant_name text null,
  merchant_logo text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  raw_json jsonb null,
  constraint products_pkey primary key (id),
  constraint unique_product_source unique (external_id, source),
  constraint products_affiliate_network_check check (
    (
      affiliate_network = any (
        array[
          'amazon'::text,
          'awin'::text,
          'cj'::text,
          'impact'::text,
          'rakuten'::text,
          'manual'::text
        ]
      )
    )
  ),
  constraint products_availability_check check (
    (
      availability = any (
        array[
          'in_stock'::text,
          'out_of_stock'::text,
          'unknown'::text
        ]
      )
    )
  ),
  constraint products_source_check check (
    (
      source = any (
        array[
          'canopy'::text,
          'amazon'::text,
          'awin'::text,
          'cj'::text,
          'rakuten'::text,
          'impact'::text,
          'manual'::text
        ]
      )
    )
  )
);

-- Create indexes
create index if not exists idx_products_source on public.products using btree (source);
create index if not exists idx_products_category on public.products using btree (category);
create index if not exists idx_products_brand on public.products using btree (brand);
create index if not exists idx_products_availability on public.products using btree (availability);
create index if not exists idx_products_created_at on public.products using btree (created_at desc);
create index if not exists idx_products_title_search on public.products using gin (to_tsvector('english'::regconfig, title));

-- Create trigger function for updated_at if it doesn't exist
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger
drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at 
  before update on public.products 
  for each row 
  execute function update_updated_at_column();

-- Enable Row Level Security
alter table public.products enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Admin users can view all products" on public.products;
drop policy if exists "Admin users can insert products" on public.products;
drop policy if exists "Admin users can update products" on public.products;
drop policy if exists "Admin users can delete products" on public.products;

-- Policy: Admin users can view all products
create policy "Admin users can view all products"
on public.products
for select
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role in ('SUPER_ADMIN', 'ADMIN')
    and users.is_enabled = true
  )
);

-- Policy: Admin users can insert products
create policy "Admin users can insert products"
on public.products
for insert
with check (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role in ('SUPER_ADMIN', 'ADMIN')
    and users.is_enabled = true
  )
);

-- Policy: Admin users can update products
create policy "Admin users can update products"
on public.products
for update
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role in ('SUPER_ADMIN', 'ADMIN')
    and users.is_enabled = true
  )
);

-- Policy: Admin users can delete products
create policy "Admin users can delete products"
on public.products
for delete
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role in ('SUPER_ADMIN', 'ADMIN')
    and users.is_enabled = true
  )
);

-- Grant necessary permissions to authenticated users
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.products to authenticated;
