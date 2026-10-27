begin;
select plan(46);

create function pg_temp.sign_up(id uuid, username text) returns void
language sql as $$
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
  values (
    id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    username || '@example.com',
    jsonb_build_object('username', username)
  );
$$;

-- url_norm. Same strings as src/lib/job-url.test.ts.
select is(
  public.normalize_job_url('https://www.linkedin.com/jobs/search/?currentJobId=4389012345&keywords=engineer&utm_source=share&trackingId=abc'),
  'https://www.linkedin.com/jobs/view/4389012345/',
  'LinkedIn currentJobId becomes /jobs/view/<id>/'
);
select is(
  public.normalize_job_url('https://www.linkedin.com/jobs/view/4389012345/?trackingId=abc&refId=xyz'),
  'https://www.linkedin.com/jobs/view/4389012345/',
  'LinkedIn view link drops tracking params'
);
select is(
  public.normalize_job_url('https://www.linkedin.com/jobs/view/senior-engineer-at-acme-4389012345/'),
  'https://www.linkedin.com/jobs/view/4389012345/',
  'LinkedIn slug view link keeps the numeric id'
);
select is(
  public.normalize_job_url('https://ph.linkedin.com/jobs/view/4389012345'),
  'https://www.linkedin.com/jobs/view/4389012345/',
  'LinkedIn country host canonicalizes to www'
);
select is(
  public.normalize_job_url('http://linkedin.com/jobs/collections/recommended/?currentJobId=4389012345'),
  'https://www.linkedin.com/jobs/view/4389012345/',
  'LinkedIn collection link uses currentJobId'
);
select is(
  public.normalize_job_url('HTTPS://Example.com:443/Jobs/?utm_source=x&b=2&a=1'),
  'https://example.com/Jobs?a=1&b=2',
  'host, scheme and default port are normalized and tracking params drop'
);
select is(
  public.normalize_job_url('https://example.com/jobs/1/?id=9&utm_campaign=spring'),
  'https://example.com/jobs/1?id=9',
  'trailing slash and utm params are removed'
);
select is(
  public.normalize_job_url('https://example.com/jobs/?q=a%20b&fbclid=zzz'),
  'https://example.com/jobs?q=a+b',
  'fbclid is tracking and spaces use form encoding'
);
select is(
  public.normalize_job_url('https://example.com/jobs/?q=a+b'),
  'https://example.com/jobs?q=a+b',
  'plus in a query value is a space'
);
select is(
  public.normalize_job_url('https://boards.greenhouse.io/acme/jobs/123?gh_jid=123&utm_source=li'),
  'https://boards.greenhouse.io/acme/jobs/123?gh_jid=123',
  'a non-tracking job id stays on the link'
);
select is(
  public.normalize_job_url('https://example.com/path#frag'),
  'https://example.com/path',
  'fragment is dropped'
);
select is(
  public.normalize_job_url('https://example.com'),
  'https://example.com/',
  'a bare host keeps a single slash'
);
select is(
  public.normalize_job_url('https://www.linkedin.com/jobs/view/123/?currentJobId=999'),
  'https://www.linkedin.com/jobs/view/999/',
  'currentJobId wins when the view path is a different id'
);
select is(
  public.normalize_job_url('https://example.com:8443/jobs/'),
  'https://example.com:8443/jobs',
  'a non-default port is kept'
);
select is(
  public.normalize_job_url('https://user:pass@example.com/secret'),
  'https://example.com/secret',
  'userinfo is dropped'
);
select is(
  public.normalize_job_url('https://example.com/jobs?q=a%2Fb'),
  'https://example.com/jobs?q=a%2Fb',
  'a slash in a query value stays percent-encoded'
);
select is(
  public.normalize_job_url('https://example.com/jobs?q=a*b'),
  'https://example.com/jobs?q=a*b',
  'a star in a query value stays unescaped'
);
select is(
  public.normalize_job_url('https://example.com/jobs?q=a~b'),
  'https://example.com/jobs?q=a%7Eb',
  'a tilde in a query value is percent-encoded'
);
select is(
  public.normalize_job_url('https://example.com/jobs?b=1&a=2&a=1'),
  'https://example.com/jobs?a=1&a=2&b=1',
  'query params are sorted by key then value'
);
select throws_ok($$select public.normalize_job_url('ftp://example.com/jobs')$$, '23514', 'invalid_job_url', 'ftp is rejected');
select throws_ok($$select public.normalize_job_url('not a url')$$, '23514', 'invalid_job_url', 'plain text is rejected');
select throws_ok($$select public.normalize_job_url('  ')$$, '23514', 'invalid_job_url', 'a blank link is rejected');

select pg_temp.sign_up('00000000-0000-0000-0000-00000000000a', 'alice');
select pg_temp.sign_up('00000000-0000-0000-0000-00000000000b', 'bob');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;

