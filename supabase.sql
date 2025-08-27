-- Run this in Supabase SQL editor

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content_json jsonb not null,
  cover_url text,
  author_id uuid references auth.users(id),
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row
execute function public.handle_updated_at();

alter table public.posts enable row level security;

create policy "read published" on public.posts
for select using (published = true);

create policy "insert own" on public.posts
for insert with check (auth.uid() = author_id or author_id is null);

create policy "update own" on public.posts
for update using (auth.uid() = author_id);

-- Storage bucket for images/gifs
-- Create a bucket named blog-media (public)
-- In Storage policies, allow public read, authenticated write.

-- Likes table for reactions
create table if not exists likes (
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

create policy "read likes" on public.likes for select using (true);
create policy "insert own like" on public.likes for insert with check (auth.uid() = user_id);
create policy "delete own like" on public.likes for delete using (auth.uid() = user_id);
