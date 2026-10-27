begin;
select plan(16);

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

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;
insert into public.job_posts (url, raw_description) values ('https://example.com/queue-new', repeat('n', 50));
insert into public.job_posts (url, raw_description) values ('https://example.com/queue-done', repeat('d', 50));
update public.job_posts set extraction_status = 'processed' where url = 'https://example.com/queue-done';

reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
set local role authenticated;
insert into public.job_posts (url, raw_description) values ('https://example.com/queue-update', repeat('u', 50));
update public.job_posts set extraction_status = 'needs_update' where url = 'https://example.com/queue-update';

select throws_ok(
  $$select public.submit_extraction(1, '{"skills":{"required":[],"niceToHave":[]}}'::jsonb)$$,
  '42501',
  null,
  'a signed-in user cannot submit an extraction'
);

reset role;
set local role career;

select is((select count(*)::int from public.job_posts), 2, 'career reads only new and needs_update rows');
select is(
  (select count(*)::int from public.job_posts where url = 'https://example.com/queue-done'),
  0,
  'career cannot read a processed row'
);
select is(
  (select raw_description from public.job_posts where url = 'https://example.com/queue-new'),
  repeat('n', 50),
  'career can read the description it extracts from'
);
select throws_ok(
  $$update public.job_posts set raw_description = repeat('x', 50)$$,
  '42501',
  null,
  'career cannot edit raw_description'
);
select throws_ok(
  $$update public.job_posts set status = 'Applied'$$,
  '42501',
  null,
  'career cannot edit application status'
);
select throws_ok(
  $$update public.job_posts set extracted = '{}'::jsonb$$,
  '42501',
  null,
  'career cannot write extracted fields directly'
);
select throws_ok($$delete from public.job_posts$$, '42501', null, 'career cannot delete job posts');
select throws_ok(
  $$select display_name from public.profiles$$,
  '42501',
  null,
  'career cannot read profiles'
);

select throws_ok(
  $$select public.submit_extraction((select id from public.job_posts where url = 'https://example.com/queue-new'), '{"extra":true}'::jsonb)$$,
  '23514',
  'invalid_extraction',
  'an unknown payload key is rejected'
);
select throws_ok(
  $$select public.submit_extraction(
      (select id from public.job_posts where url = 'https://example.com/queue-new'),
      '{"skills":{"required":["TypeScript"],"niceToHave":[]},"pay":{"minPhp":150000,"maxPhp":80000}}'::jsonb
    )$$,
  '23514',
  'invalid_extraction',
  'pay min above max is rejected'
);

select is(
  (select public.submit_extraction(
    (select id from public.job_posts where url = 'https://example.com/queue-new'),
    '{"skills":{"required":["TypeScript"],"niceToHave":["SQL"]},"pay":{"minPhp":80000,"maxPhp":120000},"years":4,"seniority":"senior","engagement":"full-time","hiringVia":"direct"}'::jsonb
  ) ->> 'extraction_status'),
  'processed',
  'a complete payload is stored as processed'
);

select is(
  (select public.submit_extraction(
    (select id from public.job_posts where url = 'https://example.com/queue-update'),
    '{"skills":{"required":[],"niceToHave":["Figma"]},"needsInfo":true}'::jsonb
  ) ->> 'extraction_status'),
  'needs_info',
  'needsInfo leaves the row out of the queue'
);
select is((select count(*)::int from public.job_posts), 0, 'career no longer sees rows it has finished');

select throws_ok(
  $$select public.submit_extraction(0, '{"skills":{"required":[],"niceToHave":[]}}'::jsonb)$$,
  'P0002',
  'job_not_found',
  'an unknown job id is rejected'
);

reset role;
select is(
  (select status = 'Saved' and raw_description = repeat('n', 50) and pay_min_php = 80000 and pay_max_php = 120000
        and years = 4 and seniority = 'senior' and extraction_status = 'processed' and extracted_at is not null
        and extracted = '{"skills":{"required":["TypeScript"],"niceToHave":["SQL"]},"pay":{"minPhp":80000,"maxPhp":120000},"years":4,"seniority":"senior","engagement":"full-time","hiringVia":"direct","needsInfo":false}'::jsonb
   from public.job_posts where url = 'https://example.com/queue-new'),
  true,
  'submit writes extracted fields and leaves the description and status'
);

select * from finish();
rollback;
