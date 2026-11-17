drop policy if exists "Customers can add available items to their own sets"
on public.project_set_items;

create policy "Customers can add quotable items to their own sets"
on public.project_set_items for insert to authenticated
with check (
  (select private.is_customer())
  and exists (
    select 1
    from public.project_sets
    where project_sets.id = project_set_id
      and project_sets.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.catalog_items
    where catalog_items.id = catalog_item_id
      and catalog_items.is_published = true
      and catalog_items.availability in ('available', 'limited')
  )
);
