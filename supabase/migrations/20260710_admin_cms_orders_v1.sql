-- rinnoz Admin CMS + Orders v1 — 2026-07-10
create extension if not exists pgcrypto;

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  site text not null,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(site, key)
);

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  site text not null,
  slug text not null,
  name text not null,
  description text not null default '',
  price_label text not null default '',
  currency text not null default 'USD/IDR',
  active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(site, slug)
);

create table if not exists story_steps (
  id uuid primary key default gen_random_uuid(),
  site text not null,
  slug text not null,
  step_index integer not null,
  title text not null,
  body text not null default '',
  image_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(site, slug, step_index)
);

create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  site text not null,
  title text not null,
  alt text not null default '',
  storage_path text null,
  public_url text null,
  width integer null,
  height integer null,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_requests (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  site text not null,
  status text not null default 'new',
  client_name text not null,
  client_email text null,
  contact_method text not null default '',
  contact_value text not null default '',
  package_slug text null,
  package_snapshot jsonb not null default '{}'::jsonb,
  brief jsonb not null default '{}'::jsonb,
  brief_hash text not null,
  source text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references order_requests(id) on delete cascade,
  event_type text not null,
  from_status text null,
  to_status text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references order_requests(id) on delete set null,
  site text not null,
  email_type text not null,
  recipient text not null,
  status text not null,
  provider_message_id text null,
  error_message text null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null,
  unique(order_id, email_type, recipient)
);

create index if not exists order_requests_site_created_idx on order_requests(site, created_at desc);
create index if not exists order_requests_site_status_idx on order_requests(site, status);

alter table site_settings enable row level security;
alter table packages enable row level security;
alter table story_steps enable row level security;
alter table images enable row level security;
alter table order_requests enable row level security;
alter table order_events enable row level security;
alter table email_events enable row level security;

-- No anon policies: browser never reads/writes tables directly. Next.js route handlers use server-side service role only.
