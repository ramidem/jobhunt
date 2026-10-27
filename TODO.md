# TODO

MVP shipped: sidebar workspace with `/resume` (paste a job description, get a keyword-ranked resume), `/applications`, `/qualifications`, `/skills`.

## Now: auth, user and workspace

**Rule: one item at a time.** Only the item under "Current" is in progress. Finish it (lint, typecheck and build pass, merged into `develop`) before starting the next. Everything below this section is parked until the list here is done. Plan and decisions: `docs/auth-workspace-plan.md`.

Decisions made: multi-user, open email/password sign-up (Google later), Supabase auth + Postgres with RLS, browser calls Supabase directly for CRUD, Cloud Run only for server-only work, Next.js on Vercel without static export, public resume at `/<username>/resume`, domain later.

### Current

- [ ] 1. Postgres schema, RLS and username. Detailed plan: `docs/plan-01-database.md`. Sub-steps, in order:
  - [ ] 1a. Foundation (profiles, usernames, RLS, tests; applied to the hosted project). One at a time, top to bottom; the first unchecked line is the current one:
    - [ ] 1a.4 Cookie-based session with `@supabase/ssr` and a `proxy.ts` redirect for signed-out visitors (removes the blank flash from `AuthGate`); verify the user on the server with `getUser()`, never `getSession()`.
    - [ ] 1a.5 Server Components by default, `'use client'` only on small interactive leaves (settings becomes a server page with two client forms); fetch where data is used, `Promise.all` for independent calls, `<Suspense>` for slow parts.
    - [ ] 1a.6 Mutations as Server Actions that check the user and validate input with `zod`; route handlers only for webhooks and outside callers.
    - [ ] 1a.7 Add `loading.tsx`, `error.tsx` and `not-found.tsx` per segment; `import "server-only"` in server-only modules; secrets never in `NEXT_PUBLIC_*`; set security headers (CSP, frame, referrer) in the Next config or `vercel.ts`.
    - [ ] 1a.8 Upgrade to Next 16 (`middleware` becomes `proxy`), after 1a.4 so middleware is not written twice.
    - [ ] 1a.9 `/<username>/resume` conventions, applied when that page is built in item 7: `await params`, `notFound()` for unknown users, cache with `revalidateTag` on publish, `generateMetadata` for titles and Open Graph.
    - Rule for everything above and after: components never call Supabase or `fetch` directly. Layers are `src/services/*` (built with `createXService(client)`, returning `Result<T>`), `src/hooks/*`, then components. `src/lib/api.ts` is rewritten the same way in item 5.
  - [ ] 1b. Job tracking core: `companies`, `contacts`, `jobs`, `job_skills`, `skills`, `applications`, `contact_log`, `job_contacts` with `user_id`, composite keys, RLS, and the user A / user B isolation test.
  - Remaining tables are added with item 5, in the pull request that unparks the page using them.

### Next (in order)

- [ ] 2. Inventory `server/index.ts` routes: plain CRUD (becomes direct Supabase calls) vs server-only (goes to Cloud Run).
- [ ] 3. Sign in and land on `/settings` (redirect after sign-in; page wrapped in `AuthGate`) showing username and email, with a change-password form (`auth.updateUser`; the password itself cannot be shown, Supabase stores only a hash). Sign-up with username, `AuthProvider` / `useAuth()`, sign-out, expired-session redirect, password reset, email confirmation.
- [ ] 4. Drop `output: "export"`; `(workspace)` route group with one session check; `/` redirects signed-in users to `/dashboard`; deploy to Vercel.
- [ ] 5. Rewrite `src/lib/api.ts` around `supabase-js`; unpark `dashboard`, then one page per pull request (`applications`, `companies`, the rest).
- [ ] 6. Cloud Run API for the server-only routes (JWT verified via JWKS, Secret Manager, CORS limited to the app domain).
- [ ] 7. Per-user public resume: `resumes` table with a published flag, import the current resume as the first user's data, `/<username>/resume` with PDF and JSON, `noindex` until published.
- [ ] 8. Open sign-up hardening: rate limits, per-user quotas (library uploads), per-user seeding, delete-account flow; move `data/qualifications.json` out of the page bundle.
- [ ] 9. Google login: enable the Supabase provider, add `signInWithOAuth`, allow redirect URLs for localhost and the Vercel URL.

