# Item 1: Postgres schema, RLS and username

Status: draft for review. Parent plan: `docs/auth-workspace-plan.md`. Branch: `feature/auth-workspace-plan` (the work itself gets its own `feature/db-schema` branch from `develop`).

## Goal

A Supabase Postgres schema where every user's data is private by default, enforced in the database, with a unique public username. Proven by a test that user B cannot read or write user A's rows.

Out of scope for this item: any UI change, `src/lib/api.ts`, Cloud Run, the public resume tables (item 7).

## Scope: split the 25 tables

`server/db.ts` has about 25 tables. Writing all of them now means writing policies for pages that stay parked for weeks. One item at a time, so:

| Step | Tables | Why now |
| --- | --- | --- |
| 1a. Foundation | `profiles`, `reserved_usernames`, sign-up trigger, RLS helpers, test harness | Everything else depends on it |
| 1b. Job tracking core | `companies`, `contacts`, `jobs`, `job_skills`, `skills`, `applications`, `contact_log`, `job_contacts` | Needed by the first pages to unpark: dashboard, applications, companies |
| Later (with item 5, per page) | `outreach`, `interviews`, `offers`, `learn_*`, `todos`, `learning_*`, `preferences`, `library_items`, `improvements`, `schedule_*`, `qualification_*` | Added in the same pull request that unparks the page that uses them |

Item 1 is done when 1a and 1b are merged. Add a line to `TODO.md` for the later tables under item 5.

## Design decisions

1. **Ownership column.** Every owned table gets `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`, indexed. Deleting a user deletes their data (this is also the delete-account flow for item 8).
2. **Policies.** One policy set per table, written the same way every time: `for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))`. No policy for `anon`, so signed-out requests see nothing. The `select` wrapper lets Postgres cache the call.
3. **Cross-user references are impossible.** SQLite foreign keys only check that the parent row exists. In a shared table a user could point `jobs.company_id` at someone else's company. Use composite keys: each owned table has `unique (user_id, id)`, and each child references `(user_id, parent_id)`. The database rejects the bad row; RLS alone would not.
4. **Ids.** `bigint generated always as identity` per table, which keeps the shape of the current ids and lets the one-off import keep them. Rows are only visible to their owner, so sequential ids leak nothing.
5. **Uniqueness becomes per user.** `companies.name`, `skills.name`, `jobs.external_id`, `jobs.code`, `contacts.linkedin_url` are unique today for the whole database. They become `unique (user_id, ...)`. `COLLATE NOCASE` becomes a unique index on `lower(name)`, or the `citext` type.
6. **Types.** SQLite stores dates as text and booleans as 0/1. Use `timestamptz` for `created_at` and similar, `date` for `applied_on` and `follow_up_on` (nullable instead of empty string), `boolean` for flags. Keep the `CHECK` constraints on status columns. Treat empty-string defaults as `null` where a date is expected, and note any place where code relied on `''`.
7. **Shared reference data.** `qualification_roles/lines` come from the Google Sheet and are not per-user. They become read-only for `authenticated` (select policy only, no write policy), and the per-user part (`hidden`) moves to a `user_hidden_lines` table. This lands with item 5; noted here so the 1b design does not block it.
8. **Migrations.** Plain SQL files in `supabase/migrations/` (`<timestamp>_<name>.sql`), applied with the Supabase CLI. Never edit a shipped file; add a new one (same rule as the current `migrations` list). This replaces the in-code list in `server/db.ts` for Postgres.

## Username

- **Format:** lowercase letters, digits and hyphens; 3 to 30 characters; starts and ends with a letter or digit; no consecutive hyphens. Enforced by a `check` constraint on `profiles.username`.
- **Unique:** `unique` on `username`, stored lowercase, so `Med` and `med` collide.
- **Reserved:** a `reserved_usernames` table, checked by a trigger. Seed it with every top-level route and common names: `api`, `dashboard`, `login`, `signup`, `settings`, `admin`, `app`, `www`, `help`, `support`, `about`, `privacy`, `terms`, `_next`, plus the workspace routes (`applications`, `companies`, `skills`, ...). Add a comment in the Next.js route folder pointing to this list so a new top-level route also gets reserved.
- **Created at sign-up:** the client sends `options.data.username` in `signUp`. An `after insert on auth.users` trigger (`security definer`, fixed `search_path`) inserts the `profiles` row. If the username is invalid, taken or reserved the trigger raises, so the sign-up fails with a clear message and no half-created user.
- **Availability check:** an RPC `username_available(text)` callable by `anon`, returning only a boolean, so the form can check before submit. Rate-limited in item 8.
- **Public read:** `profiles` allows `select` of `username` and `display_name` to `anon` and `authenticated` (needed for `/<username>/resume`); nothing else on it is public, and users update only their own row. Changing a username is allowed but logged for later redirects (decide in the open questions).

## Testing

- **pgTAP** through `supabase test db`, files in `supabase/tests/`.
- **Isolation test (the acceptance test).** Create users A and B. As A, insert a company, contact, job and application. Then as B, assert: `select` returns zero rows; `update` and `delete` affect zero rows; `insert` with `user_id = A` fails; inserting a job that references A's company id fails on the composite key. As `anon`, assert zero rows from every table.
- **Username tests.** Invalid format, duplicate (different case), reserved name, and a valid one each produce the expected result through the trigger.
- **Coverage guard.** One test that fails if any table in `public` has RLS disabled or has no policy, so a future table cannot be added unprotected.
- **CI.** A job in `.github/workflows/` that runs `supabase start` and `supabase test db`. Docker is available on the GitHub runners.

## Tooling and setup needed

- Supabase CLI (`brew install supabase/tap/supabase`) and Docker Desktop for the local stack.
- The hosted project ref and database password, to link (`supabase link`) and push migrations (`supabase db push`).
- Decision on environments: local stack for tests and development, the hosted project for real data. A second hosted project for staging can wait.
- `.env.example` unchanged for this item. The service role key is never used in the browser and not needed here.

## Steps and sizing

1. **1a (one pull request into `develop`).** `supabase/` folder and config, migration for `profiles`, `reserved_usernames`, trigger and RPC, the pgTAP username tests and the coverage guard, CI job, README section on running it.
2. **1b (one pull request).** Migration for the eight job-tracking tables with composite keys and policies, the isolation test, and a short mapping note (SQLite column to Postgres column) that item 2 and item 7's import will reuse.
3. **Wrap up.** Update `TODO.md` (check item 1, move item 2 to Current) and the parent plan.

## Decisions (answered)

- **Scope:** split as above, piece by piece. Only add tables when a page needs them.
- **Ids:** `bigint generated always as identity`.
- **Username changes:** allowed. Assumed default: the old name redirects to the new one for a while (needs a `username_history` table; deferred to item 7, when `/<username>/resume` exists, so 1a does not include it). Say if you would rather let old links break.
- **Import of `data/tracker.db`:** not now. Later, import only the data a given page needs.
- **Hosted project:** the existing Supabase project.
- **Email confirmation:** required on sign-up.
- **Commits:** nothing is committed or pushed unless asked.
