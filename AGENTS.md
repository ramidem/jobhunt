# Resume Repo Agent Instructions

## Project Resume Agent

Use this workflow when a repo is added under `/Users/ramidem/Code/Github/resume-reference` and the goal is to turn that codebase into resume material.

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
