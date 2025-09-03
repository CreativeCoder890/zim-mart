-- suppliers
create table if not exists public.suppliers (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	phone text,
	whatsapp text,
	city text,
	address text,
	kyc_status text not null default 'pending',
	created_at timestamptz default now()
);

-- categories
create table if not exists public.categories (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	slug text unique not null
);

-- products
create table if not exists public.products (
	id uuid primary key default gen_random_uuid(),
	supplier_id uuid references public.suppliers(id) on delete cascade,
	name text not null,
	slug text unique not null,
	description text,
	price_usd numeric(12,2) not null,
	sku text,
	stock integer not null default 0,
	category_id uuid references public.categories(id) on delete set null,
	images jsonb default '[]'::jsonb,
	active boolean default true,
	created_at timestamptz default now()
);

-- orders
create table if not exists public.orders (
	id uuid primary key default gen_random_uuid(),
	order_number bigserial,
	buyer_name text not null,
	buyer_phone text not null,
	city text not null,
	address text not null,
	payment_method text not null,
	payment_status text not null default 'pending',
	currency text not null default 'USD',
	subtotal_usd numeric(12,2) not null,
	delivery_fee_usd numeric(12,2) not null default 0,
	total_usd numeric(12,2) not null,
	status text not null default 'created',
	created_at timestamptz default now()
);

-- order_items
create table if not exists public.order_items (
	id uuid primary key default gen_random_uuid(),
	order_id uuid references public.orders(id) on delete cascade,
	product_id uuid references public.products(id),
	supplier_id uuid references public.suppliers(id),
	quantity integer not null check (quantity > 0),
	unit_price_usd numeric(12,2) not null,
	status text not null default 'created'
);

create index if not exists products_slug_idx on public.products (slug);
create index if not exists categories_slug_idx on public.categories (slug);
create index if not exists orders_order_number_idx on public.orders (order_number);

alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy if not exists "public can read products" on public.products
for select using (active = true);

create policy if not exists "public can read categories" on public.categories
for select using (true);

