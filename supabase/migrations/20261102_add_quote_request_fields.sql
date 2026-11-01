alter table public.project_sets
  add column if not exists collection_date date,
  add column if not exists return_date date,
  add column if not exists collection_time time,
  add column if not exists return_time time,
  add column if not exists fulfillment text not null default 'self_pickup' check (fulfillment in ('self_pickup', 'delivery_request')),
  add column if not exists contact_name text,
  add column if not exists shoot_location text,
  add column if not exists production_type text,
  add column if not exists request_notes text;
