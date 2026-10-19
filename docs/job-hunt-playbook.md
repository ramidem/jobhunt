# Job-hunt playbook

How the job-hunt workspace (this repo's `server/` and `src/app/(workspace)`) is meant to be used, and how a Claude session should work with it. Read this before changing or operating the tracker.

The tracker runs locally (`npm run serve`, SQLite at `data/tracker.db`, gitignored) and is reached over Tailscale. It stores no personal data in git. Personal preferences and the owner's real details live in Claude's private memory, not here.

## Ground rules

- **Draft, the owner sends.** Never apply, message, connect with, or email anyone on the owner's behalf. Save, research, draft and prepare; ask before each outward step.
- **Read-only on job sites.** Browse like a person: one page at a time with waits. No bulk or automated crawling of signed-in sites (LinkedIn, Indeed). If a site shows a human check, stop and ask; do not work around it.
- **Public repo.** No personal data, contacts, application history, client names or emails in commits. Seeds that name real companies or people belong in the database, not in git.
- **No invented facts.** Resume bullets, outreach and interview answers use only what the owner's project records support. Client work uses public names. Unknown details go in `[brackets]`.
- **Only Active roles.** Searches target roles marked Active on the Roles page (`GET /api/roles`, `active: true`). Stretch roles (DevOps, cloud, AI) are fine, positioned as hands-on exposure plus willingness to learn, never as expertise.
- **Back up before bulk changes:** `sqlite3 data/tracker.db ".backup '<path>'"`.

## Data model in one minute

Companies own jobs. A job has one application (status, notes), many skills, many hiring contacts, and a 4-character code (the handle the owner uses in chat). Companies have a kind (employer, agency, confidential), website, careers link, LinkedIn page and a priority flag. Contacts belong to a company and can be assigned to jobs. `contact_log` records every touch. New tables for phases 2–4 are described below.

API (local, JSON): `/api/applications`, `/api/companies`, `/api/contacts`, `/api/job-contacts`, `/api/contact-log`, `/api/import`, `/api/company-import`, `/api/job-links`, `/api/job-priority`, `/api/dashboard`, `/api/learn*`, `/api/todos`. Schema changes go in `server/db.ts` `migrations` (append only).

## Phase 1: intake

Goal: a posting becomes a clean, complete record.

1. Clean the URL (Indeed: keep `?jk=`; LinkedIn: `/jobs/view/<id>/`).
2. Read the posting: title, company, location, work type, pay, posted date, description, any named contact. If a site blocks the browser, use another route or have the owner paste the text.
3. Identify the real employer. For an agency, record the end client in `client_note`.
4. Find the company's website, careers page, LinkedIn page; look for a recruiter or hiring manager on the company's LinkedIn People tab (`?keywords=recruiter`).
5. Save with `POST /api/import` or `POST /api/company-import`. The job gets a code, detected skills and a match %.
6. Report: code, fit vs Active roles, missing skills, who to contact.

## Phase 2: go direct

For jobs marked Priority:

1. **Company brief**: what they build, size, stack, recent news, who runs engineering. Stored on the company (`brief`).
2. **People**: a recruiter plus an engineering lead or founder, two or three per company, assigned to the job.
3. **Outreach drafts**: short, honest notes per person and channel, stored as drafts (`outreach`) with status `draft` until the owner marks them sent.
4. **Resume for the posting**: Tailor page from the project records; no new claims.
5. **Interview prep**: add company-specific cards to Learn.
6. **Follow-ups**: log each touch in `contact_log` with a follow-up date; the Dashboard surfaces what is due.

## Phase 3: interviews and offers

Each application can have `interviews` (round, date, with whom, format, prep brief, notes, outcome) and `offers` (pay, schedule, benefits, notes, decision). Before a round: write a one-page brief (company recap, likely questions from the description, the owner's read-aloud answers, questions to ask). Mock interviews run through Learn.

## Phase 4: learn from results

The Dashboard funnel counts saved, applied, replied, interviewing and offers by source, role type and direct-vs-board. A weekly scheduled task finds new postings for Active roles at priority companies and posts a Monday summary of what to do. Skill gaps that cost interviews move up the Learn queue.

## Operating notes

- The server is a launch agent (`com.ramidem.jobhunt`); restart with `launchctl kickstart -k gui/$(id -u)/com.ramidem.jobhunt`.
- The static site is built with `npm run build` into `out/`; the server serves it.
- Quality gates before committing: `npm run lint`, `npm run typecheck`, `npm run build`.
