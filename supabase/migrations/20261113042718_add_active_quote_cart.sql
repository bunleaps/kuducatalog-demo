alter table public.project_sets
add column if not exists is_active boolean not null default false;

create unique index if not exists project_sets_one_active_cart_per_user_idx
on public.project_sets (user_id)
where is_active = true;

create or replace function public.add_item_to_active_cart(p_catalog_item_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_project_set_id uuid;
  v_item_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not private.is_customer() then
    raise exception 'Customer account required';
  end if;

  select id
  into v_project_set_id
  from public.project_sets
  where user_id = v_user_id
    and is_active = true
  limit 1;

  if v_project_set_id is null then
    begin
      insert into public.project_sets (user_id, title, is_active)
      values (v_user_id, 'Untitled quote', true)
      returning id into v_project_set_id;
    exception
      when unique_violation then
        select id
        into v_project_set_id
        from public.project_sets
        where user_id = v_user_id
          and is_active = true
        limit 1;
    end;
  end if;

  insert into public.project_set_items (project_set_id, catalog_item_id, quantity)
  values (v_project_set_id, p_catalog_item_id, 1)
  on conflict (project_set_id, catalog_item_id) do nothing;

  update public.project_sets
  set updated_at = now()
  where id = v_project_set_id;

  select coalesce(sum(quantity), 0)::integer
  into v_item_count
  from public.project_set_items
  where project_set_id = v_project_set_id;

  return jsonb_build_object(
    'project_set_id', v_project_set_id,
    'item_count', v_item_count
  );
end;
$$;

revoke all on function public.add_item_to_active_cart(uuid) from public, anon;
grant execute on function public.add_item_to_active_cart(uuid) to authenticated;
