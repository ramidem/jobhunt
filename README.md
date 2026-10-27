# Resume

Two things live in this repo:

1. **A public resume site** (Next.js, static export): the resume page, a PDF download, a JSON copy at `/api/resume`, and a contact form that writes to Firestore from the browser.
2. **A private job-hunt workspace** (same app, `src/app/(workspace)/(private)`): jobs, companies, contacts, outreach drafts, interviews, a Learn page and results, backed by a local SQLite database and a small local server.

> **Not deployed.** Nothing here is hosted on Vercel yet. The workspace is meant to run locally only, and it needs the local server for its data. Do not deploy the static `out/` folder as-is: it would publish the workspace pages too. Split or protect those routes first (see [Deployment](#deployment)).

## Quick start

```bash
npm install
npm run dev          # Next.js dev server on http://localhost:3000 (resume only; workspace data needs the server below)
```

To run everything together, as the workspace is meant to be used:

```bash
npm run build        # static export into out/
npm run serve        # serves out/ and the /api on http://127.0.0.1:4173 (Node 24+)
```

`npm run serve` creates `data/tracker.db` on first start and seeds it. Nothing in `data/` except `qualifications.json` is committed.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Static export to `out/` |
| `npm run serve` | Local server: serves `out/` plus the SQLite-backed JSON API |
| `npm run start:local` | Build, then serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

Run `lint`, `typecheck` and `build` before committing.

## Layout

```
src/app/               Next.js routes; (workspace) is the private job-hunt UI
src/components/        UI (shadcn/ui in components/ui, workspace pieces in components/workspace)
src/data/resume.ts     Resume content, validated by src/lib/resume-schema.ts
src/lib/               API client, formatting, shared types
server/                Local API server, SQLite schema and migrations, seed data
projects/              Evidence logs and resume synthesis per project (Markdown)
docs/                  Job-hunt playbook
public/                Icons, PWA assets, import bridge page
```

## Resume content

Edit `src/data/resume.ts`. The web page, the PDF (`src/components/resume-pdf-document.tsx`) and the structured data all read from it. The machine-readable copy is at `/api/resume`.

## Job-hunt workspace

- **Data:** SQLite at `data/tracker.db` (gitignored). Schema changes go in the `migrations` list in `server/db.ts`; append new entries and never edit ones that have shipped.
- **API:** JSON under `/api`, implemented in `server/index.ts`.
- **Pages:** Applications (phase 1), Outreach (phase 2), Interviews (phase 3), Results (phase 4), plus Dashboard, Schedule (weekly routine, seeded Mon-Fri), Companies, Roles, Skills, Learn and TODO. Mobile-first, installable as a PWA.
- **Playbook:** how the phases work and the rules for operating the tracker are in [`docs/job-hunt-playbook.md`](docs/job-hunt-playbook.md).
- **Auto-start on macOS (optional):** `ops/com.ramidem.jobhunt.plist` is an example launch agent. Edit the paths for your machine before using it.

The workspace stores personal data. Keep `data/tracker.db` and its backups out of git.

## Environment

Copy `.env.example` to `.env.local`.

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

The contact form saves to the `resumeMessages` Firestore collection straight from the browser (the static export has no server routes). Without Firebase values it validates the message and reports it as not stored. Firestore rules must allow that write.

Optional server settings: `PORT` (default 4173), `HOST` (default 127.0.0.1), `TRACKER_DB` (database path).

## Project records

Evidence and resume synthesis live under `projects/`:

- `projects/<slug>.md`: source-reviewed evidence log
- `projects/<slug>-resume.md`: resume-ready synthesis and bullet candidates
- `projects/tech-stack.md`: technology count and review-priority index

Role-specific resumes are generated from these records, not from raw source repositories. See `AGENTS.md` for the workflow and privacy rules.

## Deployment

Not set up. When it is, the public site is a static export, so Vercel (or any static host) can serve `out/`. Before that:

- keep the private workspace routes out of the public build (separate project, route group removed from the deploy build, or access control in front of it);
- set the environment variables above in the host;
- re-check that no personal data, database files or backups are in the repository.

## Code structure

UI code never talks to Supabase or `fetch` directly.

- `src/services/`: one small service per area (`createProfileService(client)`). The client is passed in, so a test can pass a fake. Every method returns `Result<T>` (`ok` or `fail`).
- `src/hooks/`: React state wrapped around a service (`useProfile`).
- `src/components/` and `src/app/`: render and wire hooks; no data access.

## Tests and git hooks

- `npm test` runs the unit tests (Vitest). Service tests sit next to the services (`src/services/*.test.ts`) and use a fake Supabase client from `src/services/testing/fake-supabase.ts`. `npm run test:watch` re-runs on change.
- `npm run db:test` runs the database tests (see Database below).
- Husky hooks (installed by `npm install`): `pre-commit` lints staged files; `pre-push` runs lint, typecheck and `npm test`. `--no-verify` skips them, so CI is the real gate.
- CI (`.github/workflows/node.js.yml`) runs lint, typecheck, `npm test` and build, plus the database tests, on every pull request and on pushes to `main` and `develop`. Open pull requests early (as drafts) so every push to a feature branch runs CI.

## Database (Supabase)

Schema, Row Level Security and database tests live in `supabase/`:

- `supabase/migrations/`: plain SQL, applied in filename order (`<timestamp>_<name>.sql`).
- `supabase/tests/database/`: pgTAP tests. `02_rls_coverage.test.sql` fails if a public table has no RLS or no policy.
- `job_posts` is one saved posting per user. `url_norm` is computed in the database: tracking parameters are stripped, and a LinkedIn `currentJobId` (or `/jobs/view/<id>`) becomes `https://www.linkedin.com/jobs/view/<id>/`. The same normalized link cannot be saved twice by one user. Push this migration to the hosted project only after review (`npx supabase db push`).

Commands (need Docker; the Supabase CLI is a dev dependency):

```bash
npm run db:start   # local stack
npm run db:test    # run the pgTAP tests
npm run db:stop
```

### Making a database change

1. Create a migration: `npx supabase migration new <name>`, then write the SQL. Never edit a migration that has shipped; add a new one.
2. Every new table in `public` needs `alter table ... enable row level security`, policies, and explicit grants: Supabase can give `anon` and `authenticated` access to new public tables by default, so `revoke all` first and grant only what is needed, as the profiles migration does. Owned tables get a `user_id` column and policies on `(select auth.uid())`.
3. Add or update a test in `supabase/tests/database/`.
4. Apply it locally and test: `npx supabase db reset` (a stack started from a backup does not apply new migrations), then `npm run db:test`.
5. Open a pull request into `develop`; CI runs the `database` job.
6. After it is merged, push to the hosted project:
   ```bash
   npx supabase db push --dry-run   # check the list of migrations
   npx supabase db push
   npx supabase migration list      # local and remote versions should match
   ```

### Hosted project setup (once)

- Dashboard, Authentication: allow new sign-ups and require email confirmation.
- `npx supabase login`, then `npx supabase link --project-ref <ref>` (the ref is the first part of the project URL).
- One-off data fixes can run with `npx supabase db query --linked "<sql>"`. Prefer a migration for anything that should be repeatable.

## Branching (gitflow)

- `main`: production releases only.
- `develop`: integration branch; feature branches start here and merge back by pull request.
- `feature/<name>`: branch from `develop`.
- `release/<version>` and `hotfix/<name>`: branch from `develop` and `main` respectively; merge into both `main` and `develop`.

CI (lint, typecheck, build) runs on pushes and pull requests to `main` and `develop`.
