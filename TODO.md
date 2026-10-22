# TODO

MVP shipped: sidebar workspace with `/resume` (paste a job description, get a keyword-ranked resume), `/applications`, `/qualifications`, `/skills`.

## Priority: auth decisions (Supabase)

Email and password sign-in is wired (`AuthGate`, Bearer token checked in `server/index.ts`). Open decisions:

- [ ] Scope: gate only the private workspace (current; `/` stays public) or also add visitor sign-in on the public resume.
- [x] Allowed account: public sign-ups are disabled in Supabase and the user is created by hand. Add an email allowlist only if sign-ups are ever re-enabled.
- [x] API protection: `/api/*` (except `/api/resume`) verifies the token with Supabase and fails closed when the env vars are missing (`ALLOW_NO_AUTH=1` opts out for the server; the gate only opens in `next dev`).
- [ ] Static export: `data/qualifications.json` is still bundled into the page JS, so the gate hides the UI but not that data. Serve it through the API if it must stay private.
- [ ] Add Google login later: enable the provider in Supabase, add `signInWithOAuth`, and allow redirect URLs for localhost, `127.0.0.1:4173`, and production.

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
- [x] Soft skills for the public resume confirmed and added 2026-10-20 (leading, standups, collaboration, feedback, mentoring and code review); see `projects/confirmed-claims.md`. Original note: soft skills are inferred for a senior engineer, except daily standups (confirmed by Med). Review: partnering with stakeholders (Alignly), setting priorities and explaining choices to non-technical teams (FCCD), mentoring and code review (MLhuillier), guiding developers (Coaxis), responding to review feedback (MyPetCare). HTML and CSS, REST APIs and the CI/CD flow are now confirmed (see `projects/confirmed-claims.md`).
- [ ] Earlier: confirm claims that were written to match the format: HTML and CSS (dropped from the resume when bullets were sorted by date; add back to a bullet only if confirmed), "AI-augmented" lead wording, Lesson Planner "Word documents" wording.
- [ ] Per-role keyword templates (full stack, backend, Python, etc.) in the tailor, with the stack and cloud in the first bullet.
- [ ] Visa or work-authorization line for the target country; never write "open to relocation".
- [ ] Application timing: apply within the first 100 applicants; track posting age in `/applications`.

## Applications

- [ ] Sync storage (Firestore is already a dependency) so data isn't tied to one browser.
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
