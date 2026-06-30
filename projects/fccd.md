# FCCD

## Resume Record

Status: source-reviewed draft
Project name: FCCD / ARC Operations Platform
Related systems: fccd, fccd-poc
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: AI-augmented Symph client work; operations platform; project leadership
Dates: May 2026 - Jun 2026
Role: Project Lead / AI-Augmented Product Engineer

## One-Line Summary

Led an AI-augmented operations platform for distributor sales, account management, visit scheduling, market workflows, purchase orders, consignment, reports, exports, and admin controls.

## Product Scope

FCCD is an operations platform for staff and distributor workflows. The reviewed application includes staff dashboards, manager dashboards, account pages, sales portal flows, distributor report uploads, visit schedules, market workflow policies, product offerings, export dashboards, admin user management, store pages, and distributor authentication.

The POC repo shows earlier proof-of-concept work around sales dashboards, distributor reports, account categories, consignment report flow, delivery receipts, PDF generation, optional uploads, and storage fallback.

## Technical Scope

- Next.js 16 application with React 19 and TypeScript.
- Firebase Auth, Firestore, Storage, and Firebase Admin for app data and server-side operations.
- Staff and distributor route groups with session-protected layouts.
- Admin and operations modules for accounts, distributor reports, visits, sales, exports, market workflow policies, and user management.
- Reporting/export support through Recharts, ExcelJS, jsPDF, html2canvas, and file upload flows.
- Resend-backed email handoff and Playwright E2E test scripts.

## Notable Work Areas

- Led AI-augmented delivery from POC workflows into a fuller operations platform.
- Built admin controls for user management, market workflow policies, product offerings, and operational defaults.
- Implemented sales and distributor workflows around reports, purchase orders, consignment, delivery receipts, invoices, account visits, and exports.
- Built Firebase-backed auth/session handling, data access, storage/upload support, and server-side admin actions.
- Added dashboard and report surfaces for staff, managers, distributors, stores, and export workflows.

## Draft Resume Bullets

- Led AI-augmented build of an operations platform for account management, distributor reports, sales workflows, visit schedules, and market dashboards.
- Implemented purchase order, consignment, invoice/DR, report upload, export dashboard, and market workflow policy flows.
- Built Firebase-backed auth/session handling, user/admin management, file upload, PDF/export, email handoff, and Playwright smoke-test paths.

## Evidence Pointers

- `fccd/package.json`: Next.js, Firebase, Firebase Admin, Resend, Recharts, ExcelJS, jsPDF, html2canvas, Zod, Playwright, and typecheck/build scripts.
- `fccd/README.md`: ARC Operations Platform with Firebase Auth, Firestore, Storage, Resend, Cloud Build/Cloud Run deployment context, and protected session routes.
- `fccd/src/app/(staff)`: accounts, admin, dashboard, distributor reports, export dashboard, manager dashboard, and visit schedule.
- `fccd/src/components/organisms`: admin, account, distributor reports, export, manager dashboard, sales, store, and visit schedule panels.
- `fccd/src/lib`: auth, sales, distributor reports, market workflow policies, server admin auth, server email, sale documents, and user management modules.
- Git date evidence: POC commits run May 6, 2026 through May 13, 2026; main FCCD commits run May 7, 2026 through Jun 4, 2026.

## Open Questions

- Can FCCD or ARC be named publicly, or should the entry be anonymized as an operations platform?
- Were there measurable outcomes such as workflows launched, reports processed, distributor users, or manual steps reduced?
- Should POC work be mentioned in resumes, or kept only as source context?
