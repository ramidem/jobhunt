begin;
select plan(10);

create function pg_temp.sign_up(id uuid, username text) returns void
language sql as $$
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
  values (
    id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    username || '@example.com',
    jsonb_build_object('username', username)
  );
$$;

select pg_temp.sign_up('00000000-0000-0000-0000-00000000000a', 'alice');
select pg_temp.sign_up('00000000-0000-0000-0000-00000000000b', 'bob');
select pg_temp.sign_up('00000000-0000-0000-0000-00000000000c', 'carol');

-- Inserted as the table owner, which bypasses RLS. The app never writes this table.
insert into public.resume_contact (user_id, email, phone) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@example.com', '+1 555 0100'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@example.com', '+1 555 0101');

set local role anon;
select throws_ok(
  $$select email, phone from public.resume_contact$$,
  '42501',
  null,
  'anonymous visitors cannot read resume contact'
);

reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;

select is(
  (select email from public.resume_contact where user_id = (select auth.uid())),
  'alice@example.com',
  'a signed-in user reads their own email by user_id'
);
select is(
  (select phone from public.resume_contact where user_id = (select auth.uid())),
  '+1 555 0100',
  'a signed-in user reads their own phone by user_id'
);
select is(
  (select count(user_id)::int from public.resume_contact),
  1,
  'a signed-in user reads only their own contact row'
);
select is(
  (select count(user_id)::int from public.resume_contact where user_id = '00000000-0000-0000-0000-00000000000b'),
  0,
  'a signed-in user cannot read another user''s contact'
);
select throws_ok(
  $$insert into public.resume_contact (user_id, email) values ('00000000-0000-0000-0000-00000000000a', 'extra@example.com')$$,
  '42501',
  null,
  'a signed-in user cannot insert a contact row'
);
select throws_ok(
  $$update public.resume_contact set phone = '+1 555 0199'$$,
  '42501',
  null,
  'a signed-in user cannot update contact rows'
);
select throws_ok(
  $$delete from public.resume_contact$$,
  '42501',
  null,
  'a signed-in user cannot delete contact rows'
);

reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
set local role authenticated;
select is(
  (select email from public.resume_contact where user_id = (select auth.uid())),
  'bob@example.com',
  'another signed-in user reads only their own email'
);

reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}', true);
set local role authenticated;
select is(
  (select count(user_id)::int from public.resume_contact),
  0,
  'a user with no contact row reads nothing'
);

select * from finish();
rollback;
