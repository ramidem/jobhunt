begin;
select plan(19);

create function pg_temp.sign_up(id uuid, username text) returns void
language sql as $$
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
  values (
    id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    coalesce(username, 'none') || '@example.com',
    case when username is null then '{}'::jsonb else jsonb_build_object('username', username) end
  );
$$;

-- Sign-up creates a lowercase profile.
select pg_temp.sign_up('00000000-0000-0000-0000-00000000000a', 'Alice-Dev');
select is(
  (select username from public.profiles where user_id = '00000000-0000-0000-0000-00000000000a'),
  'alice-dev',
  'sign-up creates a profile with a lowercased username'
);

select pg_temp.sign_up('00000000-0000-0000-0000-00000000000b', 'bob');

-- Invalid, duplicate and reserved usernames fail the whole sign-up.
select throws_ok($$select pg_temp.sign_up(gen_random_uuid(), 'ab')$$, '23514', null, 'too short');
select throws_ok($$select pg_temp.sign_up(gen_random_uuid(), 'bad_name')$$, '23514', null, 'invalid characters');
select throws_ok($$select pg_temp.sign_up(gen_random_uuid(), '-lead')$$, '23514', null, 'leading hyphen');
select throws_ok($$select pg_temp.sign_up(gen_random_uuid(), 'a--b')$$, '23514', null, 'consecutive hyphens');
select throws_ok($$select pg_temp.sign_up(gen_random_uuid(), repeat('a', 31))$$, '23514', null, 'too long');
select throws_ok($$select pg_temp.sign_up(gen_random_uuid(), 'ALICE-dev')$$, '23505', null, 'duplicate ignoring case');
select throws_ok($$select pg_temp.sign_up(gen_random_uuid(), 'Dashboard')$$, '23514', 'username_reserved', 'reserved name');
select throws_ok($$select pg_temp.sign_up(gen_random_uuid(), null)$$, '23502', null, 'missing username');

select is(
  (select count(*)::int from auth.users where email in ('ab@example.com', 'dashboard@example.com')),
  0,
  'a failed sign-up leaves no user behind'
);

-- username_available
select ok(public.username_available('carol'), 'free name is available');
select ok(not public.username_available('ALICE-dev'), 'taken name (any case) is not available');
select ok(not public.username_available('settings'), 'reserved name is not available');

-- Row Level Security: signed out, only public fields are readable.
set local role anon;
select is((select count(*)::int from public.profiles), 2, 'anon reads public profile fields');
select throws_ok($$select user_id from public.profiles$$, '42501', null, 'anon cannot read user_id');

-- Signed in as Alice: can edit her own profile only.
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;
update public.profiles set display_name = 'Everyone';
select is(
  (select count(*)::int from public.profiles where display_name = 'Everyone'),
  1,
  'a user updates only their own profile row'
);

select is(
  (select display_name from public.profiles where username = 'bob'),
  '',
  'another user''s profile is left unchanged'
);
select throws_ok(
  $$update public.profiles set user_id = gen_random_uuid()$$,
  '42501',
  null,
  'a user cannot reassign a profile to another user id'
);

select is(
  (select username from public.profiles where user_id = (select auth.uid())),
  'alice-dev',
  'a signed-in user looks up their own profile by user_id'
);

select * from finish();
rollback;
