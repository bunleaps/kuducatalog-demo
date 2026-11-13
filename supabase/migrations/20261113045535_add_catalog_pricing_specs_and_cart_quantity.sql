alter table public.catalog_items
add column if not exists daily_rate numeric(10, 2),
add column if not exists short_specs text[] not null default '{}';

alter table public.catalog_items
drop constraint if exists catalog_items_daily_rate_nonnegative;

alter table public.catalog_items
add constraint catalog_items_daily_rate_nonnegative
check (daily_rate is null or daily_rate >= 0);

with ranked_items as (
  select id, row_number() over (order by created_at, id) as item_number
  from public.catalog_items
)
update public.catalog_items as item
set daily_rate = case when ranked.item_number % 5 = 0 then null else 1.00 end
from ranked_items as ranked
where item.id = ranked.id
  and item.daily_rate is null;

drop function if exists public.add_item_to_active_cart(uuid);

create function public.add_item_to_active_cart(
  p_catalog_item_id uuid,
  p_quantity integer default 1
)
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

  if p_quantity < 1 or p_quantity > 99 then
    raise exception 'Quantity must be between 1 and 99';
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
  values (v_project_set_id, p_catalog_item_id, p_quantity)
  on conflict (project_set_id, catalog_item_id)
  do update set quantity = excluded.quantity;

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

revoke all on function public.add_item_to_active_cart(uuid, integer) from public, anon;
grant execute on function public.add_item_to_active_cart(uuid, integer) to authenticated;
