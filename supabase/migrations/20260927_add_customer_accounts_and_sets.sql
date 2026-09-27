create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

-- This keeps the account(s) that existed before public registration as admins.
insert into public.profiles (id, role)
select id, 'admin' from auth.users
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'customer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.project_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_set_items (
  id uuid primary key default gen_random_uuid(),
  project_set_id uuid not null references public.project_sets(id) on delete cascade,
  catalog_item_id uuid not null references public.catalog_items(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (project_set_id, catalog_item_id)
);

alter table public.profiles enable row level security;
alter table public.project_sets enable row level security;
alter table public.project_set_items enable row level security;

create policy "Users can read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can manage their own project sets" on public.project_sets for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can read their own set items" on public.project_set_items for select to authenticated using (
  exists (select 1 from public.project_sets where id = project_set_id and user_id = (select auth.uid()))
);
create policy "Users can add available items to their own sets" on public.project_set_items for insert to authenticated with check (
  exists (select 1 from public.project_sets where id = project_set_id and user_id = (select auth.uid()))
  and exists (select 1 from public.catalog_items where id = catalog_item_id and is_published = true and availability = 'available')
);
create policy "Users can update their own set items" on public.project_set_items for update to authenticated using (
  exists (select 1 from public.project_sets where id = project_set_id and user_id = (select auth.uid()))
) with check (
  exists (select 1 from public.project_sets where id = project_set_id and user_id = (select auth.uid()))
);
create policy "Users can delete their own set items" on public.project_set_items for delete to authenticated using (
  exists (select 1 from public.project_sets where id = project_set_id and user_id = (select auth.uid()))
);

drop policy if exists "Authenticated admins can read all items" on public.catalog_items;
drop policy if exists "Authenticated admins can create items" on public.catalog_items;
drop policy if exists "Authenticated admins can update items" on public.catalog_items;
drop policy if exists "Authenticated admins can delete items" on public.catalog_items;
create policy "Admins can read all catalog items" on public.catalog_items for select to authenticated using (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);
create policy "Admins can create catalog items" on public.catalog_items for insert to authenticated with check (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);
create policy "Admins can update catalog items" on public.catalog_items for update to authenticated using (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
) with check (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);
create policy "Admins can delete catalog items" on public.catalog_items for delete to authenticated using (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);

drop policy if exists "Authenticated admins can upload catalog media" on storage.objects;
drop policy if exists "Authenticated admins can update catalog media" on storage.objects;
drop policy if exists "Authenticated admins can delete catalog media" on storage.objects;
create policy "Admins can upload catalog media" on storage.objects for insert to authenticated with check (
  bucket_id = 'catalog-media' and exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);
create policy "Admins can update catalog media" on storage.objects for update to authenticated using (
  bucket_id = 'catalog-media' and exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);
create policy "Admins can delete catalog media" on storage.objects for delete to authenticated using (
  bucket_id = 'catalog-media' and exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);
