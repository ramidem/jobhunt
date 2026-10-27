-- Career reads the extraction queue and submits extracted fields.
-- It cannot delete, and it cannot change raw_description or the application status.
-- No login password is stored here. Med creates that outside the migration.

create role career nologin noinherit;

comment on role career is
  'Reads new and needs_update job posts and submits extracted fields. No password is set in this migration.';

grant usage on schema public to career;
grant select on public.job_posts to career;

do $$
begin
  execute format('grant connect on database %I to career', current_database());
end
$$;

create policy "Career reads the extraction queue"
  on public.job_posts
  for select
  to career
  using (extraction_status in ('new', 'needs_update'));

-- Checks a JSON array of short non-empty strings. Not part of the public API.
create function public.extraction_text_array(value jsonb) returns text[]
language plpgsql
immutable
set search_path = ''
as $$
declare
  item jsonb;
  texts text[] := '{}';
  word text;
begin
  if jsonb_typeof(value) <> 'array' then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;
  for item in select jsonb_array_elements(value) loop
    if jsonb_typeof(item) <> 'string' then
      raise exception 'invalid_extraction' using errcode = '23514';
    end if;
    word := btrim(item #>> '{}');
    if word = '' or char_length(word) > 80 then
      raise exception 'invalid_extraction' using errcode = '23514';
    end if;
    texts := texts || word;
  end loop;
  return texts;
end;
$$;

revoke all on function public.extraction_text_array(jsonb) from public, anon, authenticated;

create function public.submit_extraction(job_id bigint, payload jsonb) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  skills jsonb;
  pay jsonb;
  key text;
  required_skills text[];
  nice_skills text[];
  min_php numeric;
  max_php numeric;
  years_value numeric;
  seniority_value text;
  engagement text;
  hiring_via text;
  needs_info boolean := false;
  normalized jsonb;
  stored jsonb;
begin
  if job_id is null or payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;

  for key in select jsonb_object_keys(payload) loop
    if key not in ('skills', 'pay', 'years', 'seniority', 'engagement', 'hiringVia', 'needsInfo') then
      raise exception 'invalid_extraction' using errcode = '23514';
    end if;
  end loop;

  skills := payload -> 'skills';
  if skills is null or jsonb_typeof(skills) <> 'object' then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;
  for key in select jsonb_object_keys(skills) loop
    if key not in ('required', 'niceToHave') then
      raise exception 'invalid_extraction' using errcode = '23514';
    end if;
  end loop;
  if skills -> 'required' is null or skills -> 'niceToHave' is null then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;
  required_skills := public.extraction_text_array(skills -> 'required');
  nice_skills := public.extraction_text_array(skills -> 'niceToHave');

  if payload ? 'pay' then
    pay := payload -> 'pay';
    if jsonb_typeof(pay) <> 'object' then
      raise exception 'invalid_extraction' using errcode = '23514';
    end if;
    for key in select jsonb_object_keys(pay) loop
      if key not in ('minPhp', 'maxPhp') then
        raise exception 'invalid_extraction' using errcode = '23514';
      end if;
    end loop;
    if pay ? 'minPhp' and jsonb_typeof(pay -> 'minPhp') not in ('number', 'null') then
      raise exception 'invalid_extraction' using errcode = '23514';
    end if;
    if pay ? 'maxPhp' and jsonb_typeof(pay -> 'maxPhp') not in ('number', 'null') then
      raise exception 'invalid_extraction' using errcode = '23514';
    end if;
    min_php := (pay ->> 'minPhp')::numeric;
    max_php := (pay ->> 'maxPhp')::numeric;
    if min_php < 0 or max_php < 0 or (min_php is not null and max_php is not null and min_php > max_php) then
      raise exception 'invalid_extraction' using errcode = '23514';
    end if;
  end if;

  if payload ? 'years' and jsonb_typeof(payload -> 'years') not in ('number', 'null') then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;
  years_value := (payload ->> 'years')::numeric;
  if years_value is not null and (years_value < 0 or years_value > 80) then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;

  if payload ? 'seniority' and jsonb_typeof(payload -> 'seniority') not in ('string', 'null') then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;
  if payload ? 'engagement' and jsonb_typeof(payload -> 'engagement') not in ('string', 'null') then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;
  if payload ? 'hiringVia' and jsonb_typeof(payload -> 'hiringVia') not in ('string', 'null') then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;
  if payload ? 'needsInfo' and jsonb_typeof(payload -> 'needsInfo') <> 'boolean' then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;

  seniority_value := nullif(btrim(payload ->> 'seniority'), '');
  engagement := nullif(btrim(payload ->> 'engagement'), '');
  hiring_via := nullif(btrim(payload ->> 'hiringVia'), '');
  if char_length(seniority_value) > 80 or char_length(engagement) > 80 or char_length(hiring_via) > 80 then
    raise exception 'invalid_extraction' using errcode = '23514';
  end if;
  needs_info := coalesce((payload ->> 'needsInfo')::boolean, false);

  normalized := jsonb_build_object(
    'skills', jsonb_build_object(
      'required', to_jsonb(required_skills),
      'niceToHave', to_jsonb(nice_skills)
    ),
    'pay', jsonb_build_object('minPhp', to_jsonb(min_php), 'maxPhp', to_jsonb(max_php)),
    'years', to_jsonb(years_value),
    'seniority', to_jsonb(seniority_value),
    'engagement', to_jsonb(engagement),
    'hiringVia', to_jsonb(hiring_via),
    'needsInfo', to_jsonb(needs_info)
  );

  update public.job_posts
    set extracted = normalized,
        pay_min_php = min_php,
        pay_max_php = max_php,
        years = years_value,
        seniority = seniority_value,
        extraction_status = case when needs_info then 'needs_info' else 'processed' end,
        extracted_at = pg_catalog.now()
    where id = job_id
    returning jsonb_build_object(
      'id', id,
      'extraction_status', extraction_status,
      'extracted_at', extracted_at
    )
    into stored;

  if stored is null then
    raise exception 'job_not_found' using errcode = 'P0002';
  end if;
  return stored;
end;
$$;

revoke all on function public.submit_extraction(bigint, jsonb) from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_catalog.pg_roles where rolname = 'service_role') then
    execute 'revoke all on function public.submit_extraction(bigint, jsonb) from service_role';
  end if;
end
$$;

grant execute on function public.submit_extraction(bigint, jsonb) to career;
