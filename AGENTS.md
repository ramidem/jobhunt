# Resume Repo Agent Instructions

## Project Resume Agent

Use this workflow when a repo is added under `/Users/ramidem/Code/Github/resume-reference` and the goal is to turn that codebase into resume material.

## Public App Strategy

The public app should show the most notable, evidence-backed work rather than trying to be every possible resume at once.

- Keep the public page simple, readable, and broad.
- Surface strongest project/work entries from `projects/*-resume.md`.
- Do not overfit the public page to a single role.
- When applying to a specific role, generate a tailored resume from the Markdown project records instead of manually rewriting source evidence.
- Keep uncertain claims, metrics, and ownership out of the public app until confirmed.
- For NDA/client work, default to public-safe names and domain descriptions. Keep private project/client names only in local Markdown records.

### Goal

Create two public-safe project files:

- `projects/<project-slug>.md`: source-reviewed evidence log
- `projects/<project-slug>-resume.md`: resume-ready synthesis and bullet candidates
- update `projects/tech-stack.md`: cumulative technology count and review-priority index

If multiple repos belong to the same product, combine them under one product slug. Example: `gussy-collage` and `gussy-website` become `projects/gussy.md` and `projects/gussy-resume.md`.

### Privacy Rules

- Treat reference repos as private unless the user explicitly says otherwise.
- Do not commit copied source code, secrets, `.env` contents, service account details, private remote URLs, customer data, tokens, or internal credentials.
- Evidence pointers may use local relative names like `repo-name/path/to/file.js`, but avoid full private clone URLs.
- Write public-safe claims only. If ownership, impact, dates, or metrics are uncertain, mark them as needing confirmation.

### Evidence Pass

Inspect only what is needed to understand the project:

- `README.md`, package manifests, framework config, deployment config
- route/page maps, key feature modules, API/server functions
- data models, integration points, payment/email/export code
- tests or scripts that show quality/deployment expectations

Prefer `rg`, `find`, `sed`, and targeted file reads. Avoid broad dumps of entire private repos.

### `projects/<project-slug>.md` Format

Use this structure:

```md
# Project Name

## Resume Record

Status: source-reviewed draft
Project name:
Public name:
Private name:
NDA status:
Related systems:
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category:
Dates: TBD
Role: TBD

## One-Line Summary

## Product Scope

## Technical Scope

## Notable Work Areas

## Draft Resume Bullets

## Evidence Pointers

## Open Questions
```

This file is the evidence log. Keep it factual and traceable.

### `projects/<project-slug>-resume.md` Format

Use this structure:

```md
# Project Name Resume Companion

## Purpose

## Best Resume Positioning

## What I Did

## Impact Framing

## Tech To Mention

## Strongest Bullet Options

## Short Resume Version

## Experience Version

## Project Version

## Final Resume Entry Draft

## Confidence Notes

## Questions For Later
```

This file is the decision layer. It should synthesize what belongs in the actual resume.

### Bullet Rules

- Start bullets with strong verbs: Built, Implemented, Automated, Integrated, Maintained, Migrated, Reduced, Improved.
- Prefer product/business impact over raw task lists.
- Mention technology only when it strengthens the claim.
- Do not invent metrics. Add placeholders or questions for missing impact data.
- If ownership is uncertain, use safer wording such as "built and maintained" or "supported" until confirmed.

### Tech Stack Index

Maintain `projects/tech-stack.md` after each project workflow run.

- Count each technology once per product/project, even if multiple repos under that product use it.
- Keep a summary table with technology, project count, project names, resume priority, and notes.
- Add a per-project section listing primary resume technologies and supporting technologies.
- Use `High` priority for resume-defining or repeated tools, `Medium` for useful differentiators, and `Low` for supporting tools or unconfirmed ownership.
- Do not inflate counts by listing framework subfeatures as separate technologies unless they matter for resume review.

### Final Checks

Before marking the project record done:

- Run `npm run lint`
- Run `npm run typecheck`
- Run `npm run build`
- Commit the project files with a conventional commit, usually `docs: add <project> project record`, `docs: synthesize <project> resume entry`, or `docs: update tech stack index`

## Public Resume Site

The public resume is in a separate repo (`ramidem/ramidem.github.io`, folder `resume/`). Before editing it, read `docs/public-resume.md` for the owner's rules, and `projects/confirmed-claims.md` for facts the owner has confirmed. Show a draft first, regenerate the PDF, keep it to one page, and push only after approval.

## Tailored Resume Workflow

Use this workflow when the user provides a job description, role type, company, or target resume direction.

1. Read `projects/tech-stack.md` to identify repeated technologies and strongest focus areas.
2. Read the relevant `projects/*-resume.md` files, not raw source repos, unless evidence needs refreshing.
3. Use the `Public name` for NDA/client work unless the user explicitly approves the private name for that target resume.
4. Select the best matching bullets for the target role.
5. Prefer confirmed work and avoid unverified metrics.
6. Keep project dates, role framing, and ownership language consistent with the companion files.
7. Produce a role-specific resume draft from the Markdown records.
8. If the user approves, update `src/data/resume.ts` for that tailored version or create a separate export artifact, depending on the requested workflow.

## Code Conventions

Apply these when writing or reviewing app code (`src/`). The auth and workspace build order lives in `TODO.md`.

### Layering (DRY and SOLID)

- Components and pages never call Supabase or `fetch` directly. Layers: `src/services/*` (data access), `src/hooks/*` (React state around a service), then components (render only).
- One small service per area, built with `createXService(client)` so the client is injected (tests pass a fake). Every method returns `Result<T>` from `src/services/result.ts`.
- `src/services/container.ts` is the one place services meet the real Supabase client (`authService()`, `profileService()`, ...). Hooks call those; do not call `getSupabase()` anywhere else.
- Put shared rules in one place (for example `src/lib/username.ts`); do not copy logic between components. The database stays the authority for validation; client checks only give fast feedback.
- Every new service ships with tests next to it (`*.test.ts`) using `createFakeSupabase()`; run `npm test` before pushing (the pre-push hook does).
- Add a new feature by adding a service and a hook, not by editing an existing one to do two jobs.

### React

- Keep components small and single-purpose. Pull data and side effects into hooks; leave the component to render.
- Derive values during render instead of copying them into state. Do not call `setState` in an effect to mirror props or other state.
- Use effects only to sync with something outside React (subscriptions, timers, requests). Clean up, and ignore stale responses (see `use-username-availability.ts`).
- Handle user actions in event handlers, not effects.
- Use stable ids as list keys, never the index. Do not define components inside components.
- Memoize only when it fixes a measured problem. `useMemo` for a stable service instance is fine.
- Prefer uncontrolled forms with `FormData`; use controlled inputs only when the UI depends on the value.
- Accessibility: every input has a label; status and error text uses `role="status"` or `role="alert"`; icon-only buttons have an `aria-label`; everything works by keyboard.
- TypeScript: no `any`; use discriminated unions (like `Result`); type props as `Readonly`.
- Expect duplicate effect runs in `next dev` (Strict Mode). Do not "fix" them; check behavior in a production build.

### Next.js

- Server Components by default; add `"use client"` only on small interactive leaves.
- Mutations go through Server Actions that check the user and validate input with `zod`. Route handlers are for webhooks and outside callers.
- Secrets never use `NEXT_PUBLIC_*`; server-only modules import `server-only`.
- Await `params` and `searchParams` (Next 15+). Use `notFound()` for missing records.
- Use `next/image` and `next/font`; give each route segment `loading.tsx`, `error.tsx` and `not-found.tsx` where it makes sense.
