# Tech Stack Index

## Purpose

Track technologies seen across project records so resume review can focus on the tools that repeat most often.

Counting rule: count a technology once per product/project, even if it appears in multiple related repos for the same product. Supporting tools can be listed even when they are not final resume keywords.

## Summary

| Technology | Project Count | Projects | Resume Priority | Notes |
| --- | ---: | --- | --- | --- |
| React | 2 | Gussy, Coaxis CMS | High | Repeated across public/shop UI and Strapi admin plugin work. |
| SendGrid | 2 | Gussy, Coaxis CMS | Medium | Email/template integration appears in both projects; mention when relevant to backend integrations. |
| Google Cloud Build | 2 | Gussy, Coaxis CMS | Medium | Deployment automation appears in both projects; Coaxis ownership is stronger from source evidence. |
| Firebase | 1 | Gussy | High | Umbrella platform across Hosting, Realtime Database, Firestore, Storage, Auth, and Cloud Functions. |
| JavaScript | 1 | Gussy | High | Primary language across GussyApp and Gussy website. |
| TypeScript | 1 | Coaxis CMS | High | Primary language for Strapi config, APIs, plugins, and admin extensions. |
| Strapi | 1 | Coaxis CMS | High | Resume-defining CMS and admin-platform framework. |
| Node.js | 1 | Coaxis CMS | High | Runtime for Strapi CMS, plugins, scripts, and deployment. |
| Google Cloud Platform | 1 | Coaxis CMS | High | App Engine, Cloud Build, Cloud Storage, Secret Manager, database configuration, and Artifact Registry. |
| Firebase Hosting | 1 | Gussy | Medium | Hosted the GussyApp/collage surface. |
| Firebase Cloud Functions | 1 | Gussy | Medium | Present in the platform; use direct-ownership wording only if confirmed. |
| Firebase Realtime Database | 1 | Gussy | Medium | Project, commerce, and app data paths. |
| Firestore | 1 | Gussy | Medium | Product/shop data. |
| Firebase Storage | 1 | Gussy | Medium | Project/version thumbnails, files, and image assets. |
| Firebase Auth | 1 | Gussy | Medium | Role-based app access. |
| Konva | 1 | Gussy | Medium | Canvas/collage builder. |
| Contentful | 1 | Gussy | Medium | Public site content integration. |
| Strapi Design System | 1 | Coaxis CMS | Medium | Used for custom Strapi admin tables, dialogs, filters, and actions. |
| Custom Strapi plugins | 1 | Coaxis CMS | Medium | Opportunity review and AI/II verification plugins. |
| Google App Engine | 1 | Coaxis CMS | Medium | CMS deployment target. |
| Google Cloud Storage | 1 | Coaxis CMS | Medium | Strapi upload provider. |
| Cloud SQL-compatible database config | 1 | Coaxis CMS | Medium | Production-oriented database configuration; avoid naming a specific managed DB unless confirmed. |
| Google Artifact Registry | 1 | Coaxis CMS | Medium | Private package/auth workflow for installs and builds. |
| Secret Manager | 1 | Coaxis CMS | Medium | Managed deployment secrets in build pipeline. |
| JWT | 1 | Coaxis CMS | Medium | Reviewer token generation for opportunity review links. |
| Axios | 1 | Coaxis CMS | Medium | Service/client integration with Coaxis APIs. |
| MySQL | 1 | Coaxis CMS | Low | Supported database mode; mention only for database/platform roles. |
| PostgreSQL | 1 | Coaxis CMS | Low | Supported database mode; mention only for database/platform roles. |
| SQLite | 1 | Coaxis CMS | Low | Local development database. |
| Azure AD OAuth / SSO | 1 | Coaxis CMS | Low | Auth/SSO dependency present; ownership needs confirmation. |
| Strapi seed scripts | 1 | Coaxis CMS | Low | Development/content setup support. |
| HTML | 1 | Gussy | Low | Supporting frontend stack. |
| CSS | 1 | Gussy | Low | Supporting frontend stack. |
| Bootstrap | 1 | Gussy | Low | Supporting UI framework. |
| jQuery | 1 | Gussy | Low | Supporting app/runtime library. |
| React Router | 1 | Gussy | Low | Public website routing. |
| React Query | 1 | Gussy | Low | Public website data fetching. |
| PayMaya | 1 | Gussy | Low | Payment integration present; direct ownership needs confirmation. |
| PayMongo | 1 | Gussy | Low | Payment integration present; direct ownership needs confirmation. |
| Dragonpay | 1 | Gussy | Low | Payment integration present; direct ownership needs confirmation. |
| Netlify | 1 | Gussy | Low | Deployment/supporting hosting workflow. |
| jsPDF | 1 | Gussy | Low | PDF/project export support. |
| html-pdf | 1 | Gussy | Low | Receipt/purchase order PDF support. |

## By Project

### Gussy

Primary resume technologies:

- JavaScript
- React
- Firebase
- Konva

Supporting technologies:

- HTML
- CSS
- Bootstrap
- jQuery
- React Router
- React Query
- Firebase Hosting
- Firebase Realtime Database
- Firestore
- Firebase Storage
- Firebase Auth
- Firebase Cloud Functions
- Contentful
- SendGrid
- PayMaya
- PayMongo
- Dragonpay
- Netlify
- Google Cloud Build
- jsPDF
- html-pdf

Notes:

- Gussy should emphasize Firebase, React, JavaScript, and Konva first.
- Mention payment providers and Cloud Build only when describing the broader platform, unless direct ownership is later confirmed.

### Coaxis CMS

Primary resume technologies:

- TypeScript
- Strapi
- React
- Node.js
- Google Cloud Platform

Supporting technologies:

- Strapi Design System
- Custom Strapi plugins
- Google Cloud Build
- Google App Engine
- Google Cloud Storage
- Cloud SQL-compatible database config
- Google Artifact Registry
- Secret Manager
- JWT
- Axios
- SendGrid
- MySQL
- PostgreSQL
- SQLite
- Azure AD OAuth / SSO
- Strapi seed scripts

Notes:

- Coaxis CMS should emphasize Strapi, TypeScript, custom admin plugins, Coaxis API integration, and GCP deployment support.
- Mention AI/II verification as a product-domain workflow, not as an AI-assisted development claim.
- Mention specific database engines only for backend/platform roles; the stronger public claim is database configuration support.

## Maintenance Rules

- Update this file whenever a new `projects/<slug>.md` or `projects/<slug>-resume.md` is added or materially changed.
- Count technologies per product/project, not per repo.
- Keep `Resume Priority` practical: `High` for repeated or resume-defining tools, `Medium` for useful differentiators, `Low` for supporting tools or unconfirmed ownership.
- Do not add secrets, private URLs, account identifiers, or customer data.
