create or replace function public.sync_catalog_category_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.catalog_items
  set category = new.name
  where category_id = new.id;
  return new;
end;
$$;

drop trigger if exists on_category_name_updated on public.categories;
create trigger on_category_name_updated
  after update of name on public.categories
  for each row
  when (old.name is distinct from new.name)
  execute procedure public.sync_catalog_category_name();
