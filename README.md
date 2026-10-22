# Resume

Public resume site for Med Aduh. It is built with Next.js, TypeScript, Zod, Firebase-ready message capture, Google Analytics, and text-based PDF export.

The structure follows the Harvard MCS bullet-point resume template:

- header with contact links
- summary
- education
- experience
- projects / activities
- skills and interests

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality gates

```bash
npm run lint
npm run typecheck
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and fill in the values needed for deployment.

```bash
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

When Firebase is configured, `POST /api/messages` writes to the `resumeMessages` collection. Without Firebase credentials, the API still validates messages and returns a successful response with `stored: false`, which keeps local development simple.

## Content

Resume content lives in `src/data/resume.ts` and is validated by `src/lib/resume-schema.ts`.

The public machine-readable resume is available at `/api/resume`.

## Project records

Project evidence and resume synthesis live under `projects/`.

- `projects/<slug>.md`: source-reviewed evidence log
- `projects/<slug>-resume.md`: resume-ready synthesis and bullet candidates
- `projects/tech-stack.md`: technology count and review-priority index

The public app shows the most notable work. Role-specific resumes should be generated from the Markdown project records when applying to a specific job.

## Branching (gitflow)

- `main`: production releases only.
- `develop`: integration branch; feature branches start here and merge back by pull request.
- `feature/<name>`: branch from `develop`.
- `release/<version>` and `hotfix/<name>`: branch from `develop` and `main` respectively; merge into both `main` and `develop`.

CI (lint, typecheck, build) runs on pushes and pull requests to `main` and `develop`.
