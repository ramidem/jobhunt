begin;
select plan(30);

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

-- User A fills every table.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;

select lives_ok($$insert into public.companies (name) values ('Acme')$$, 'A inserts a company');
select lives_ok($$insert into public.skills (name) values ('React')$$, 'A inserts a skill');
select lives_ok(
  $$insert into public.contacts (company_id, name, linkedin_url)
    values ((select id from public.companies where name = 'Acme'), 'Rina', 'https://linkedin.com/in/rina')$$,
  'A inserts a contact'
);
select lives_ok(
  $$insert into public.jobs (company_id, title, code)
    values ((select id from public.companies where name = 'Acme'), 'Engineer', 'AB12')$$,
  'A inserts a job'
);
select lives_ok(
  $$insert into public.applications (job_id) values ((select id from public.jobs where code = 'AB12'))$$,
  'A inserts an application'
);
select lives_ok(
  $$insert into public.job_skills (job_id, skill_id)
    values ((select id from public.jobs where code = 'AB12'), (select id from public.skills where name = 'React'))$$,
  'A links a skill to a job'
);
select lives_ok(
  $$insert into public.job_contacts (job_id, contact_id)
    values ((select id from public.jobs where code = 'AB12'), (select id from public.contacts where name = 'Rina'))$$,
  'A links a contact to a job'
);
select lives_ok(
  $$insert into public.contact_log (company_id, contact_id, job_id, happened_on)
    values (
      (select id from public.companies where name = 'Acme'),
      (select id from public.contacts where name = 'Rina'),
      (select id from public.jobs where code = 'AB12'),
      '2026-11-01'
    )$$,
  'A logs a contact'
);
select is((select count(*) from public.companies), 1::bigint, 'A sees their own company');
select throws_ok(
  $$insert into public.companies (name) values ('ACME')$$,
  '23505', null,
  'company names are unique per user, ignoring case'
);
select throws_ok(
  $$insert into public.applications (job_id) values ((select id from public.jobs where code = 'AB12'))$$,
  '23505', null,
  'a job has one application'
);
select throws_ok(
  $$update public.applications set status = 'Hired'$$,
  '23514', null,
  'application status must be one of the allowed values'
);

-- Remember A's company id for the cross-reference test.
reset role;
select set_config('tests.a_company', (select id::text from public.companies where name = 'Acme'), false);

-- User B sees and changes nothing of A's.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
set local role authenticated;

select is_empty($$select 1 from public.companies$$, 'B sees no companies');
select is_empty($$select 1 from public.skills$$, 'B sees no skills');
select is_empty($$select 1 from public.contacts$$, 'B sees no contacts');
select is_empty($$select 1 from public.jobs$$, 'B sees no jobs');
select is_empty($$select 1 from public.job_skills$$, 'B sees no job skills');
select is_empty($$select 1 from public.applications$$, 'B sees no applications');
select is_empty($$select 1 from public.job_contacts$$, 'B sees no job contacts');
select is_empty($$select 1 from public.contact_log$$, 'B sees no contact log');
select lives_ok(
  $$update public.companies set name = 'Hacked'$$,
  'B can run an update, but it matches none of A''s companies'
);
select lives_ok(
  $$delete from public.jobs$$,
  'B can run a delete, but it matches none of A''s jobs'
);
select throws_ok(
  $$insert into public.companies (user_id, name) values ('00000000-0000-0000-0000-00000000000a', 'Planted')$$,
  '42501', null,
  'B cannot insert a row owned by A'
);
select lives_ok($$insert into public.companies (name) values ('Bco')$$, 'B inserts their own company');
select throws_ok(
  $$insert into public.jobs (company_id, title)
    values (current_setting('tests.a_company')::bigint, 'Sneaky')$$,
  '23503', null,
  'B cannot attach a job to A''s company'
);

-- Anonymous visitors have no access at all.
reset role;
set local role anon;
select throws_ok($$select 1 from public.companies$$, '42501', null, 'anonymous visitors cannot read companies');

-- Deleting parents behaves as in SQLite.
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;

select is(
  (select name from public.companies),
  'Acme',
  'B''s update left A''s company unchanged'
);
select is((select count(*) from public.jobs), 1::bigint, 'B''s delete left A''s job in place');

delete from public.contacts where name = 'Rina';
select is(
  (select contact_id from public.contact_log),
  null::bigint,
  'deleting a contact keeps the log row and clears its contact'
);
delete from public.companies where name = 'Acme';
select is(
  (select count(*) from public.jobs),
  0::bigint,
  'deleting a company deletes its jobs'
);

select * from finish();
rollback;
