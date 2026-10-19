create or replace function public.is_customer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'customer'
  );
$$;

drop policy if exists "Users can manage their own project sets" on public.project_sets;
create policy "Customers can manage their own project sets" on public.project_sets for all to authenticated using (
  (select auth.uid()) = user_id and (select public.is_customer())
) with check (
  (select auth.uid()) = user_id and (select public.is_customer())
);

drop policy if exists "Users can read their own set items" on public.project_set_items;
drop policy if exists "Users can add available items to their own sets" on public.project_set_items;
drop policy if exists "Users can update their own set items" on public.project_set_items;
drop policy if exists "Users can delete their own set items" on public.project_set_items;

create policy "Customers can read their own set items" on public.project_set_items for select to authenticated using (
  (select public.is_customer()) and exists (
    select 1 from public.project_sets where id = project_set_id and user_id = (select auth.uid())
  )
);
create policy "Customers can add available items to their own sets" on public.project_set_items for insert to authenticated with check (
  (select public.is_customer()) and exists (
    select 1 from public.project_sets where id = project_set_id and user_id = (select auth.uid())
  ) and exists (
    select 1 from public.catalog_items where id = catalog_item_id and is_published = true and availability = 'available'
  )
);
create policy "Customers can update their own set items" on public.project_set_items for update to authenticated using (
  (select public.is_customer()) and exists (
    select 1 from public.project_sets where id = project_set_id and user_id = (select auth.uid())
  )
) with check (
  (select public.is_customer()) and exists (
    select 1 from public.project_sets where id = project_set_id and user_id = (select auth.uid())
  )
);
create policy "Customers can delete their own set items" on public.project_set_items for delete to authenticated using (
  (select public.is_customer()) and exists (
    select 1 from public.project_sets where id = project_set_id and user_id = (select auth.uid())
  )
);
