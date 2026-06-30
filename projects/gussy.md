# Gussy

## Resume Record

Status: source-reviewed draft
Project name: Gussy
Public name: Interior Design Commerce Platform
Private name: Gussy
NDA status: anonymize in public resume unless naming is explicitly approved
Related systems: GussyApp / collage builder, admin portal, public Gussy website and shop
Reference group: `gussy/` in the local `resume-reference` folder
AI augmentation: not marked in the current reference tree; source is outside `ai-augmented/`
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: Experience or Projects
Dates: Nov 2020 - Mar 2021, based on matching Git commits
Role: Contributing Software Engineer; not project lead

## One-Line Summary

Contributed to product, design-collaboration, admin, commerce, and payment workflows for Gussy, combining a Firebase-backed collage builder with a React public website and shop.

## Product Scope

Gussy is an online interior styling platform with two connected surfaces:

- GussyApp / collage builder: a Firebase-hosted web app for designers, project managers, admins, and clients to manage design projects, build 2D schematic collages, review versions, export project PDFs, and coordinate furniture selections.
- Gussy website: a React website for marketing pages, pricing, projects, style quiz, shop, cart, checkout, and payment outcomes.

## Technical Scope

- Frontend: HTML, CSS, JavaScript, Bootstrap, jQuery, Konva, React, React Router, React Query.
- Backend: Firebase Hosting, Firebase Realtime Database, Firestore, Firebase Storage, Firebase Auth, Firebase Cloud Functions.
- Integrations: Contentful, SendGrid, PayMaya, PayMongo, Dragonpay, Netlify, Google Cloud Build.
- Documents and exports: jsPDF/html-pdf PDF generation for project presentations, tear sheets, receipts, and purchase orders.

## Notable Work Areas

- Contributed fixes and enhancements to a Konva-based drag-and-drop collage canvas for furniture/product placement, transforms, review flow, comments, and local storage behavior.
- Supported project lifecycle workflows across designer, project manager, admin, and client roles, including review handoff, client delivery, status updates, and access locking.
- Improved client/project file visibility, uploaded photo viewing, questionnaire/project access behavior, and finished-project navigation.
- Improved commerce/admin workflows around order previews, delivery fees, order status actions, voucher handling, Gussy Finds, Get That Look, product/category behavior, exports, and checkout edge cases.
- Contributed to the public Gussy website and shop experience, including Get That Look behavior, responsive layouts, checkout button states, related-product randomization, and shop page fixes.
- Source also contains broader PDF, payment, receipt, purchase order, Cloud Functions, and Cloud Build systems; confirm personal ownership before claiming those as primary work.

## Draft Resume Bullets

- Contributed to a Firebase-backed interior design platform spanning designer tools, admin workflows, client review, shopping, checkout, and order management.
- Improved GussyApp collage and project workflows, including project access controls, uploaded files/photos, comments, local storage behavior, redirects, and client-facing review states.
- Fixed and refined commerce workflows across orders, delivery fees, vouchers, merchant/admin exports, Gussy Finds, Get That Look, checkout states, and product display behavior.
- Maintained React/Firebase shop surfaces for Gussy, including responsive Get That Look layouts, related-product behavior, empty-cart checkout handling, and shop page fixes.

## Evidence Pointers

- `gussy/gussy-collage/README.md`: project relationship, stack, deployment notes, Firebase/Cloud Build setup.
- `gussy/gussy-collage/package.json`: Firebase Hosting build scripts and environment targets.
- `gussy/gussy-collage/functions/package.json`: Cloud Functions dependencies, lint/test scripts, Node 20 runtime.
- `gussy/gussy-collage/firebase.json`: Firebase Hosting, Realtime Database, Storage, Firestore, Functions configuration.
- `gussy/gussy-collage/public/js/index.js`: Konva canvas setup, drag/drop, keyboard shortcuts, versioning, thumbnail upload, project status transitions.
- `gussy/gussy-collage/public/js/common/generateProjectPDF.js`: PDF export flow for project pages, images, and tear sheets.
- `gussy/gussy-collage/functions/index.js`: callable and HTTP functions for review emails and payment callbacks.
- `gussy/gussy-collage/functions/orders.js`: order reference generation, receipt PDFs, purchase orders, and merchant emails.
- `gussy/gussy-website/package.json`: React/Firebase/Contentful/shop dependencies.
- `gussy/gussy-website/src/routes.js`: public website, shop, cart, checkout, style quiz, and payment result routes.
- `gussy/gussy-website/src/queries/shop.js`: product filtering, search, merchant/category lookup, featured products, and shop data access.
- `gussy/gussy-website/src/queries/payments.js`: PayMaya, PayMongo, and Dragonpay checkout handoff.

## Commit Evidence

- `gussy/gussy-collage`: 52 matching commits, including 32 non-merge commits, from Nov 25, 2020 to Mar 26, 2021.
- `gussy/gussy-website`: 18 matching commits, including 12 non-merge commits, from Dec 8, 2020 to Jan 8, 2021.
- Author identities found in these repos: `Med Aduh <med@symph.co>` and `Med Aduh <im.ramidem@gmail.com>`.
- Shortlog confirms this was a team project with multiple larger contributors; use contributor language, not lead-owner language.

## Open Questions

- Confirm title and employer/client context.
- Confirm which broader platform areas were personally owned versus inherited or maintained.
- Add measurable impact if available: users, projects processed, checkout volume, designer time saved, PDF/export usage, deployment frequency, or support reduction.