insert into public.job_posts (url, raw_description)
values (
  'https://www.linkedin.com/jobs/search/?currentJobId=4389012345&keywords=engineer&utm_source=share&trackingId=abc',
  repeat('a', 50)
);

select is(
  (select user_id from public.job_posts),
  '00000000-0000-0000-0000-00000000000a'::uuid,
  'user_id defaults to the signed-in user'
);
select is(
  (select url_norm from public.job_posts),
  'https://www.linkedin.com/jobs/view/4389012345/',
  'the stored url_norm is the canonical link'
);
select is((select status from public.job_posts), 'Saved', 'status defaults to Saved');
select is((select extraction_status from public.job_posts), 'new', 'extraction_status defaults to new');
select is(
  (select company is null and title is null and applied_on is null and extracted is null
        and pay_min_php is null and pay_max_php is null and years is null and seniority is null
        and extracted_at is null
   from public.job_posts),
  true,
  'optional columns start empty'
);

select throws_ok(
  $$insert into public.job_posts (url, raw_description) values ('https://www.linkedin.com/jobs/view/4389012345/?trackingId=abc', repeat('b', 60))$$,
  '23505',
  null,
  'the same normalized link cannot be saved twice'
);
select throws_ok(
  $$insert into public.job_posts (url, raw_description) values ('https://example.com/too-short', repeat('a', 49))$$,
  '23514',
  null,
  'a description under 50 characters is rejected'
);
select lives_ok(
  $$insert into public.job_posts (url, raw_description) values ('https://example.com/long', repeat('b', 50000))$$,
  'a description of 50000 characters is accepted'
);
delete from public.job_posts where url = 'https://example.com/long';
select throws_ok(
  $$insert into public.job_posts (url, raw_description) values ('https://example.com/too-long', repeat('c', 50001))$$,
  '23514',
  null,
  'a description over 50000 characters is rejected'
);

insert into public.job_posts (url, url_norm, raw_description)
values ('https://example.com/Jobs/', 'https://evil.example/nope', repeat('c', 50));
select is(
  (select url_norm from public.job_posts where url = 'https://example.com/Jobs/'),
  'https://example.com/Jobs',
  'a client-supplied url_norm is replaced'
);
delete from public.job_posts where url = 'https://example.com/Jobs/';

reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$insert into public.job_posts (url, raw_description) values ('https://www.linkedin.com/jobs/view/4389012345/', repeat('d', 50))$$,
  'another user can save the same link'
);
select is((select count(*)::int from public.job_posts), 1, 'bob sees only his own row');

update public.job_posts set status = 'Rejected' where user_id = '00000000-0000-0000-0000-00000000000a';
delete from public.job_posts where user_id = '00000000-0000-0000-0000-00000000000a';

select throws_ok(
  $$insert into public.job_posts (user_id, url, raw_description) values ('00000000-0000-0000-0000-00000000000a', 'https://example.com/stolen', repeat('e', 50))$$,
  '42501',
  null,
  'bob cannot insert a row owned by alice'
);

reset role;
select is(
  (select status from public.job_posts where user_id = '00000000-0000-0000-0000-00000000000a'),
  'Saved',
  'bob cannot change alice''s status'
);
select is(
  (select count(*)::int from public.job_posts),
  2,
  'bob cannot delete alice''s row'
);

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;
select is((select count(*)::int from public.job_posts), 1, 'alice sees only her own row');

update public.job_posts set extraction_status = 'processed';
update public.job_posts set raw_description = repeat('n', 80);
select is((select extraction_status from public.job_posts), 'needs_update', 'editing a processed description queues it again');
select is((select status from public.job_posts), 'Saved', 'editing the description leaves the application status');

update public.job_posts set extraction_status = 'needs_info';
update public.job_posts set raw_description = repeat('p', 90);
select is((select extraction_status from public.job_posts), 'needs_update', 'editing a needs_info description queues it again');

update public.job_posts set extraction_status = 'processed', title = 'Engineer', updated_at = '2000-01-01T00:00:00Z';
select is((select extraction_status from public.job_posts), 'processed', 'editing the title leaves a processed extraction');
select is((select updated_at > timestamptz '2001-01-01' from public.job_posts), true, 'updated_at stays current when a client sends an old one');

reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
set local role authenticated;
update public.job_posts set raw_description = repeat('m', 70);
select is((select extraction_status from public.job_posts), 'new', 'a description edit before extraction stays new');

reset role;
set local role anon;
select throws_ok($$select count(*) from public.job_posts$$, '42501', null, 'anon cannot read job posts');
select throws_ok(
  $$insert into public.job_posts (url, raw_description) values ('https://example.com/anon', repeat('f', 50))$$,
  '42501',
  null,
  'anon cannot insert a job post'
);

select * from finish();
rollback;
