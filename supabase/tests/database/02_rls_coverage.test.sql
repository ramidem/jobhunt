begin;
select plan(2);

-- Guard: a table added to the public schema without RLS or a policy fails this test.
select is_empty(
  $$select c.relname from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity$$,
  'every public table has RLS enabled'
);

select is_empty(
  $$select c.relname from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
      and c.relname <> 'reserved_usernames' -- read only by security definer functions
      and not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname)$$,
  'every public table has at least one policy'
);

select * from finish();
rollback;
