-- Saved job postings. One row per user and normalized link.
-- url_norm is computed in the trigger (the client value is ignored):
--   http(s) only, host lowercased, fragment and default port dropped, userinfo dropped,
--   tracking query params dropped (utm_* and the list in normalize_job_url), remaining params sorted,
--   trailing slash removed except for the site root and the LinkedIn canonical form.
--   A LinkedIn currentJobId, or a /jobs/view/<id> path, becomes https://www.linkedin.com/jobs/view/<id>/.
-- Keep src/lib/job-url.ts in step with normalize_job_url. The database is the authority.

create function public.job_url_encode(input text) returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  bytes bytea := pg_catalog.convert_to(coalesce(input, ''), 'utf8');
  i int;
  b int;
  out text := '';
begin
  for i in 1..pg_catalog.octet_length(bytes) loop
    b := pg_catalog.get_byte(bytes, i - 1);
    if b = 32 then
      out := out || '+';
    elsif (b between 48 and 57) or (b between 65 and 90) or (b between 97 and 122)
       or b in (42, 45, 46, 95) then
      out := out || pg_catalog.chr(b);
    else
      out := out || '%' || pg_catalog.upper(pg_catalog.lpad(pg_catalog.to_hex(b), 2, '0'));
    end if;
  end loop;
  return out;
end;
$$;

create function public.job_url_decode(input text) returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  s text := replace(coalesce(input, ''), '+', ' ');
  bytes bytea := ''::bytea;
  i int := 1;
  n int := char_length(s);
  hex text;
begin
  while i <= n loop
    if substring(s from i for 1) = '%' and i + 2 <= n
       and substring(s from i + 1 for 2) ~ '^[0-9A-Fa-f]{2}$' then
      hex := substring(s from i + 1 for 2);
      bytes := bytes || pg_catalog.decode(hex, 'hex');
      i := i + 3;
    else
      bytes := bytes || pg_catalog.convert_to(substring(s from i for 1), 'utf8');
      i := i + 1;
    end if;
  end loop;
  return pg_catalog.convert_from(bytes, 'utf8');
exception
  when others then
    raise exception 'invalid_job_url' using errcode = '23514';
end;
$$;

create function public.normalize_job_url(raw text) returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  input text := btrim(raw);
  scheme text;
  rest text;
  authority text;
  host text;
  port text := '';
  path text;
  query text := '';
  bare_host text;
  job_id text;
  segment text;
  piece text;
  eq_pos int;
  key text;
  val text;
  lower_key text;
  hash_pos int;
  query_pos int;
  slash_pos int;
  decoded_keys text[] := '{}';
  decoded_vals text[] := '{}';
  -- Lowercased names. utm_* is matched by prefix. Keep the same set in src/lib/job-url.ts.
  tracking constant text[] := array[
    'fbclid', 'gclid', 'gbraid', 'wbraid', 'dclid', 'msclkid', 'mc_cid', 'mc_eid',
    'igshid', 'yclid', 'twclid', 'ttclid', 'li_fat_id', 'gclsrc', 'gad_source',
    'gad_campaignid', '_ga', '_gl', 'ref', 'refid', 'trackingid', 'trk', 'trkinfo',
    'lipi', 'originalsubdomain', 'original_referer', 'ebp', 'origin', 'si', 'mcid',
    '_hsenc', '_hsmi', 'mkt_tok', 'rb_clickid', 'irclickid', 'hsa_acc', 'hsa_cam',
    'hsa_grp', 'hsa_ad', 'hsa_src', 'hsa_tgt', 'hsa_kw', 'hsa_mt', 'hsa_net', 'hsa_ver'
  ];
