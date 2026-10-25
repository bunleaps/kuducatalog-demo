create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80 and name = btrim(name)),
  normalized_name text generated always as (lower(btrim(name))) stored unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "Categories are public" on public.categories;
create policy "Categories are public" on public.categories for select using (true);

drop policy if exists "Admins can create categories" on public.categories;
drop policy if exists "Admins can update categories" on public.categories;
drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can create categories" on public.categories for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update categories" on public.categories for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete categories" on public.categories for delete to authenticated using ((select public.is_admin()));

insert into public.categories (name)
select min(btrim(category))
from public.catalog_items
where nullif(btrim(category), '') is not null
group by lower(btrim(category))
on conflict (normalized_name) do nothing;

alter table public.catalog_items
add column if not exists category_id uuid references public.categories(id) on delete restrict;

update public.catalog_items item
set category_id = category.id,
    category = category.name
from public.categories category
where lower(btrim(item.category)) = category.normalized_name;
