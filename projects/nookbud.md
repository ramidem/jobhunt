# Nookbud

## Resume Record

Status: source-reviewed draft
Project name: Nookbud
Related systems: product-nookbud
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: AI-augmented personal product; mobile/local-first product; founder-led work
Dates: Apr 2026 - Jun 2026
Role: Founder / AI-Augmented Product Engineer

## One-Line Summary

Led an AI-augmented personal product for co-parenting and family coordination, with local-first records, audit trails, spaces, entries, acknowledgments, disputes, resources, tasks, exports, and multi-surface product/design artifacts.

## Product Scope

Nookbud is a co-parenting and family coordination product. The reviewed source includes product discovery, market research, brand/design assets, responsive screen designs, React Native mobile work, landing/admin/design-system surfaces, database migrations, spaces, members, children, entries, entry versions, acknowledgments, disputes, audit logs, resources, tasks, notifications, sync, and export services.

## Technical Scope

- Nx workspace with React Native mobile app, Next.js landing/admin/design surfaces, and NestJS backend scaffolding.
- React Native navigation, local state, MMKV, React Query, Jotai/Zustand, React Hook Form, and Zod.
- Local-first mobile data model using Drizzle/SQLite migrations for users, spaces, children, entries, versions, acknowledgments, disputes, audit logs, resources, and tasks.
- Firebase/Firebase Admin context for web/backend surfaces and future sync flows.
- Product/design workflow artifacts including discovery docs, PRD, market research, user stories, screen manifests, design tokens, generated screen galleries, and brand assets.
- Mobile deployment tooling through iOS/Android scripts and Fastlane setup.

## Notable Work Areas

- Led AI-augmented product discovery, positioning, design system, and implementation planning.
- Built local-first data foundations for legally sensitive family records, including append-only audit logs and versioned entries.
- Implemented service boundaries for users, spaces, members, children, entries, resources, tasks, acknowledgments, disputes, sync, export, and timeline.
- Created design tokens, screen galleries, mobile/web screen variants, brand assets, and landing/product documentation.
- Maintained a multi-app product workspace spanning mobile, web, landing, admin, design system, and backend scaffolding.

## Draft Resume Bullets

- Led AI-augmented product discovery, design system, and implementation for a co-parenting app with entries, resources, tasks, acknowledgments, disputes, and exports.
- Built local-first mobile data foundations with Drizzle/SQLite migrations, immutable audit logs, versioned entries, attachments, spaces, members, and child records.
- Maintained an Nx workspace spanning React Native mobile, Next.js landing/admin/design surfaces, NestJS backend scaffolding, and product/design artifacts.

## Evidence Pointers

- `product-nookbud/package.json`: Nx workspace, React Native, Next.js, NestJS, Firebase, React Query, MMKV, Jotai/Zustand, React Hook Form, Zod, Jest, and mobile deployment scripts.
- `product-nookbud/prd.json`: local-first schema, Drizzle/SQLite, relationships/spaces, children, entries, entry versions, acknowledgments, disputes, audit logs, resources, tasks, sync, and export requirements.
- `product-nookbud/apps/mobile/drizzle`: SQLite migration files for local mobile data.
- `product-nookbud/apps/mobile/src/services`: service boundaries for user, relationship/space, child, entry, audit, acknowledgment, dispute, resource, task, timeline, sync, export, file, and notification flows.
- `product-nookbud/design` and `product-nookbud/discovery`: design workflow, brand, market research, screen manifest, screen galleries, visual language, and product documentation.
- Git date evidence: commits run Apr 27, 2026 through Jun 13, 2026.

## Open Questions

- Should Nookbud appear publicly as a product project now, or stay as a private/founder product record until launched?
- How should legally sensitive positioning be phrased for general backend/full-stack resumes?
- Were any builds released to TestFlight, App Store review, or private beta?
