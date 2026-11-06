alter table public.profiles
add column if not exists display_name text;

update public.profiles profile
set display_name = coalesce(
  nullif(trim(users.raw_user_meta_data ->> 'display_name'), ''),
  nullif(trim(users.raw_user_meta_data ->> 'full_name'), '')
)
from auth.users users
where profile.id = users.id
  and profile.display_name is null;

update public.profiles profile
set display_name = 'DevBuns Tech'
from auth.users users
where profile.id = users.id
  and lower(users.email) = 'devbuns.tech@gmail.com';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
    ),
    'customer'
  );
  return new;
end;
$$;
