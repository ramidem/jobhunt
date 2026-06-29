# Lesson Planner

## Resume Record

Status: source-reviewed draft
Project name: Lesson Planner
Related systems: Lesson Planner PH web app, Daily Lesson Log export, landing/blog content surfaces
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: Work / Symph client project
Dates: Aug 2024 - Sep 2024
Role: Software Engineer / contributing engineer

## One-Line Summary

Supported a Next.js/Nx AI lesson-planning platform by improving DOCX export flows, landing content UX, modal behavior, and portal display details.

## Product Scope

Lesson Planner is an AI-assisted lesson-planning product for educators. The repository is an Nx monorepo with multiple Next.js apps, a backend service, shared libraries, datastore/auth modules, OpenAI/prompt utilities, and extensive teacher-facing feature documentation.

The source-backed work tied to Med is narrower than the full current system. It centers on:

- Daily Lesson Log export to Word documents
- landing/blog carousel and image gallery UX
- modal behavior and generate-flow safeguards
- portal/logo display fixes
- environment-driven landing counts
- table/content display fixes for generated lesson-plan data

## Technical Scope

- Next.js web app in an Nx monorepo
- TypeScript and React UI work
- TailwindCSS utility styling in landing and modal components
- DOCX generation using `docx` and browser download support through `file-saver`
- Daily Lesson Log parsing and table generation for English/Filipino and standard/MATATAG formats
- Responsive image carousel and modal flows for landing/blog content
- Google Cloud Datastore and staging/backend setup present in the broader product context

## Notable Work Areas

- Improved Daily Lesson Log Word export so generated documents included subject, grade, objectives, weekday headers, table rows, and empty-cell handling.
- Adjusted DOCX table rendering for Daily Lesson Log content using `docx` table rows, cells, paragraphs, layout, and landscape page configuration.
- Improved landing/blog content surfaces with responsive carousel sizing, image-card display, image modal sizing, navigation controls, and single-image vs gallery behavior.
- Updated portal and logo display behavior so selected portal data surfaced more clearly.
- Added environment-driven landing count display for educators and generated content.
- Tightened generate modal behavior so generation opens only when credit state allows it.

## Draft Resume Bullets

- Improved DOCX export for Daily Lesson Logs, including subject/grade headers, objectives, weekday tables, and empty-cell handling.
- Refined responsive landing content UX with carousel sizing, image cards, image modals, and gallery navigation.
- Fixed portal and generated-content display details across Lesson Planner web flows.

## Evidence Pointers

- `package.json` - Nx monorepo, Next.js, React, TypeScript, NestJS, Google Cloud, OpenAI, `docx`, `file-saver`, TailwindCSS, analytics, and testing dependencies.
- `README.md` - product setup, Lesson Planner PH frontend setup, Datastore emulator, staging backend, and AI prompt-app origins.
- `apps/web/utils/downloadDllToDocTemplate.ts` - Daily Lesson Log DOCX export, header table, weekday columns, objective rows, content rows, and landscape document generation.
- `apps/web/interfaces/dll.ts` - DLL document header and processing result interfaces.
- `apps/web/components/organisms/BlogPostCarousel.tsx` - responsive blog carousel, image modal/gallery behavior, and article card interaction.
- `apps/web/components/ImageModal.tsx` - full-screen image modal, post/image navigation, responsive controls, and image-card display.
- `apps/web/components/molecules/ImageCard.tsx` - landing image card rendering with title, date, caption, and responsive image behavior.
- `apps/web/pages/index.tsx` - landing redirect and selected portal handling.
- Git evidence: 30 matching commits, 26 non-merge commits, dated Aug 28, 2024 through Sep 20, 2024.

## Open Questions

- Confirm whether this should be shown publicly as `Lesson Planner`, `Lesson Planner PH`, or folded under a broader Symph work entry.
- Confirm the official role/title used on this project.
- Confirm whether contribution was limited to the source-backed clusters above or included broader V2/backend/prompt work outside the visible commit evidence.
- Confirm whether there are measurable outcomes for export reliability, teacher usage, or landing conversion.
