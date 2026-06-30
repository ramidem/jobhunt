# MLhuillier Services

## Resume Record

Status: source-reviewed draft
Project name: MLhuillier Services
Related systems: `ml-services`, ML ShopSafe, CKYC, watchlist, reports, payroll, wallet/payment services
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: Work / Symph client project
Dates: Feb 2022 - Nov 2025
Role: Software Engineer / contributing engineer

## One-Line Summary

Built and maintained NestJS/Nx microservices for ShopSafe, CKYC/watchlist, reports, payroll, and shared MLhuillier service integrations.

## Product Scope

MLhuillier Services is a microservice monorepo supporting multiple product areas: CKYC, auth, reports, ShopSafe, wallet/payment gateway, payroll, rewards, points, partner transfers, risk rating, top-up, notification, app launcher, and shared libraries.

The source-backed work tied to Med is concentrated in ShopSafe transaction/listing flows, CKYC/customer/watchlist services, reporting services, payroll company endpoints, shared storage/API libraries, and service test coverage.

## Technical Scope

- Nx monorepo with multiple NestJS apps and shared TypeScript libraries
- MySQL-backed stored procedure integration and shared database services
- Google Cloud services: Storage, Pub/Sub, Secret Manager, logging/profiling, Cloud Build context
- Service integrations across ShopSafe, CKYC, KPX, points, rewards, wallet payment gateway, reports, and payroll
- PDF/CSV report generation, charts, streaming report output, and Jest tests

## Notable Work Areas

- Built ShopSafe transaction services with status handling, payment/disbursement updates, item acceptance, shipping rates, vouchers, points/rewards, image signing, GCS storage, and watchlist checks.
- Added ShopSafe listing and transaction DTOs, API client wrappers, controller routes, helpers, mocks, and service tests.
- Worked on CKYC customer, customer history, tier, alias, and watchlist services with DTOs, helpers, guards, and tests.
- Implemented report services for fund transfer movement per bank, bank/vault balances, domestic transaction reports, and PDF/CSV/chart output.
- Added payroll company service/controller work and shared DTOs.
- Maintained shared libraries for errors, constants, storage, domestic APIs, accounting utilities, and generated/OpenAPI service code.

## Draft Resume Bullets

- Built NestJS/Nx microservice work across ShopSafe transactions, CKYC/watchlist, reports, payroll, and shared MLhuillier libraries.
- Implemented ShopSafe transaction and listing services with payment, disbursement, voucher, points/rewards, GCS image, and watchlist integrations.
- Delivered reporting services for bank/vault balances and fund-transfer movement with streamed MySQL data, PDF/CSV output, charts, and tests.

## Evidence Pointers

- `ml-services/README.md` - Nx service monorepo setup, GCP, MySQL, Secret Manager, testing, linting, build, deployment, and service generation context.
- `ml-services/package.json` - NestJS, Nx, React Native, GCP, MySQL, Pub/Sub, Secret Manager, Storage, SendGrid, Firebase, Sentry, PDF/CSV/export, and testing dependencies.
- `ml-services/apps/ml-shopsafe/src/app/transaction/v1/transaction.v1.service.ts` - ShopSafe transaction orchestration across CKYC, KPX, rewards, points, payment gateway, storage, and MySQL procedures.
- `ml-services/apps/ml-shopsafe/src/app/listing/v1/listing.v1.service.ts` - ShopSafe listing workflows.
- `ml-services/apps/api/src/app/customer/customer.service.ts`, `watchlist/watchlist.service.ts`, `customerHistory/*`, and `tier/*` - CKYC/customer/watchlist/tier work.
- `ml-services/apps/ml-reports/src/app/vault/services/fundTransferMovementPerBankReport.service.ts` - streamed report data, PDF layout, charts, and report output.
- `ml-services/apps/ml-payroll/src/app/company/v1/company.v1.service.ts` - payroll company workflow.
- Git evidence: 900 matching commits, 592 non-merge commits, dated Feb 9, 2022 through Nov 17, 2025.

## Open Questions

- Confirm whether this should be listed publicly as MLhuillier Services, ML Services, or MLhuillier microservices.
- Confirm strongest target angle: backend microservices, ShopSafe, CKYC/watchlist, reports, or platform integration.
- Confirm measurable outcomes, such as reports shipped, transaction workflows supported, or test coverage added.
