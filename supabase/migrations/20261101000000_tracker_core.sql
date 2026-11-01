-- Job tracking core (item 1b): companies, skills, jobs, job_skills, applications, contacts,
-- contact_log and job_contacts, moved from the SQLite schema in server/db.ts.
-- Design: docs/plan-01-database.md. SQLite column mapping: docs/tracker-core-mapping.md.
--
-- Every row has a user_id. Each table has unique (user_id, id) and each child references
-- (user_id, parent_id), so a row can never point at another user's parent. RLS limits every
-- table to the owner. Anonymous visitors have no grants.

create table public.companies (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  legal_name text not null default '',
  kind text not null default 'unknown'
    check (kind in ('employer', 'agency', 'confidential', 'unknown')),
  linkedin_url text not null default '',
  website text not null default '',
  careers_url text not null default '',
  industry text not null default '',
  size text not null default '',
  notes text not null default '',
  brief text not null default '',
  priority integer not null default 0,
  priority_note text not null default '',
  enriched_on date,
  created_at timestamptz not null default now(),
  constraint companies_user_id_id_key unique (user_id, id)
);
create unique index companies_user_name_key on public.companies (user_id, lower(name));

create table public.skills (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  status text not null default 'want' check (status in ('know', 'learning', 'want')),
  created_at timestamptz not null default now(),
  constraint skills_user_id_id_key unique (user_id, id)
);
create unique index skills_user_name_key on public.skills (user_id, lower(name));

create table public.contacts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company_id bigint,
  name text not null check (char_length(btrim(name)) > 0),
  title text not null default '',
  linkedin_url text,
  email text not null default '',
  phone text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint contacts_user_id_id_key unique (user_id, id),
  constraint contacts_user_linkedin_url_key unique (user_id, linkedin_url),
  constraint contacts_company_fkey foreign key (user_id, company_id)
    references public.companies (user_id, id) on delete set null (company_id)
);
create index contacts_company_idx on public.contacts (user_id, company_id);

-- A job posting, whether or not it was applied to. Saved raw postings live in job_posts.
create table public.jobs (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company_id bigint not null,
  code text,
  title text not null check (char_length(btrim(title)) > 0),
  url text not null default '',
  source text not null default 'manual',
  external_id text,
  details text not null default '',
  description text not null default '',
  location text not null default '',
  work_type text not null default '',
  employment_type text not null default '',
  salary text not null default '',
  posted_on text not null default '',
  applicants text not null default '',
  client_note text not null default '',
  priority integer not null default 0,
  pay_min_php integer check (pay_min_php is null or pay_min_php >= 0),
  pay_max_php integer check (pay_max_php is null or pay_max_php >= 0),
  pay_hourly boolean not null default false,
  scraped_at timestamptz,
  created_at timestamptz not null default now(),
  constraint jobs_user_id_id_key unique (user_id, id),
  constraint jobs_user_external_id_key unique (user_id, external_id),
  constraint jobs_user_code_key unique (user_id, code),
  constraint jobs_pay_range_check check (
    pay_min_php is null or pay_max_php is null or pay_min_php <= pay_max_php
  ),
  constraint jobs_company_fkey foreign key (user_id, company_id)
    references public.companies (user_id, id) on delete cascade
);
create index jobs_company_idx on public.jobs (user_id, company_id);

create table public.job_skills (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  job_id bigint not null,
  skill_id bigint not null,
  primary key (job_id, skill_id),
  constraint job_skills_job_fkey foreign key (user_id, job_id)
    references public.jobs (user_id, id) on delete cascade,
  constraint job_skills_skill_fkey foreign key (user_id, skill_id)
    references public.skills (user_id, id) on delete cascade
);
create index job_skills_skill_idx on public.job_skills (user_id, skill_id);

-- My pipeline state for a job.
create table public.applications (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  job_id bigint not null,
  status text not null default 'Saved'
    check (status in ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn')),
  applied_on date,
  notes text not null default '',
  constraint applications_user_id_id_key unique (user_id, id),
  constraint applications_user_job_key unique (user_id, job_id),
  constraint applications_job_fkey foreign key (user_id, job_id)
    references public.jobs (user_id, id) on delete cascade
);

-- A job can have several hiring people; a person can be tied to several jobs.
create table public.job_contacts (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  job_id bigint not null,
  contact_id bigint not null,
  role text not null default 'hiring',
  primary key (job_id, contact_id),
  constraint job_contacts_job_fkey foreign key (user_id, job_id)
    references public.jobs (user_id, id) on delete cascade,
  constraint job_contacts_contact_fkey foreign key (user_id, contact_id)
    references public.contacts (user_id, id) on delete cascade
);
create index job_contacts_contact_idx on public.job_contacts (user_id, contact_id);

-- Every outreach or reply, so it is clear who has been contacted and when.
create table public.contact_log (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company_id bigint not null,
  contact_id bigint,
  job_id bigint,
  channel text not null default 'LinkedIn',
  direction text not null default 'out' check (direction in ('out', 'in')),
  happened_on date not null,
  summary text not null default '',
  follow_up_on date,
  constraint contact_log_company_fkey foreign key (user_id, company_id)
    references public.companies (user_id, id) on delete cascade,
  constraint contact_log_contact_fkey foreign key (user_id, contact_id)
    references public.contacts (user_id, id) on delete set null (contact_id),
  constraint contact_log_job_fkey foreign key (user_id, job_id)
    references public.jobs (user_id, id) on delete set null (job_id)
);
create index contact_log_company_idx on public.contact_log (user_id, company_id, happened_on);

-- Same grants and the same policy on every table. No policy and no grant for anon.
do $$
declare
  t text;
begin
  foreach t in array array[
    'companies', 'skills', 'contacts', 'jobs', 'job_skills',
    'applications', 'job_contacts', 'contact_log'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated, public', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format(
      'create policy "Users manage their own rows" on public.%I for all to authenticated '
      'using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t
    );
  end loop;

  -- Tables with an identity column also need its sequence.
  foreach t in array array['companies', 'skills', 'contacts', 'jobs', 'applications', 'contact_log'] loop
    execute format('revoke all on sequence public.%I from anon, authenticated, public', t || '_id_seq');
    execute format('grant usage, select on sequence public.%I to authenticated', t || '_id_seq');
  end loop;
end;
$$;
