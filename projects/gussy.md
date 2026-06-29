# Gussy

## Resume Record

Status: source-reviewed draft  
Project name: Gussy  
Related systems: GussyApp / collage builder, admin portal, public Gussy website and shop  
Source privacy: private/local reference only; do not publish source links or private repository metadata  
Resume category: Experience or Projects  
Dates: TBD  
Role: TBD

## One-Line Summary

Built and maintained product, design-collaboration, admin, commerce, and payment workflows for Gussy, combining a Firebase-backed collage builder with a React public website and shop.

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

- Implemented a Konva-based drag-and-drop collage canvas for placing, resizing, mirroring, cropping, labeling, copying, pasting, undoing, redoing, and saving furniture/product items.
- Persisted collage state as serialized canvas JSON and stored generated thumbnails in Firebase Storage for project/version previews.
- Supported project lifecycle workflows across designer, project manager, admin, and client roles, including review handoff, client delivery, status updates, and access locking.
- Generated client-facing project PDFs with cover/back pages, floor plans, 2D schematic images, 3D renders, and furniture tear sheets.
- Built commerce workflows around furniture/product filtering, search tags, merchant/category filters, carts, checkout, vouchers, receipts, purchase orders, and payment callbacks.
- Connected the public Gussy website to Contentful/Firebase data for landing pages, projects, reviews, shop inventory, style quiz, checkout, and payment redirect states.
- Added deployment support for Firebase Hosting and Cloud Functions through Google Cloud Build configuration.

## Draft Resume Bullets

- Built a Firebase-backed interior design platform spanning designer tools, admin workflows, client review, shopping, checkout, and payment processing.
- Implemented a Konva-based collage builder that let designers compose 2D schematic rooms with drag-and-drop products, object transforms, labels, version history, thumbnails, and PDF export.
- Automated project delivery workflows by persisting canvas state, generating project PDFs and furniture tear sheets, sending review emails, and updating role-based project statuses.
- Integrated React/Firebase shop and checkout flows with product search/filtering, merchant inventory, vouchers, receipts, purchase orders, and PayMaya, PayMongo, and Dragonpay payment paths.
- Maintained connected marketing and commerce surfaces for Gussy, including public website routes, Contentful-backed content, style quiz, shop, cart, checkout, and payment result pages.

## Evidence Pointers

- `gussy-collage/README.md`: project relationship, stack, deployment notes, Firebase/Cloud Build setup.
- `gussy-collage/package.json`: Firebase Hosting build scripts and environment targets.
- `gussy-collage/functions/package.json`: Cloud Functions dependencies, lint/test scripts, Node 20 runtime.
- `gussy-collage/firebase.json`: Firebase Hosting, Realtime Database, Storage, Firestore, Functions configuration.
- `gussy-collage/public/js/index.js`: Konva canvas setup, drag/drop, keyboard shortcuts, versioning, thumbnail upload, project status transitions.
- `gussy-collage/public/js/common/generateProjectPDF.js`: PDF export flow for project pages, images, and tear sheets.
- `gussy-collage/functions/index.js`: callable and HTTP functions for review emails and payment callbacks.
- `gussy-collage/functions/orders.js`: order reference generation, receipt PDFs, purchase orders, and merchant emails.
- `gussy-website/package.json`: React/Firebase/Contentful/shop dependencies.
- `gussy-website/src/routes.js`: public website, shop, cart, checkout, style quiz, and payment result routes.
- `gussy-website/src/queries/shop.js`: product filtering, search, merchant/category lookup, featured products, and shop data access.
- `gussy-website/src/queries/payments.js`: PayMaya, PayMongo, and Dragonpay checkout handoff.

## Open Questions

- Confirm exact dates, title, employer/client context, and whether this belongs under Experience or Projects.
- Confirm which bullets reflect work personally owned versus inherited or maintained.
- Add measurable impact if available: users, projects processed, checkout volume, designer time saved, PDF/export usage, deployment frequency, or support reduction.