begin
  if input is null or input = '' or input ~ '[[:space:]]' then
    raise exception 'invalid_job_url' using errcode = '23514';
  end if;
  if input !~* '^https?://' then
    raise exception 'invalid_job_url' using errcode = '23514';
  end if;

  scheme := lower(substring(input from '^([^:]+)'));
  rest := substring(input from '^[^:]+://(.*)$');

  hash_pos := position('#' in rest);
  if hash_pos > 0 then
    rest := substring(rest from 1 for hash_pos - 1);
  end if;

  query_pos := position('?' in rest);
  if query_pos > 0 then
    query := substring(rest from query_pos + 1);
    rest := substring(rest from 1 for query_pos - 1);
  end if;

  slash_pos := position('/' in rest);
  if slash_pos = 0 then
    authority := rest;
    path := '/';
  else
    authority := substring(rest from 1 for slash_pos - 1);
    path := substring(rest from slash_pos);
  end if;

  if authority = '' then
    raise exception 'invalid_job_url' using errcode = '23514';
  end if;
  if position('@' in authority) > 0 then
    authority := regexp_replace(authority, '^.*@', '');
  end if;

  if authority ~ ':\d+$' then
    port := substring(authority from ':(\d+)$');
    host := regexp_replace(authority, ':\d+$', '');
  else
    host := authority;
  end if;

  host := lower(regexp_replace(host, '\.+$', ''));
  if host = '' or host ~ '[^a-z0-9.-]' then
    raise exception 'invalid_job_url' using errcode = '23514';
  end if;
  if (scheme = 'https' and port = '443') or (scheme = 'http' and port = '80') then
    port := '';
  end if;
  if path = '' then
    path := '/';
  end if;

  bare_host := regexp_replace(host, '^www\.', '');
  if bare_host = 'linkedin.com' or bare_host like '%.linkedin.com' then
    select (regexp_match(pair, '^currentJobId=([0-9]+)$', 'i'))[1]
      into job_id
    from unnest(string_to_array(query, '&')) as pair
    where pair ~* '^currentJobId=[0-9]+$'
    limit 1;

    if job_id is null then
      segment := (regexp_match(path, '^/jobs/view/([^/]+)/?$'))[1];
      if segment is not null and (segment ~ '^[0-9]+$' or segment ~ '^.+-[0-9]+$') then
        job_id := (regexp_match(segment, '([0-9]+)$'))[1];
      end if;
    end if;

    if job_id is not null then
      return 'https://www.linkedin.com/jobs/view/' || job_id || '/';
    end if;
  end if;

  if query <> '' then
    foreach piece in array string_to_array(query, '&') loop
      if piece = '' then
        continue;
      end if;
      eq_pos := position('=' in piece);
      if eq_pos = 0 then
        key := public.job_url_decode(piece);
        val := '';
      else
        key := public.job_url_decode(substring(piece from 1 for eq_pos - 1));
        val := public.job_url_decode(substring(piece from eq_pos + 1));
      end if;
      lower_key := lower(key);
      if lower_key like 'utm\_%' escape '\' or lower_key = any (tracking) then
        continue;
      end if;
      decoded_keys := decoded_keys || key;
      decoded_vals := decoded_vals || val;
    end loop;

    select coalesce(string_agg(public.job_url_encode(k) || '=' || public.job_url_encode(v), '&' order by k, v), '')
      into query
    from unnest(decoded_keys, decoded_vals) as t(k, v);
  end if;

  if char_length(path) > 1 then
    path := regexp_replace(path, '/+$', '');
  end if;

  return scheme || '://' || host
    || case when port <> '' then ':' || port else '' end
    || path
    || case when query <> '' then '?' || query else '' end;
end;
$$;

revoke all on function public.job_url_encode(text) from public, anon;
revoke all on function public.job_url_decode(text) from public, anon;
revoke all on function public.normalize_job_url(text) from public, anon;
grant execute on function public.job_url_encode(text) to authenticated;
grant execute on function public.job_url_decode(text) to authenticated;
grant execute on function public.normalize_job_url(text) to authenticated;

create table public.job_posts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  url text not null check (url ~* '^https?://[^[:space:]]+$'),
  url_norm text not null,
  raw_description text not null check (char_length(raw_description) between 50 and 50000),
  status text not null default 'Saved'
    check (status in ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn')),
  applied_on date,
  company text check (company is null or char_length(btrim(company)) > 0),
  title text check (title is null or char_length(btrim(title)) > 0),
  extracted jsonb,
  pay_min_php numeric check (pay_min_php is null or pay_min_php >= 0),
  pay_max_php numeric check (pay_max_php is null or pay_max_php >= 0),
  years numeric check (years is null or (years >= 0 and years <= 80)),
  seniority text check (seniority is null or char_length(btrim(seniority)) > 0),
  extraction_status text not null default 'new'
    check (extraction_status in ('new', 'needs_update', 'processed', 'needs_info')),
  extracted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_posts_user_url_norm_key unique (user_id, url_norm),
  constraint job_posts_pay_range_check check (
    pay_min_php is null or pay_max_php is null or pay_min_php <= pay_max_php
  )
);

create index job_posts_extraction_queue_idx
  on public.job_posts (created_at)
  where extraction_status in ('new', 'needs_update');

create function public.job_posts_before_write() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  new.url_norm := public.normalize_job_url(new.url);
  new.company := nullif(btrim(new.company), '');
  new.title := nullif(btrim(new.title), '');
  new.seniority := nullif(btrim(new.seniority), '');

  -- A description edited after extraction is stale. Leave 'new' and 'needs_update' alone.
  if tg_op = 'UPDATE'
     and new.raw_description is distinct from old.raw_description
     and old.extraction_status in ('processed', 'needs_info') then
    new.extraction_status := 'needs_update';
  end if;

  return new;
end;
$$;

create trigger job_posts_before_write
  before insert or update on public.job_posts
  for each row execute function public.job_posts_before_write();

revoke all on function public.job_posts_before_write() from public, anon;
grant execute on function public.job_posts_before_write() to authenticated;

alter table public.job_posts enable row level security;

revoke all on public.job_posts from anon, authenticated, public;
grant select, insert, update, delete on public.job_posts to authenticated;

revoke all on sequence public.job_posts_id_seq from anon, authenticated, public;
grant usage, select on sequence public.job_posts_id_seq to authenticated;

create policy "Users manage their own job posts"
  on public.job_posts
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
