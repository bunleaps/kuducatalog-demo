alter table public.profiles add column if not exists email text;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

update public.profiles profile
set email = users.email
from auth.users users
where profile.id = users.id and profile.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer');
  return new;
end;
$$;

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles for select to authenticated using (
  (select public.is_admin())
);

drop policy if exists "Admins can read all project sets" on public.project_sets;
create policy "Admins can read all project sets" on public.project_sets for select to authenticated using (
  (select public.is_admin())
);

drop policy if exists "Admins can read all project set items" on public.project_set_items;
create policy "Admins can read all project set items" on public.project_set_items for select to authenticated using (
  (select public.is_admin())
);
