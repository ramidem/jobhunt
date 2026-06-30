# RoundSave

## Resume Record

Status: source-reviewed draft
Project name: RoundSave
Public name: RoundSave
Private name: RoundSave
NDA status: personal product; public name is allowed unless launch strategy changes
Related systems: roundsave, product-roundsave-monorepo
Source privacy: private/local reference only; do not publish source links or private repository metadata
Resume category: AI-augmented personal product; fintech/community savings product; founder-led work
Dates: Mar 2026 - Jun 2026
Role: Founder / AI-Augmented Product Engineer

## One-Line Summary

Led an AI-augmented personal product for rotating savings circles, with group creation, contributions, payouts, wallet accounting, disputes, trust scores, KYC, notifications, PWA support, and mobile scaffolding.

## Product Scope

RoundSave is a rotating savings circle platform. The reviewed source includes Next.js web workflows for authentication, dashboards, groups, contributions, payouts, wallet transactions, escrow ledger records, withdrawals, disputes, trust scores, KYC submissions, notifications, analytics, and operational/admin review surfaces. The related monorepo includes React Native mobile scaffolding and mobile deployment scripts.

## Technical Scope

- Next.js web app with React, TypeScript, Firebase Auth, Firestore, Firebase Storage, and Firebase Admin.
- Firestore rules for groups, contributions, payouts, trust scores, wallets, wallet transactions, escrow ledger, withdrawals, disputes, push tokens, and KYC submissions.
- Product actions for group flows, wallet flows, transaction history, withdrawals, disputes, trust-score recalculation, notifications, analytics, and profile/auth handling.
- PWA/service-worker support, push notifications, foreground notification handling, and installable app manifest.
- Nx/React Native mobile scaffolding with MMKV, React Query, React Hook Form, Zod, and iOS/Android scripts.

## Notable Work Areas

- Led AI-augmented product build for rotating savings circles and financial workflow coordination.
- Implemented Firebase-backed group, contribution, payout, wallet, withdrawal, dispute, trust score, and KYC data flows.
- Built rules and actions around group membership, organizer permissions, wallet transaction records, escrow ledger visibility, and dispute handling.
- Added PWA behavior, push notification prompts, service worker registration, foreground notification toasts, and mobile scaffolding.
- Maintained web and mobile product surfaces across Next.js, Firebase, Nx, and React Native foundations.

## Draft Resume Bullets

- Led AI-augmented build of a rotating savings circle platform with groups, contributions, payouts, wallet accounting, disputes, KYC, and trust scoring.
- Built Firebase-backed web workflows for dashboards, group creation/joining, transaction history, withdrawals, dispute escalation, push notifications, and analytics.
- Maintained React Native/mobile and Next.js web scaffolds with PWA/service worker support, Firestore rules, and operational admin surfaces.

## Evidence Pointers

- `roundsave/apps/web/package.json`: digital rotating savings circle platform using Next.js, React, Firebase, Firebase Admin, React Query, Zod, React Hook Form, and Recharts.
- `roundsave/apps/web/firestore.rules`: groups, contributions, payouts, trust scores, wallets, wallet transactions, escrow ledger, withdrawals, and dispute access rules.
- `roundsave/apps/web/src/lib/entities`: savings group, member, contribution, payout, trust-score, KYC, notification, wallet, and dispute domain types.
- `roundsave/apps/web/src/lib/actions`: group, wallet, transaction, withdrawal, trust score, dispute, notification, analytics, profile, and push notification actions.
- `roundsave/apps/web/public`: manifest and service worker assets for PWA support.
- `product-roundsave-monorepo/package.json`: Nx/React Native mobile workspace and mobile deployment scripts.
- Git date evidence: early web commits run Mar 17, 2026 through Mar 19, 2026; monorepo/product commits run Mar 24, 2026 through Jun 22, 2026.

## Open Questions

- Is RoundSave public, private beta, or still an internal/founder prototype?
- Should resume wording use "wallet accounting" instead of "wallet" to avoid implying custody of funds?
- Which payment, escrow, or compliance behaviors are real integrations versus simulated/admin-managed product flows?
