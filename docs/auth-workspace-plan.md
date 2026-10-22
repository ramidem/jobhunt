# Auth, user and workspace plan

Status: draft v3, architecture decided. Branch: `feature/auth-workspace-plan`.

## Decisions

- **Multi-user.** Each user gets their own workspace and public resume.
- **Open sign-up.** Anyone can sign in or sign up with email and password. Google login comes after the flow works.
- **API on GCP.** Cloud Run, not Nx or NestJS (see below).
- **Public resume at `/<username>/resume`.** Each user picks a unique username.
- **Split workload.** The browser calls Supabase directly for CRUD under RLS. Cloud Run only serves what needs server code.
- **Frontend on Vercel.** Next.js without static export.
- **Domain later.** Use the Vercel and Cloud Run default URLs for now.

## Where things stand

- **Auth:** Supabase email and password. `AuthGate` (client) and a Bearer token check in `server/index.ts`.
- **Data:** one SQLite file behind a Node HTTP server. No table has a user column. The resume content is one person's file, `src/data/resume.ts`.
- **UI:** a static export. `/` is the sign-in page. The workspace pages and the old public resume are parked in `src/disabled/`.

## Why the current shape cannot just be hosted

- **SQLite on GCP does not persist.** Cloud Run and Cloud Functions have an ephemeral disk. Multi-user needs a real database.
- **A static export cannot serve `/<username>/resume`.** The usernames are not known at build time. The frontend must drop `output: "export"` (server-rendered or on-demand pages) or fetch the profile on the client.
- **`ALLOWED_EMAILS` is no longer the lock.** With open sign-up, the lock is per-user data isolation.

## Architecture

```
Browser (Next.js, no static export)
  /                       sign in / sign up
  /<username>/resume      public, server-rendered from the user's profile
  /dashboard, ...         private workspace, session required
        |
        |-- Supabase (auth + Postgres with Row Level Security)
        |       profiles, resumes, and every workspace table carry user_id
        |       RLS: a user reads and writes only their own rows;
        |            a public read policy covers the published resume only
        |
        '-- Cloud Run API (the existing Node server, ported)
                verifies the Supabase JWT, runs the work that does not belong
                in the browser (skill detection, enrichment, seeding, uploads)
```

Split (decided): the browser calls Supabase directly for CRUD, protected by RLS. Cloud Run keeps only the endpoints that need server code, such as skill detection, company enrichment, seeding and file handling. Rules that must hold for every write live in RLS policies and database constraints, not in client code.

## Cloud Functions, Cloud Run, or Nx + NestJS?

- **Cloud Run (recommended).** `server/index.ts` is one HTTP server with about 1,700 lines of routes. It fits a container as is, after the SQLite calls move to Postgres. Cloud Functions 2nd gen runs on Cloud Run anyway, but it would force splitting that one handler into many functions with no gain.
- **Cloud Functions.** Worth it only for small separate jobs (a nightly follow-up reminder, a webhook). Add them later next to the API.
- **Nx + NestJS.** Not needed. The cost is a monorepo move and a rewrite of every route into controllers and modules. Reconsider only with several services or several engineers. A plain TypeScript Cloud Run service with a router and `zod` validation (already a dependency) is enough.

## Phases

1. **Database and identity.**
   - Create the Postgres schema in Supabase: `profiles` (user id, unique `username`, display name), plus the workspace tables from `server/db.ts` with a `user_id` column and RLS policies.
   - Reserved usernames (`api`, `dashboard`, `login`, `settings`, and every top-level route) and a format rule (lowercase letters, digits, hyphens).
   - Sign-up flow asks for a username; a database trigger creates the `profiles` row.
2. **Cloud Run API for server-only work.**
   - Port only the routes that need server code from `server/index.ts`; plain CRUD routes are replaced by direct Supabase calls from the browser (`src/lib/api.ts` is rewritten around `supabase-js`).
   - Move `server/db.ts` migrations to SQL files in Supabase.
   - Verify the JWT locally with Supabase's JWKS (no network call per request) and pass `{ id, email }` into every handler.
   - Dockerfile, a Cloud Run service, secrets in Secret Manager, CORS limited to the app domain.
3. **Session and workspace shell.**
   - One `AuthProvider` (`useAuth()`), sign-out, expired-session redirect, password reset, email confirmation on.
   - `(workspace)` route group with one session check. `/` redirects signed-in users to `/dashboard`.
   - Unpark pages one or two at a time, each a small pull request.
4. **Public resume.**
   - Move resume content from `src/data/resume.ts` into per-user `resumes` rows with a published flag.
   - `/<username>/resume` renders the published resume (PDF download and JSON stay), `noindex` until the user publishes.
   - Your current resume becomes the first user's data, imported once.
5. **Open sign-up hardening.**
   - Rate limits on sign-up and on the API, email confirmation required, CAPTCHA if abuse appears.
   - Per-user storage and row quotas (the library accepts file uploads).
   - Per-user seeding: new users start empty; the shared seed data (`qualifications.json`, learn cards) becomes shared read-only tables or opt-in imports.
   - Delete-account flow that removes all of a user's rows.
6. **Google login.** Enable the Supabase provider, add the redirect URLs, add a "Continue with Google" button.

## Open questions

- Which routes in `server/index.ts` are server-only and which are plain CRUD? (An inventory is the first step of phase 2.)
- Domain name and username subdomains: later.
- Are users allowed to keep their workspace private but still publish a resume? (The plan assumes yes.)
- Which workspace features stay single-user only (for example the personal pay targets and the job-hunt playbook)?

## Suggested first PR

Phase 1 only: the Postgres schema as SQL migrations (`profiles` and the core tables with `user_id` and RLS), the username rules, and a test that user B cannot read user A's rows. No UI change, so it is safe while the pages stay parked.
