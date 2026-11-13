-- Keep privileged helper and trigger functions out of the exposed Data API schema.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

alter function public.handle_new_user() set schema private;
alter function public.is_admin() set schema private;
alter function public.is_customer() set schema private;
alter function public.sync_catalog_category_name() set schema private;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.sync_catalog_category_name() from public, anon, authenticated;

revoke all on function private.is_admin() from public, anon, authenticated;
revoke all on function private.is_customer() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_customer() to authenticated;

-- The share RPC is intentionally exposed to signed-out visitors. Keep its grants
-- explicit so it is the only SECURITY DEFINER function in the public API surface.
revoke all on function public.get_shared_project_set(uuid) from public;
grant execute on function public.get_shared_project_set(uuid) to anon, authenticated;

-- Add covering indexes for foreign keys used by joins, deletes, and RLS checks.
create index if not exists catalog_items_category_id_idx
  on public.catalog_items (category_id);

create index if not exists favorites_catalog_item_id_idx
  on public.favorites (catalog_item_id);

create index if not exists project_set_items_catalog_item_id_idx
  on public.project_set_items (catalog_item_id);

create index if not exists project_set_shares_owner_id_idx
  on public.project_set_shares (owner_id);

create index if not exists project_sets_user_id_idx
  on public.project_sets (user_id);

-- Cache auth.uid() once per statement in favorites policies.
drop policy if exists "Customers can view their favorites" on public.favorites;
create policy "Customers can view their favorites"
on public.favorites for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Customers can add their favorites" on public.favorites;
create policy "Customers can add their favorites"
on public.favorites for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Customers can remove their favorites" on public.favorites;
create policy "Customers can remove their favorites"
on public.favorites for delete to authenticated
using ((select auth.uid()) = user_id);

-- Use one SELECT policy per role and table to avoid evaluating overlapping
-- permissive policies for every returned row.
drop policy if exists "Published catalog is public" on public.catalog_items;
drop policy if exists "Admins can read all catalog items" on public.catalog_items;

create policy "Published catalog is public"
on public.catalog_items for select to anon
using (is_published = true);

create policy "Authenticated users can read permitted catalog items"
on public.catalog_items for select to authenticated
using (is_published = true or (select private.is_admin()));

drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Users can read their own profile" on public.profiles;

create policy "Users can read permitted profiles"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "Admins can read all project set items" on public.project_set_items;
drop policy if exists "Customers can read their own set items" on public.project_set_items;

create policy "Users can read permitted project set items"
on public.project_set_items for select to authenticated
using (
  (select private.is_admin())
  or (
    (select private.is_customer())
    and exists (
      select 1
      from public.project_sets
      where project_sets.id = project_set_items.project_set_id
        and project_sets.user_id = (select auth.uid())
    )
  )
);

-- Split the old ALL policy so SELECT can combine customer ownership and admin
-- visibility without creating overlapping permissive policies.
drop policy if exists "Customers can manage their own project sets" on public.project_sets;
drop policy if exists "Admins can read all project sets" on public.project_sets;

create policy "Users can read permitted project sets"
on public.project_sets for select to authenticated
using (
  (select private.is_admin())
  or (
    (select private.is_customer())
    and user_id = (select auth.uid())
  )
);

create policy "Customers can create their own project sets"
on public.project_sets for insert to authenticated
with check (
  (select private.is_customer())
  and user_id = (select auth.uid())
);

create policy "Customers can update their own project sets"
on public.project_sets for update to authenticated
using (
  (select private.is_customer())
  and user_id = (select auth.uid())
)
with check (
  (select private.is_customer())
  and user_id = (select auth.uid())
);

create policy "Customers can delete their own project sets"
on public.project_sets for delete to authenticated
using (
  (select private.is_customer())
  and user_id = (select auth.uid())
);
