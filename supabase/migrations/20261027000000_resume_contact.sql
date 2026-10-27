-- Private resume phone and email, one row per user.
-- Do not insert a real phone number or email in this file or in a seed.
-- The owner inserts their own row in the Supabase SQL editor after applying the migration.
-- Steps: TODO.md, "Med: private resume contact".

create table public.resume_contact (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text check (
    email is null
    or (char_length(email) between 3 and 160 and position('@' in email) > 1)
  ),
  phone text check (phone is null or char_length(btrim(phone)) between 7 and 40),
  updated_at timestamptz not null default now(),
  constraint resume_contact_has_detail check (email is not null or phone is not null)
);

create trigger resume_contact_set_updated_at
  before update on public.resume_contact
  for each row execute function public.set_updated_at();

alter table public.resume_contact enable row level security;

-- Supabase grants new public tables to anon and authenticated by default.
revoke all on public.resume_contact from anon, authenticated;
-- Filtering on user_id needs select on that column. Anonymous visitors get no columns.
grant select (user_id, email, phone) on public.resume_contact to authenticated;

create policy "Users read their own resume contact"
  on public.resume_contact
  for select
  to authenticated
  using (user_id = (select auth.uid()));
