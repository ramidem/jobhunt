-- Profiles, usernames and the sign-up trigger.
-- Every user owns one profile. The username is public (it is the /<username>/resume path).

create table public.reserved_usernames (
  name text primary key check (name = lower(name))
);

-- Only the security definer functions below read this table; clients never see it.
alter table public.reserved_usernames enable row level security;
revoke all on public.reserved_usernames from anon, authenticated;

-- Top-level routes and names that must never belong to a user. Keep in sync with src/app.
insert into public.reserved_usernames (name) values
  ('about'), ('admin'), ('api'), ('app'), ('applications'), ('auth'), ('companies'),
  ('contact'), ('dashboard'), ('help'), ('improvements'), ('interviews'), ('learn'),
  ('library'), ('login'), ('logout'), ('manifest'), ('next'), ('outreach'), ('path'),
  ('privacy'), ('resume'), ('results'), ('robots'), ('roles'), ('schedule'),
  ('settings'), ('signin'), ('signout'), ('signup'), ('sitemap'), ('skills'),
  ('support'), ('terms'), ('todo'), ('www');

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
    check (
      username ~ '^[a-z0-9]([a-z0-9]|-(?!-))*[a-z0-9]$'
      and char_length(username) between 3 and 30
    ),
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.reject_reserved_username() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.reserved_usernames where name = new.username) then
    raise exception 'username_reserved' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger profiles_reject_reserved_username
  before insert or update of username on public.profiles
  for each row execute function public.reject_reserved_username();

-- Creates the profile when a user signs up. The client sends the username as sign-up metadata.
-- An invalid, taken or reserved username raises, so the sign-up fails and no user is created.
create function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, username, display_name)
  values (
    new.id,
    lower(trim(new.raw_user_meta_data ->> 'username')),
    coalesce(trim(new.raw_user_meta_data ->> 'display_name'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up form check a name before submitting. Returns only a boolean.
create function public.username_available(candidate text) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    lower(candidate) ~ '^[a-z0-9]([a-z0-9]|-(?!-))*[a-z0-9]$'
    and char_length(candidate) between 3 and 30
    and not exists (select 1 from public.reserved_usernames where name = lower(candidate))
    and not exists (select 1 from public.profiles where username = lower(candidate));
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- Row Level Security. The username and display name are public; everything else is private.
alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select (username, display_name) on public.profiles to anon, authenticated;
grant update (username, display_name) on public.profiles to authenticated;

create policy "Anyone can read public profile fields"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users update their own profile"
  on public.profiles for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
