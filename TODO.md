# TODO

MVP shipped: sidebar workspace with `/resume` (paste a job description, get a keyword-ranked resume), `/applications`, `/qualifications`, `/skills`.

## Now: auth, user and workspace

**Rule: one item at a time.** Only the item under "Current" is in progress. Finish it (lint, typecheck and build pass, merged into `develop`) before starting the next. Everything below this section is parked until the list here is done. Plan and decisions: `docs/auth-workspace-plan.md`.

Decisions made: multi-user, open email/password sign-up (Google later), Supabase auth + Postgres with RLS, browser calls Supabase directly for CRUD, Cloud Run only for server-only work, Next.js on Vercel without static export, public resume at `/<username>/resume`, domain later.

### Current

- [ ] 1. Postgres schema, RLS and username. Detailed plan: `docs/plan-01-database.md`. Sub-steps, in order:
  - [ ] 1a. Foundation (profiles, usernames, RLS, tests; applied to the hosted project). Remaining:
    - [ ] Run CI: open a pull request from `feature/auth-workspace-plan` into `develop` and confirm the `database` job (`supabase start` + `supabase test db`) and the build job pass on GitHub.
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

## Parked until the auth list above is done

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
