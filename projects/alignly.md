# Alignly

## Resume Record

Status: source-reviewed draft
Project name: Alignly / Alignly GloryReborn
Related systems: alignly-gloryreborn, glory-reborn-philhealth-forms, alignly-app, product-alignly, product-alignly-gloryreborn
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: AI-augmented Symph client work; HRIS/payroll platform; project leadership
Dates: Feb 2026 - Jun 2026
Role: Project Lead / AI-Augmented Product Engineer

## One-Line Summary

Led an AI-augmented build of a custom HRIS and payroll platform with employee lifecycle, attendance, payroll, RBAC, documentation, audit, and companion form workflows.

## Product Scope

Alignly is an HRIS and payroll platform tailored for organization operations. The reviewed source includes employee records, onboarding, attendance, leave and time-off, time tracking, payroll, payslips, schedules, roles, departments, handbook/docs, messages, notifications, audit logs, billing, biometrics, reports, volunteers, and settings workflows.

The related PhilHealth forms companion covers patient/admin form workflows, editable form entries, authenticated PDF previews, and duplicate-save protections.

## Technical Scope

- Next.js 16 App Router application with React 19 and TypeScript.
- Firebase Auth, Firestore, Firebase Admin, Firebase Storage, and Firebase emulator-backed rules tests.
- CASL permission model, role settings, admin/member flows, and permission-gated app areas.
- API routes under `/api/v1` for attendance, auth, employees, payroll, settings, billing, audit logs, schedule, reports, devices, notifications, and integrations.
- Jest, Playwright, Firestore/Storage rules tests, generated docs search, generated release notes, and CI-style verification scripts.
- Supporting integrations and tooling include TanStack Query, Zod, Resend, Stripe/SymphPay billing, Nango/Xero, PostHog, MiniSearch, and PDFKit.

## Notable Work Areas

- Led the AI-augmented project workflow across product scope, implementation, verification, and release/readiness tasks.
- Built and maintained HR workflows for employees, attendance, time-off, payroll, payslips, schedules, roles, docs, audit logs, and notifications.
- Implemented org-scoped Firestore data access, permission-based UI/API behavior, role settings, and security test coverage.
- Maintained documentation and release tooling through generated docs search, release notes, validation scripts, and internal documentation pages.
- Built companion PhilHealth form workflows including admin invite flows, editable entries, authenticated PDF previews, field options, patient creation, and duplicate-save fixes.

## Draft Resume Bullets

- Led AI-augmented development of a custom HRIS/payroll platform covering employees, attendance, time-off, payroll, RBAC, docs, reports, and audit trails.
- Built production Next.js/Firebase architecture with org-scoped Firestore, permission-based CASL gates, API routes, tests, release notes, and searchable docs.
- Shipped companion PhilHealth forms workflows with patient/admin flows, authenticated PDF previews, editable form fields, and duplicate-save fixes.

## Evidence Pointers

- `alignly-gloryreborn/package.json`: Next.js, Firebase, CASL, TanStack Query, Zod, PostHog, Resend, billing, testing, docs search, and release scripts.
- `alignly-gloryreborn/src/app/(app)`: attendance, settings, biometrics, documentation, schedule, messages, calendar, time-off, payslips, audit log, dashboard, handbook, volunteers, disciplinary, payroll, performance, time tracking, notifications, billing, onboarding, reports, and employees pages.
- `alignly-gloryreborn/src/app/api/v1`: attendance, audit logs, settings, schedule, calendar, config, auth, org, Xero, employees, payroll, notifications, and related API surfaces.
- `glory-reborn-philhealth-forms`: focused companion workflow for patient/admin form handling and PDF preview work.
- Git date evidence: main Alignly application commits run Feb 13, 2026 through Jun 29, 2026; PhilHealth companion commits run Jun 25, 2026 through Jun 29, 2026.

## Open Questions

- Should public resumes call this `Alignly`, `Alignly GloryReborn`, or a generic `HRIS/Payroll Platform`?
- Can the client or organization name be shown publicly, or should the entry stay anonymized?
- Were there measurable outcomes such as users onboarded, payroll cycles supported, manual work reduced, or production launch milestones?
