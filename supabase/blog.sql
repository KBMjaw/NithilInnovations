-- Nithil Innovations blog – run once in Supabase (SQL Editor) or via migration.
-- Steps: 1) create the admin user in Authentication > Users (email + password)
--        2) run this script  3) disable public sign-ups (Authentication > Providers > Email).

create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  excerpt       text,
  content       text not null default '',
  cover_image   text,
  status        text not null default 'draft' check (status in ('draft','published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists posts_status_published_idx on public.posts (status, published_at desc);

create table if not exists public.blog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_blog_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.blog_admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;
alter table public.blog_admins enable row level security;

drop policy if exists "read published or admin" on public.posts;
create policy "read published or admin" on public.posts for select to anon, authenticated
  using (status = 'published' or public.is_blog_admin());
drop policy if exists "admin insert" on public.posts;
create policy "admin insert" on public.posts for insert to authenticated with check (public.is_blog_admin());
drop policy if exists "admin update" on public.posts;
create policy "admin update" on public.posts for update to authenticated using (public.is_blog_admin()) with check (public.is_blog_admin());
drop policy if exists "admin delete" on public.posts;
create policy "admin delete" on public.posts for delete to authenticated using (public.is_blog_admin());

drop policy if exists "read own admin row" on public.blog_admins;
create policy "read own admin row" on public.blog_admins for select to authenticated using (user_id = auth.uid());

-- Image storage (public read, admin-only write)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

drop policy if exists "admin upload blog images" on storage.objects;
create policy "admin upload blog images" on storage.objects for insert to authenticated
  with check (bucket_id = 'blog-images' and public.is_blog_admin());
drop policy if exists "admin update blog images" on storage.objects;
create policy "admin update blog images" on storage.objects for update to authenticated
  using (bucket_id = 'blog-images' and public.is_blog_admin());
drop policy if exists "admin delete blog images" on storage.objects;
create policy "admin delete blog images" on storage.objects for delete to authenticated
  using (bucket_id = 'blog-images' and public.is_blog_admin());

-- Make the admin user an admin (change the email, run AFTER creating the user):
-- insert into public.blog_admins (user_id) select id from auth.users where email = 'nithilinnovation@gmail.com';
