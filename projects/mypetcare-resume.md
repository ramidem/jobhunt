# MyPetCare Resume Companion

## Purpose

Turn the MyPetCare source review into concise resume material for backend, full-stack, platform, and product-engineering roles.

## Best Resume Positioning

Position this as Symph client/product work on a veterinary clinic management platform. The strongest source-backed angle is backend/platform engineering: role-based authorization, service-layer permission checks, database migrations, generated API contracts, and frontend permission visibility.

Use MyPetCare when a role values:

- Backend or full-stack product engineering
- Role-based access control and multi-role workflows
- NestJS, Next.js, TypeScript, and Nx monorepos
- PostgreSQL/Drizzle schema work
- API contract generation and frontend/backend integration

Avoid claiming project leadership or ownership of every product module unless later confirmed. The source evidence is strongest around RBAC/CASL, role migration, clinic/service workflows, and targeted frontend/backend fixes.

## What I Did

- Implemented CASL-based RBAC across backend and frontend permission surfaces.
- Built service-layer authorization around platform roles, clinic membership checks, and platform-admin bypass behavior.
- Migrated role architecture for admin, clinic owner, pet owner, vet, and staff access.
- Wired frontend ability context, `Can` components, hooks, and sidebar visibility to shared permissions.
- Applied permission checks across clinic and veterinary workflow modules.
- Built service management backend foundations for clinic-scoped service catalogs and billing-ready price snapshots.
- Fixed workflow issues across encounter autosave, inventory pagination, quantity controls, SMS history mapping, payroll visibility, and frontend RBAC.
- Updated OpenAPI/generated API client artifacts alongside backend contract changes.

## Impact Framing

- Made clinic access rules more consistent by centralizing permission checks around platform roles and clinic membership.
- Improved maintainability by moving RBAC logic into shared backend/frontend CASL foundations.
- Helped protect operational workflows for clinics, pets, medical records, services, billing, payroll, and reporting pages.
- Reduced product workflow friction through targeted fixes in encounters, inventory, SMS history, and role-based navigation.

No numeric impact was confirmed from source. Do not invent metrics.

## Tech To Mention

Primary:

- TypeScript
- NestJS
- Next.js
- React
- Nx
- CASL
- PostgreSQL
- Drizzle ORM

Strong supporting:

- Firebase Auth/Admin
- Swagger/OpenAPI
- TanStack React Query
- TailwindCSS
- Google Cloud Platform
- Google Cloud Storage
- JWT / Passport

Use selectively:

- PDFKit
- Remotion
- Cypress
- Jest
- React PDF

## Strongest Bullet Options

- Implemented CASL-based RBAC across a NestJS backend and Next.js admin UI for platform admins, clinic owners, vets, staff, and pet owners.
- Migrated role and clinic-membership authorization flows with PostgreSQL/Drizzle schema changes, service-layer checks, and generated API client updates.
- Centralized clinic permission checks around platform roles, membership validation, and platform-admin bypass behavior.
- Built service management foundations for clinic-scoped service catalogs, categories, active states, soft deletion, pagination, and price snapshots.
- Fixed workflow issues across encounter autosave, inventory pagination, quantity controls, SMS history mapping, payroll visibility, and frontend RBAC.

## Short Resume Version

MyPetCare - Software Engineer, Jan 2026

- Implemented CASL-based RBAC across a NestJS backend and Next.js admin UI for platform admins, clinic owners, vets, staff, and pet owners.
- Migrated role and clinic-membership authorization flows with PostgreSQL/Drizzle schema changes, service-layer checks, and generated API client updates.
- Fixed workflow issues across encounter autosave, inventory pagination, SMS history mapping, payroll visibility, and frontend permissions.

## Experience Version

Symph - Software Engineer

MyPetCare, Jan 2026

- Implemented CASL-based RBAC across a NestJS backend and Next.js admin UI for platform admins, clinic owners, vets, staff, and pet owners.
- Centralized clinic permission checks around platform roles, membership validation, and platform-admin bypass behavior.
- Built service management foundations and fixed workflow issues across encounters, inventory, SMS history, payroll visibility, and frontend RBAC.

## Project Version

MyPetCare

- Veterinary clinic management platform where Med built RBAC, backend service checks, and frontend permission visibility across clinic and pet-owner workflows.
- Worked across NestJS, Next.js, TypeScript, Nx, CASL, PostgreSQL, Drizzle, Firebase Auth, OpenAPI, and generated API client updates.

## Final Resume Entry Draft

MyPetCare | Software Engineer | Jan 2026

Context: Symph client/product work

- Implemented CASL-based RBAC across a NestJS backend and Next.js admin UI for platform admins, clinic owners, vets, staff, and pet owners.
- Migrated role and clinic-membership authorization flows with PostgreSQL/Drizzle schema changes, service-layer checks, and generated API client updates.
- Built service management foundations and fixed workflow issues across encounters, inventory, SMS history, payroll visibility, and frontend RBAC.

## Confidence Notes

- Dates are commit-confirmed: Jan 13, 2026 through Jan 30, 2026.
- Contribution size is source-backed: 50 matching commits, 34 non-merge commits.
- Ownership language should stay scoped: "implemented", "migrated", "built", and "fixed" are safer than "led" unless the user confirms broader ownership.
- MyPetCare is not under an `ai-augmented` reference folder in the local source tree. The repository contains assistant/tooling documentation, so public wording should focus on shipped product work unless AI-assisted development needs to be disclosed later.

## Questions For Later

- Should this be shown publicly as `MyPetCare`, or folded under a broader `Symph` work entry?
- What public title should be used: Backend Engineer, Full-stack Engineer, or Software Engineer?
- Can we mention MyPetCare by name in public resumes?
- Were there measurable outcomes such as protected modules, users/roles supported, release scope, or defects resolved?
