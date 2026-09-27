create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Other',
  description text not null default '',
  availability text not null default 'available' check (availability in ('available', 'limited', 'unavailable')),
  media text[] not null default '{}',
  featured_media text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.catalog_items add column if not exists featured_media text;
update public.catalog_items
set featured_media = media[1]
where featured_media is null and cardinality(media) > 0;

alter table public.catalog_items enable row level security;
create policy "Published catalog is public" on public.catalog_items for select using (is_published = true);
create policy "Authenticated admins can read all items" on public.catalog_items for select to authenticated using (true);
create policy "Authenticated admins can create items" on public.catalog_items for insert to authenticated with check (true);
create policy "Authenticated admins can update items" on public.catalog_items for update to authenticated using (true) with check (true);
create policy "Authenticated admins can delete items" on public.catalog_items for delete to authenticated using (true);

insert into storage.buckets (id, name, public) values ('catalog-media', 'catalog-media', true) on conflict (id) do nothing;
create policy "Public can view catalog media" on storage.objects for select using (bucket_id = 'catalog-media');
create policy "Authenticated admins can upload catalog media" on storage.objects for insert to authenticated with check (bucket_id = 'catalog-media');
create policy "Authenticated admins can update catalog media" on storage.objects for update to authenticated using (bucket_id = 'catalog-media');
create policy "Authenticated admins can delete catalog media" on storage.objects for delete to authenticated using (bucket_id = 'catalog-media');
