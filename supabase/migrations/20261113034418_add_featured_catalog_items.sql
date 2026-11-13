alter table if exists public.catalog_items
add column if not exists is_featured boolean not null default false;

create index if not exists catalog_items_featured_created_idx
on public.catalog_items (is_featured desc, created_at desc)
where is_published = true;
