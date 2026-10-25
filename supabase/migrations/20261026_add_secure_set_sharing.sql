create table if not exists public.project_set_shares (
  id uuid primary key default gen_random_uuid(),
  project_set_id uuid not null unique references public.project_sets(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.project_set_shares enable row level security;

drop policy if exists "Owners can read their set share links" on public.project_set_shares;
create policy "Owners can read their set share links"
on public.project_set_shares for select to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.project_sets
    where project_sets.id = project_set_id
      and project_sets.user_id = (select auth.uid())
  )
);

drop policy if exists "Owners can create set share links" on public.project_set_shares;
create policy "Owners can create set share links"
on public.project_set_shares for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.project_sets
    where project_sets.id = project_set_id
      and project_sets.user_id = (select auth.uid())
  )
);

drop policy if exists "Owners can update their set share links" on public.project_set_shares;
create policy "Owners can update their set share links"
on public.project_set_shares for update to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.project_sets
    where project_sets.id = project_set_id
      and project_sets.user_id = (select auth.uid())
  )
)
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.project_sets
    where project_sets.id = project_set_id
      and project_sets.user_id = (select auth.uid())
  )
);

drop policy if exists "Owners can delete their set share links" on public.project_set_shares;
create policy "Owners can delete their set share links"
on public.project_set_shares for delete to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.project_sets
    where project_sets.id = project_set_id
      and project_sets.user_id = (select auth.uid())
  )
);

create or replace function public.get_shared_project_set(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', project_sets.id,
    'title', project_sets.title,
    'created_at', project_sets.created_at,
    'items', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', project_set_items.id,
          'quantity', project_set_items.quantity,
          'title', catalog_items.title,
          'category', catalog_items.category,
          'availability', catalog_items.availability,
          'featured_media', catalog_items.featured_media,
          'media', catalog_items.media
        ) order by project_set_items.created_at
      ) filter (where catalog_items.id is not null),
      '[]'::jsonb
    )
  )
  from public.project_set_shares
  join public.project_sets on project_sets.id = project_set_shares.project_set_id
  left join public.project_set_items on project_set_items.project_set_id = project_sets.id
  left join public.catalog_items on catalog_items.id = project_set_items.catalog_item_id and catalog_items.is_published = true
  where project_set_shares.token = p_token
    and project_set_shares.revoked_at is null
  group by project_sets.id, project_sets.title, project_sets.created_at;
$$;

revoke all on function public.get_shared_project_set(uuid) from public;
grant execute on function public.get_shared_project_set(uuid) to anon, authenticated;
