# MLhuillier Shop

## Resume Record

Status: source-reviewed draft
Project name: MLhuillier Shop
Public name: Financial Services Ecommerce Platform
Private name: MLhuillier Shop
NDA status: anonymize in public resume unless naming is explicitly approved
Related systems: `ml-shop`, ML Shop Mall, checkout, product catalog, cart, OTP, MCash, PayMongo, branch pickup
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: Work / Symph client project
Dates: May 2025 - Aug 2025
Role: Software Engineer / contributing engineer

## One-Line Summary

Built MLhuillier Shop checkout, catalog, cart, pickup, payment, and OTP flows across a Next.js/NestJS commerce app.

## Product Scope

MLhuillier Shop is a commerce application for browsing products, managing cart and checkout, selecting pickup branches, computing order totals, and completing payment through MCash or PayMongo. The app integrates with ML Shop Mall stored procedures, KPX/CKYC data, auth services, branches, products, and order release workflows.

## Technical Scope

- Nx monorepo with Next.js web app and NestJS backend
- TypeScript, React, React Hook Form, Zod, TanStack React Query, TailwindCSS
- NestJS API modules for products, branches, customer, auth, OTP attempts, compute order, place order, and ML Shop Mall stored procedure access
- Payment flows for MCash and PayMongo, OTP verification and attempt blocking, Google reCAPTCHA, analytics/mixpanel context
- OpenAPI-generated TypeScript API library

## Notable Work Areas

- Built product browsing, filtering, product details, image handling, cart state, and checkout item display.
- Implemented checkout form behavior for logged-in users, existing customers, non-KYC flows, branch pickup, order summary, and computed totals.
- Integrated MCash and PayMongo payment flows, including alternate payment mobile numbers, checkout URLs, payment prompts, and successful purchase states.
- Added OTP attempt tracking and blocking across backend stored procedure access, frontend auth context, payment OTP components, resend behavior, and validation failures.
- Built branch/pickup APIs and frontend selectors for province/city/branch loading.
- Added product and order backend services around stored procedure access, DTO validation, OpenAPI client generation, and API library updates.
- Fixed order release connection and configurable OTP blocking duration.

## Draft Resume Bullets

- Built MLhuillier Shop checkout, cart, product, pickup, and payment flows across a Next.js/NestJS commerce app.
- Integrated MCash and PayMongo checkout with OTP verification, attempt blocking, alternate payment numbers, and order success handling.
- Added product, branch, compute-order, and place-order backend integrations backed by stored procedures and generated TypeScript API clients.

## Evidence Pointers

- `ml-shop/README.md` - Next.js/NestJS/Nx/GCP/Firebase/App Engine/Cloud SQL project context and ML Shop Mall stored procedure module.
- `ml-shop/package.json` - Next.js, NestJS, TypeScript, Firebase, CASL, GCP, OpenAPI, React Query, Zod, TailwindCSS, MySQL, SendGrid, Mixpanel, Sentry, and test tooling.
- `ml-shop/apps/web/src/components/shop/checkout/checkout-page.tsx` - checkout form, cart checkout items, computed totals, payment method prompts, existing user handling, reCAPTCHA, analytics, and order submission.
- `ml-shop/apps/backend/src/app/common/otp-attempt/otp-attempt.service.ts` - OTP attempt read/update/increment/reset/blocking behavior.
- `ml-shop/apps/web/src/components/auth/payment-otp.tsx` and `otp-verification.tsx` - OTP verification UI work.
- `ml-shop/apps/backend/src/app/products/*`, `branches/*`, `place-order/*`, `customer/*`, and `ml-shop-mall/*` - product, branch, compute order, place order, customer, and stored procedure integration.
- Git evidence: 553 matching commits, 390 non-merge commits, dated May 6, 2025 through Aug 13, 2025.

## Open Questions

- Confirm public-safe naming: MLhuillier Shop, ML Shop, or ML Shop Mall.
- Confirm whether MCash and PayMongo can be named publicly.
- Confirm measurable outcomes, such as checkout launch scope, conversion, payment success, or OTP-abuse reduction.
