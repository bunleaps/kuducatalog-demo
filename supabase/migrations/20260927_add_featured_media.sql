alter table public.catalog_items add column if not exists featured_media text;

update public.catalog_items
set featured_media = media[1]
where featured_media is null and cardinality(media) > 0;
