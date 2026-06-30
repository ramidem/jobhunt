# MLhuillier KP Platform

## Resume Record

Status: source-reviewed draft
Project name: MLhuillier KP Platform
Public name: Financial Services Operations Platform
Private name: MLhuillier KP Platform
NDA status: anonymize in public resume unless naming is explicitly approved
Related systems: `mlkpsymph`, branch operations, KYC, money transfer, reports, ShopSafe, vault/fund requests
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: Work / Symph client project
Dates: Jan 2021 - Nov 2025
Role: Software Engineer / contributing engineer

## One-Line Summary

Maintained and extended MLhuillier's branch-operations platform across KYC, money transfer, reporting, ShopSafe, vault, and receipt workflows.

## Product Scope

The KP platform is a branch-operations system for MLhuillier workflows such as customer KYC, sendout and payout, watchlist checks, reports, branch and vault operations, bills/payment flows, ShopSafe support, and operational receipts.

This record covers the `mlkpsymph` application layer: a TypeScript/Node backend, React frontend, MySQL stored procedure integration, GCP deployment context, and operational reporting/export features.

## Technical Scope

- Frontend: React, TypeScript, Redux, React Hook Form, React Query, Reactstrap, styled-components
- Backend: TypeScript, Express/Node.js services, MySQL, stored procedure integration, service-layer transaction logic
- Auth/access: CASL permissions, branch/user roles, transaction permissions
- Reporting/export: PDF, CSV/XLSX, receipt rendering, transaction reports
- Cloud/platform: Google Cloud, Cloud Storage, Secret Manager, Artifact Registry, Sentry, PM2

## Notable Work Areas

- Built and maintained KYC workflows, including customer edit flows, KYC image history, KYC active status, watchlist tags, CTR/PEP prompts, and ID/photo handling.
- Implemented and fixed money transfer flows for sendout, payout, cancellation, return-to-sender, request-for-change, dormancy, receipts, duplicate checks, and watchlist integration.
- Added and refined domestic transaction reports, BIR/sendout reports, cash count reports, PDF exports, and branch-scoped report filters.
- Built and maintained ShopSafe operational screens for transaction search, maintenance, status updates, receipt printing, adjustments, tracking, and branch detail loading.
- Implemented vault/fund-request workflows including bank receipt upload, disbursing branch flows, fund return methods, bank/vault balance views, expired requests, and approval screens.
- Added branch/user/admin workflows such as disbursement type management, cash-in/company wallet flows, branch user handling, and role/permission updates.

## Draft Resume Bullets

- Maintained MLhuillier branch-operation workflows across KYC, money transfer, reports, ShopSafe, vault, and receipt handling.
- Built React and TypeScript service changes for KYC updates, sendout/payout flows, watchlist checks, branch reports, and fund-request approvals.
- Improved operational reliability through receipt upload handling, transaction logging, stored-procedure integration, and branch-scoped report filters.

## Evidence Pointers

- `mlkpsymph/README.md` - project setup, GCP, MySQL, build/test, deployment, and health checklist context.
- `mlkpsymph/package.json`, `mlkpsymph/code/package.json`, `mlkpsymph/frontend/package.json` - TypeScript, React, Express/Node, MySQL, GCP, CASL, Sentry, PDF/export, and test tooling.
- `mlkpsymph/code/src/services/money_transfer/MoneyTransferService.ts` - money transfer orchestration, stored procedure calls, watchlist integration, transaction statuses, charges, and receipts.
- `mlkpsymph/frontend/src/apps/kyc/CustomerKYC.tsx` - KYC edit/search/photo/watchlist/CTR flow.
- `mlkpsymph/code/src/services/report/ReportMlKpDomesticService.ts` and `mlkpsymph/code/src/controllers/v1/ReportsMlKpDomesticController.ts` - domestic report generation surfaces.
- `mlkpsymph/frontend/src/apps/wallet-services/components/ShopSafe/*` and `mlkpsymph/code/src/services/ml_shopsafe/*` - ShopSafe operational screens and services.
- `mlkpsymph/frontend/src/apps/vault-system/*` and `mlkpsymph/code/src/services/fund_request/*` - vault and fund-request workflows.
- Git evidence: 3,472 matching commits, 2,402 non-merge commits, dated Jan 21, 2021 through Nov 17, 2025.

## Open Questions

- Confirm public-safe naming: MLhuillier KP Platform, ML KP, or MLhuillier branch operations platform.
- Confirm public title and whether this should be listed as a long-running Symph work entry or as separate project bullets.
- Confirm measurable outcomes, such as report usage, branch coverage, transaction volume, or operational defects reduced.
- Confirm whether any modules should be excluded from public resumes for confidentiality.