## Decisions for Med

These are open. Leave them as they are until Med decides.

- [ ] Disabling Supabase sign-ups (only Med's account should exist).
- [x] `/api/resume/` publicly exposing Med's phone and email. The static file is gone. Phone and email are not in the public build. Signed-in users read their own row from `resume_contact`. Manual steps: "Med: private resume contact" below.
- [ ] Committed `data/.fuse_hidden*` SQLite file.
- [ ] robots/sitemap pointing to localhost because `NEXT_PUBLIC_SITE_URL` is unset.
- [ ] Stale README "Not deployed".

## Job posts

Saved postings move off the local SQLite server into Supabase `job_posts`. These migrations are in the repo only. Med applies them to the hosted project with `npx supabase db push` after review. Do not apply them from CI.

- [x] Schema: `job_posts`, computed `url_norm`, RLS (`user_id = auth.uid()`), trigger that sets `needs_update` when a processed description changes and keeps `updated_at` current, pgTAP tests for cross-user isolation and duplicate-URL rejection.
- [x] Add-job form and list at `/applications` (behind `AuthGate`, client `supabase-js`, no server route). Zod checks the link, description and status. A duplicate shows "already saved" and links to the existing row. The form uses Med's `src/lib/job-url.ts` (null for an invalid link, no second normalizer). That helper sorts query keys with en-US; `normalize_job_url` sorts with the database collation, so mixed-case keys can differ on a C collation (they matched on en_US.utf8). An internal NBSP is null in the helper and accepted by the database, so the form refuses it. The trigger still overwrites `url_norm`.
- [x] Career role: read `new` / `needs_update` rows, `submit_extraction` for extracted fields only, no delete and no edits to `raw_description` or application status. JSON shape and the sync script are in `docs/career-extraction.md`.
- [ ] Med: apply the `job_posts` and career migrations to the hosted project (`npx supabase db push`) after review.
- [ ] Med: create the career role password (`alter role career with login password '...'`) and set `CAREER_DATABASE_URL` locally. Do not commit the password.

Item 1b (companies, contacts, and the rest of the tracker tables) stays open. `job_posts` is the posting a person saves, not that full model.

## Parked until the auth list above is done

## Done: public `/api/resume` contact leak

- [x] `/api/resume` is not part of the static export. That file was the whole resume, including phone and email, and it answered 200 with no sign-in. Phone and email are no longer in `src/data/resume.ts` (or any other module the Next build emits). The public resume body (name, links, experience, skills, education) stays in `src/data/resume.ts` and still renders from the parked public page and PDF components. Signed-in users read their own phone and email from `public.resume_contact` on Settings. RLS allows `select` only where `user_id = auth.uid()`.

### Med: private resume contact

The migration does not insert a row, and the values must not be committed. Nothing here has been applied to the hosted project.

1. Link the CLI once if this machine is not already linked (`npx supabase login`, then `npx supabase link --project-ref <ref>`). Do not change project auth settings.
2. Apply the new migration only:
   ```bash
   npx supabase db push --dry-run
   npx supabase db push
   ```
   The dry run should include `20261027010000_resume_contact`. If `20261027000000_job_posts` is still pending, it is listed too; that migration is already on main and should be applied with this one.
3. In the Supabase dashboard SQL editor (it runs as postgres and bypasses RLS), find your user id, then insert your own row. Replace the placeholders. Do not commit them and do not put them in a migration or seed.
   ```sql
   select id, email from auth.users;

   insert into public.resume_contact (user_id, email, phone)
   values ('<auth.users id>', '<email>', '<phone>');
   ```
4. Sign in on the site and open Settings. The Resume contact card shows that row. Until step 2, the card shows a load error. Until step 3, it says no contact is stored. A signed-out visitor cannot read the table. Another account cannot read your row.
5. After the next deploy from `main`, `https://resume-ten-beta-79.vercel.app/api/resume/` should no longer return the resume. Phone and email are not in the built `out/` directory.

## Before deploying

- [ ] Decide whether `data/guide.md` stays out of the repo (it says "reference only; not published").

## Tailoring (`/resume`)

- [ ] Replace keyword matching with an LLM pass (AI Gateway) for role-title detection, seniority, and soft requirements; keep the "no invented claims" rule.
- [ ] Grow the term list in `src/lib/tailor.ts` from `data/qualifications.json` instead of a hand-written map.
- [ ] Cap bullets per entry for a one-page fit; show page-length estimate.
- [ ] Generate a tailored summary/headline, with approval before use.
- [ ] Export tailored PDF via `@react-pdf/renderer` (currently browser print), and verify ATS text extraction.
- [ ] Use confirmed `projects/*-resume.md` bullets as the source pool, not just `src/data/resume.ts`.
- [ ] Use the NDA-safe public names only; add a check that private names never appear.
- [ ] Persist the tailored resume per application and let `/applications` re-open it.

## Resume format (from transcript/01.md, a recruiter's review rules)

- [ ] Bullet linter: 3 to 6 keywords per bullet, 3 to 6 bullets per role (about 3 under 3 years, 4 to 5 over 4 years), no duplicate keyword within a bullet, flag numbers, slashes, "learned", and unexplained jargon.
- [ ] Earlier: confirm claims that were written to match the format: HTML and CSS (dropped from the resume when bullets were sorted by date; add back to a bullet only if confirmed), "AI-augmented" lead wording, Lesson Planner "Word documents" wording.
- [ ] Per-role keyword templates (full stack, backend, Python, etc.) in the tailor, with the stack and cloud in the first bullet.
- [ ] Visa or work-authorization line for the target country; never write "open to relocation".
- [ ] Application timing: apply within the first 100 applicants; track posting age in `/applications`.

## Applications

- [ ] Kanban view, follow-up reminders, interview notes, contacts, salary.
- [ ] Import/export (CSV/JSON).

## Qualifications

- [ ] Group by category, sort/filter by fit against your skills.
- [ ] Show which qualifications you already cover per role (join with `/skills`).
- [ ] Refresh script to re-export the Google Sheet into `data/qualifications.json`.
- [ ] Clean up messy titles in the source data (e.g. a role title containing a full paragraph).

## Skills

- [ ] Count how many roles' qualifications mention each skill to prioritise learning.
- [ ] Learning resources, target dates, and proficiency level.
- [ ] Seed `/resume` match hints even before `/skills` is first visited.

## Quality

- [ ] Tests for `tailor.ts` (term extraction, ranking, case-sensitive terms like "Go").
- [ ] Mobile pass on the workspace layout.

## Study for the resume (priority)

- [ ] Learn: review every claim on the public resume the way an interviewer would, with cards for the tech (JavaScript, TypeScript, React, Node.js, SQL, REST, microservices, Docker, CI/CD, Git, Google Cloud), the approaches (pipeline, service boundaries, access control), and behavioral questions about each project and soft skill. Seeded 2026-10-20; keep adding.
- [ ] Learning path: "Resume deep dive" comes first. Rehearse each project's what, why and how out loud, and the pipeline flow from pull request to deploy.
- [ ] Scheduled Learn task: new cards prefer resume topics until the resume deep dive is covered.
- [x] iPhone Home Screen: manifest `start_url` is `/` (`out/index.html`). `/dashboard/` is not in the static export, so the icon was opening the 404 page.
