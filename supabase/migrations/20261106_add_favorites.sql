create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  catalog_item_id uuid not null references public.catalog_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, catalog_item_id)
);

alter table public.favorites enable row level security;

drop policy if exists "Customers can view their favorites" on public.favorites;
create policy "Customers can view their favorites"
on public.favorites for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Customers can add their favorites" on public.favorites;
create policy "Customers can add their favorites"
on public.favorites for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Customers can remove their favorites" on public.favorites;
create policy "Customers can remove their favorites"
on public.favorites for delete to authenticated
using (auth.uid() = user_id);

create index if not exists favorites_user_created_idx
on public.favorites (user_id, created_at desc);
