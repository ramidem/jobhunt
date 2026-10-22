# Auth, user and workspace plan

Status: draft for review. Branch: `feature/auth-workspace-plan`.

## Where things stand

- **Auth:** Supabase email and password. `AuthGate` (client) shows the sign-in form. `server/index.ts` checks the Bearer token against Supabase `/auth/v1/user` for every `/api/*` call except `/api/resume`. Sign-ups are off; the one user is created by hand.
- **Data:** one SQLite file (`data/tracker.db`, local, gitignored) behind a Node HTTP server on `127.0.0.1:4173`. No table has a user column; the whole database is one person's job hunt.
- **UI:** a static export (`output: "export"`). `/` is the sign-in page. The 14 workspace pages, the public resume and both layouts are parked in `src/disabled/`.
- **Gap:** the verified user is thrown away. `requireUser` only returns ok or 401, so the API never knows who is calling, and nothing ties a row to a user.

## The decision that shapes everything

Is the workspace **single-user** (only you) or **multi-user** (others get their own workspace)?

| | Single-user (recommended to start) | Multi-user |
| --- | --- | --- |
| Auth | Supabase login is the lock; one allowed account | Supabase users are tenants |
| Data | Keep SQLite as is | Needs `user_id` on every table, or one database per user |
| Hosting | Local server is fine | Needs a hosted API and database (Supabase Postgres fits) |
| Cost | Small | Rewrites `server/db.ts` and every query |

Recommendation: ship single-user first, but make `requireUser` return the user and store `user_id` from day one in new tables, so multi-user is a migration and not a rewrite.

## Target shape

```
Browser (static export)
  / .............. AuthGate: sign in, then the workspace shell
  /(workspace)/*  pages, rendered only with a session
        |  Bearer <supabase access token>
        v
API (server/index.ts)
  requireUser(req) -> { id, email }   // verified once per request
  handlers receive the user
        |
        v
SQLite today -> user-scoped rows tomorrow
```

## Phases

1. **Identity on the server.**
   - `requireUser` returns `{ id, email }` and the handlers receive it.
   - Add `ALLOWED_EMAILS` (comma separated). Reject anyone else with 403, even if Supabase accepts the login. This replaces relying on sign-ups being off.
   - Cache a verified token for about 60 seconds to avoid a Supabase call per request.
2. **Session UX.**
   - Move the auth state into one `AuthProvider` (`useAuth()` gives user, loading, signOut) so the gate, nav and API client share it.
   - Add sign-out, a visible signed-in email, an expired-session redirect (API 401 clears the session), and a password-reset flow.
3. **Workspace shell.**
   - Re-create the shell as a route group `(workspace)` with the layout that checks the session once. Pages no longer need their own gate.
   - `/` signs in; after sign-in it redirects to `/dashboard`.
   - Unparking order: dashboard, applications, companies, then the rest in small PRs, each one lint, typecheck and build clean.
4. **Data ownership** (only if multi-user).
   - New migration adds `user_id TEXT NOT NULL` to each owned table and an index; backfill existing rows with your Supabase user id.
   - Every query filters by `user.id`; add a test that user B cannot read or write user A rows.
   - Decide SQLite per user vs hosted Postgres before starting this phase.
5. **Hardening.**
   - Fail closed already exists; add a CI check that the production build refuses to run without the Supabase env vars.
   - Move `data/qualifications.json` behind the API so it is no longer in the page bundle.
   - Revisit Google login (Supabase provider) once the above is stable.

## Open questions

- Single-user or multi-user? (Drives phase 4 and hosting.)
- Where does the API run once this is deployed: still on your machine, or hosted? A static host cannot run `server/index.ts` or SQLite.
- Keep a public resume at all? Today it is parked; the old `/` was the public page. A public route would need its own plan so it does not share the gate.
- Which email(s) go in `ALLOWED_EMAILS`?
- Password reset and email confirmation: use Supabase's email templates, or skip while there is one user?

## Suggested first PR

Phase 1 only: `requireUser` returns the user, `ALLOWED_EMAILS` is enforced, token cache, and a small test. It is server-only, so it is safe to merge while the pages stay parked.
