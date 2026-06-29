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
