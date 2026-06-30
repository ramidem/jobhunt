# MyPetCare

## Resume Record

Status: source-reviewed draft
Project name: MyPetCare
Public name: Veterinary Clinic Platform
Private name: MyPetCare
NDA status: anonymize in public resume unless naming is explicitly approved
Related systems: MyPetCare web app, backend API, pet-owner app, CASL/RBAC, clinic services, EMR, inventory, billing, payroll, financial reports
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: Work / Symph client project
Dates: Jan 2026
Role: Software Engineer / contributing engineer

## One-Line Summary

Built RBAC, backend workflow foundations, and frontend permission handling for a veterinary clinic management platform.

## Product Scope

MyPetCare is a veterinary clinic management platform for clinic operators, veterinary staff, and pet owners. The repository includes a web admin app, backend API, pet-owner app, generated API client, shared permissions library, and modules for clinics, pets, encounters, vaccines, deworming, flea/tick care, labs, services, inventory, billing, payroll, financial reports, SMS history, uploads, and scheduling.

## Technical Scope

- Frontend: Next.js, React, TypeScript, TailwindCSS, TanStack React Query, CASL React bindings
- Backend: NestJS, TypeScript, Drizzle ORM, PostgreSQL, Swagger/OpenAPI, generated API client
- Auth/authorization: Firebase Auth/Admin, Passport JWT/Firebase JWT, CASL, role-based access control
- Data/storage: PostgreSQL schema and migrations, Google Cloud Storage integration
- Platform: Nx monorepo with backend, web, pet-owner app, shared libraries, tests, OpenAPI generation, and GCP deployment scripts

## Notable Work Areas

- Implemented CASL-based RBAC across backend and frontend permission surfaces.
- Added an authorization service that uses platform roles as the source of truth and validates clinic membership for clinic-scoped access.
- Migrated role structure across user and clinic membership tables for admin, clinic owner, pet owner, vet, and staff access.
- Applied permission checks and role alignment across clinic workflows and medical/operations modules.
- Added frontend CASL provider/context support, ability hooks, and sidebar permission visibility.
- Built service management backend foundations for clinic service catalogs, categories, active/inactive states, pagination, filtering, soft deletion, and price snapshots.
- Supported encounter autosave and fixed workflow issues around inventory pagination, quantity controls, SMS history mapping, and frontend RBAC/payroll visibility.
- Regenerated OpenAPI output and API client changes alongside backend contract updates.

## Draft Resume Bullets

- Implemented CASL-based RBAC across a NestJS backend and Next.js admin UI for platform admins, clinic owners, vets, staff, and pet owners.
- Migrated role and clinic-membership authorization flows with PostgreSQL/Drizzle schema changes, service-layer checks, and generated API client updates.
- Built service management foundations and fixed workflow issues across encounters, inventory, SMS history, payroll visibility, and frontend permissions.

## Evidence Pointers

- `package.json` - Nx monorepo, Next.js, React, NestJS, TypeScript, Drizzle, PostgreSQL, Firebase, CASL, Swagger/OpenAPI, GCP, React Query, TailwindCSS, testing, and generated-client tooling.
- `apps/backend/src/app/authorization/authorization.service.ts` - service-layer CASL checks, platform-admin bypass, platform-role source of truth, clinic membership validation, and permission helpers.
- `apps/backend/src/app/casl/ability.factory.ts` - backend abilities for platform admin, clinic owner, vet, staff, and pet owner roles.
- `libs/casl/src/*` - shared CASL enums and ability library used across backend/frontend.
- `apps/backend/src/database/schema/schema.ts` - role enums, clinic membership schema, Firebase auth migration fields, and veterinary platform data model.
- `apps/backend/src/database/migrations/0059_rbac_role_restructure.sql` - RBAC migration to admin, clinic owner, pet owner, vet, and staff roles.
- `tickets/TICKET-8-CASL-Implementation.md` - completed CASL scope, acceptance criteria, backend/frontend integration notes, and role-alignment rules.
- `apps/web/src/contexts/AbilityContext.tsx` and `apps/web/src/components/providers/AbilityProvider.tsx` - React CASL provider, `Can` component support, and ability context wiring.
- `apps/web/src/components/layout/Sidebar.tsx` - sidebar visibility tied to CASL permissions.
- `apps/backend/src/app/clinics/clinics.service.ts` - clinic access checks and CASL integration for clinic operations.
- `apps/backend/src/app/services/services.service.ts` and `tickets/TICKET-1-Service-Management.md` - service catalog backend foundation and business rules.
- `apps/backend/src/app/encounters/encounters.service.ts` - encounter workflow area touched during autosave and billing/EMR integration work.
- Git evidence: 50 matching commits, 34 non-merge commits, dated Jan 13, 2026 through Jan 30, 2026.

## Open Questions

- Confirm public-safe title: Software Engineer, Backend Engineer, Full-stack Engineer, or another Symph project title.
- Confirm whether MyPetCare can be named publicly in all resume versions.
- Confirm whether this should be grouped under a broader Symph work entry or shown as a standalone project.
- Confirm whether ownership should stay scoped to RBAC/backend workflow work or include broader product ownership.
- Add measurable impact if available, such as modules protected, clinic roles supported, workflow defects fixed, or release scope.
