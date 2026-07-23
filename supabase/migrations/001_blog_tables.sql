create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'VISITOR' check (role in ('ADMIN', 'VISITOR')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  cover_image_url text,
  published boolean not null default false,
  author_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  platform text not null check (platform in ('WHATSAPP', 'FACEBOOK', 'LINKEDIN', 'COPY_LINK')),
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_published_created_at on public.posts (published, created_at desc);
create index if not exists idx_posts_slug on public.posts (slug);
create index if not exists idx_likes_post_id on public.likes (post_id);
create index if not exists idx_shares_post_id on public.shares (post_id);
create index if not exists idx_comments_post_id on public.comments (post_id);
