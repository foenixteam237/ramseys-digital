-- Categories for blog posts
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.posts
  add column if not exists category_id uuid references public.categories(id) on delete set null;

create index if not exists idx_posts_category_id on public.posts (category_id);

-- Media library (uploaded files metadata)
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  url text not null,
  size_bytes bigint,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_media_created_at on public.media (created_at desc);

-- Static pages (About, Terms, etc.)
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pages_slug on public.pages (slug);

-- Storage bucket for media uploads. This app authenticates with a custom
-- users table (not Supabase Auth), so all reads/writes go through the
-- anon/publishable key, same as every other table in this project.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public read media" on storage.objects
  for select using (bucket_id = 'media');

create policy "Anon can upload media" on storage.objects
  for insert with check (bucket_id = 'media');

create policy "Anon can delete media" on storage.objects
  for delete using (bucket_id = 'media');
