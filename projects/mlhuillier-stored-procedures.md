# MLhuillier Stored Procedures

## Resume Record

Status: source-reviewed draft
Project name: MLhuillier Stored Procedures
Public name: Financial Services Stored Procedure Layer
Private name: MLhuillier Stored Procedures
NDA status: anonymize in public resume unless naming is explicitly approved
Related systems: `mlkp-symph-sp`, KPX, CKYC, ShopSafe, ML Shop, vault/fund requests, domestic reports
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: Work / Symph client project
Dates: Apr 2021 - Nov 2025
Role: Software Engineer / contributing engineer

## One-Line Summary

Maintained MySQL stored procedures that backed MLhuillier transaction workflows, reporting, ShopSafe, CKYC, vault, and ML Shop features.

## Product Scope

The stored-procedure repository centralizes database-side changes for MLhuillier products. It includes procedures and table scripts across KPX, CKYC, ShopSafe, ML Shop, ML Money, points, rewards, risk rating, utility, wallet, vault, reports, and related operational databases.

## Technical Scope

- MySQL stored procedures, SQL scripts, and schema-update scripts
- Transaction and report procedure work for money transfer, watchlist, CKYC, ShopSafe, vault, OTP, and ML Shop
- Database-backed contracts consumed by MLhuillier service and application layers
- Report queries grouped by branch, area, region, zone, bank, transaction type, and status

## Notable Work Areas

- Added and refined money-transfer reports for payout, received/unclaimed, sendout, return, cancellation, request-for-change, BIR, branch, area, region, and zone variants.
- Built and maintained watchlist and CKYC stored procedures for searches, aliases, tags, logs, customer updates, and KYC tier data.
- Added ShopSafe stored procedures for maintenance, transactions, adjustments, shipping rates, item listings, item photos, and transaction V2 work.
- Added ML Shop procedures for product filtering, product categories, OTP attempts, and purchase/order totals.
- Built vault/fund-request procedures for fund-transfer movement per bank, bank/vault balances, disbursing branch handling, fund request status updates, and bank receipt URL support.
- Maintained script files across service-specific databases for deployment and review.

## Draft Resume Bullets

- Maintained MySQL stored procedures behind MLhuillier money transfer, CKYC/watchlist, ShopSafe, ML Shop, vault, and reporting workflows.
- Built report procedures for domestic transactions, bank/vault balances, fund-transfer movement per bank, and branch/area/region/zone rollups.
- Added database support for ShopSafe item listings/transactions, OTP attempts, KYC/watchlist logs, and fund-request receipt handling.

## Evidence Pointers

- `mlkp-symph-sp/README.md` - repository purpose and stored procedure review structure.
- `mlkp-symph-sp/kpxStoredProcs/moneyTransfer/*` - domestic transaction reports, sendout/payout, cancellation, request-for-change, and reporting procedures.
- `mlkp-symph-sp/kpxStoredProcs/fundRequest/fundRequest_fundTransferMovementPerBank.sql` - bank-filtered fund-transfer movement report procedure.
- `mlkp-symph-sp/ml-shop/otp_attempts_get.sql` and `mlkp-symph-sp/ml-shop/otp_attempts_update.sql` - OTP attempt tracking procedures.
- `mlkp-symph-sp/ml-shop/ml-shop-mall/*` - ML Shop product filter/query procedures.
- `mlkp-symph-sp/ml-shopsafe/*` - ShopSafe maintenance, item listing, photo, shipping, transaction, and adjustment procedures.
- `mlkp-symph-sp/mlckyc/*` and `mlkp-symph-sp/kpxStoredProcs/watchlistTransaction/*` - CKYC/watchlist search, alias, log, and status procedures.
- Git evidence: 549 matching commits, 401 non-merge commits, dated Apr 1, 2021 through Nov 14, 2025.

## Open Questions

- Confirm whether this should be public as a separate project or only support tailored backend/database resumes.
- Confirm whether to use the phrase "stored procedures" publicly or generalize to "database-backed workflows."
- Add measurable impact if available, such as report runtime, data volume, or number of branches/reports supported.
