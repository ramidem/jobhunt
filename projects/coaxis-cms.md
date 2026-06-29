# Coaxis CMS

## Resume Record

Status: source-reviewed draft
Project name: Coaxis CMS
Related systems: Coaxis web/API, Strapi CMS, opportunity review plugin, AI/II verification plugin
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: Work / Symph client project
Dates: Jan 2025 - May 2025
Role: Project Lead / Software Engineer

## One-Line Summary

Led development of a Strapi 5 CMS with custom admin plugins for Coaxis content, opportunity review, verification, and deployment workflows.

## Product Scope

Coaxis CMS is the content and operations backend for a public Coaxis experience. It manages marketing/content pages, marketplace content, events, partners, press releases, news, teams, SEO, sitemap content, request-introduction flows, opportunity settings, email addresses, and related structured content.

The CMS also includes custom Strapi admin plugins for:

- reviewing and managing opportunity submissions
- generating review and preview flows for opportunities
- managing collaborators for opportunities
- approving or rejecting AI/II verification records
- connecting CMS operators to Coaxis platform APIs

## Technical Scope

- Strapi 5 CMS with TypeScript configuration
- React-based Strapi admin extensions and custom plugins
- Strapi Design System tables, dialogs, pagination, filters, and admin actions
- Coaxis API integration through service wrappers and typed admin hooks
- JWT-based review token generation for external review links
- Google Cloud deployment workflow using App Engine, Cloud Build, Cloud Storage, Cloud SQL-compatible database configuration, Artifact Registry auth, and Secret Manager
- SendGrid template lookup endpoint
- Seed scripts for local and development content setup

## Notable Work Areas

- Led CMS architecture and implementation across Strapi content models, admin plugins, integrations, and deployment support.
- Modeled a broad Strapi content system covering single types and collection types for public content, marketplace pages, events, partners, media, profile, footer/header, request introduction, and SEO.
- Built and iterated on the opportunity admin plugin, including table views, status filtering, keyword search, pagination, sorting, loading/empty states, and query-string state.
- Added opportunity review actions for publish/verify, withdraw, draft, deactivate, delete, reject, view, preview, and refetch flows.
- Implemented server-side Coaxis API wrappers for opportunity listing, status changes, preview token lookup, settings creation, and collaborator management.
- Added reviewer token generation with Strapi admin user context, role checks, and JWT payloads for review links.
- Built collaborator management UI and hooks for viewing, adding, and removing opportunity collaborators.
- Built AI/II verification admin tooling with list, approve, reject, confirmation, loading, and error-response states.
- Configured production deployment paths for Strapi builds, environment creation, GCP deployment, managed secrets, Cloud Storage uploads, and database connection modes.
- Added support endpoints for external admin auth, SendGrid template lookup, and CMS content-label maintenance.

## Draft Resume Bullets

- Led development of a Strapi 5 CMS for Coaxis content, marketplace pages, opportunity settings, and admin workflows.
- Built custom Strapi plugins for opportunity review, collaborators, preview links, and AI/II verification.
- Integrated Coaxis APIs through TypeScript services, React admin hooks, JWT review tokens, and status endpoints.
- Supported GCP deployment with Cloud Build, App Engine, managed secrets, Cloud Storage, and database config.

## Evidence Pointers

- `package.json` - Strapi 5, TypeScript, React, Strapi plugins, Coaxis plugin packages, GCS upload provider, SendGrid/JWT/API dependencies.
- `README.md` - local setup, plugin workflow, seed workflow, and database backup/restore process.
- `config/plugins.ts` - GCS upload provider, opportunity plugin config, AI/II verification plugin config.
- `config/database.ts` - sqlite/mysql/postgres database configuration.
- `cloudbuild.yaml` and `app.yaml` - production build and App Engine deployment workflow.
- `src/api/*/content-types/*/schema.json` - Strapi content model for CMS pages and collections.
- `seed/data/**` - seed data for local/development CMS content.
- `src/plugins/opportunity/admin/src/components/ReviewOpportunitySubmissions.tsx` - opportunity review UI state, search, filters, sorting, pagination, and refresh behavior.
- `src/plugins/opportunity/admin/src/components/TableComponent.tsx` - opportunity table, action buttons, settings links, collaborator dialog entry point.
- `src/plugins/opportunity/admin/src/hooks/useOpportunities.ts` - admin hooks for opportunity listing, status actions, preview/view, and settings creation.
- `src/plugins/opportunity/server/src/controllers/opportunity-controller.ts` - CMS API endpoints for opportunity workflows.
- `src/plugins/opportunity/server/src/services/opportunity-service.ts` - Coaxis API service wrapper for opportunities, settings, preview, and collaborator operations.
- `src/plugins/opportunity/server/src/services/review-service.ts` - reviewer JWT generation from Strapi admin user context.
- `src/plugins/opportunity/admin/src/components/collaborators/**` and `src/plugins/opportunity/admin/src/hooks/use*Collaborator*.ts` - collaborator management UI and hooks.
- `src/plugins/ai-ii-verification/admin/src/components/TableComponent.tsx` - verification table and approve/reject dialogs.
- `src/plugins/ai-ii-verification/server/src/services/aiii-verification-service.ts` - Coaxis API wrapper for verification records and status actions.
- `src/api/admin-auth/controllers/admin-auth.ts` - external admin login/logout/redirect support.
- `src/api/email-template/controllers/email-template.ts` - SendGrid dynamic template lookup.
- Git evidence: 297 matching commits, 219 non-merge commits, dated Jan 17, 2025 through May 2, 2025.

## Open Questions

- Confirm public-safe title: Project Lead, Lead Software Engineer, Software Engineer, Backend Engineer, Full-stack Engineer, or CMS Engineer.
- Confirm whether Coaxis can be named publicly in all resume versions.
- Confirm whether this should be grouped under a broader Symph work entry or shown as a standalone project.
- Confirm production impact: users served, internal CMS users, launch scope, or operational improvements.
- Confirm how much team-management or technical-lead responsibility should be shown in tailored resumes.
