alter table public.project_sets
alter column user_id set default auth.uid();
