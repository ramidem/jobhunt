# Gussy Resume Companion

## Purpose

This file translates `projects/gussy.md` into resume-ready material. It is not the evidence log; it is the working draft for what should eventually appear in the public resume.

Source grouping: `gussy/` in the local `resume-reference` folder. Gussy is not currently marked as AI-augmented in the reference tree.

Confirmed contribution window: Nov 2020 - Mar 2021, based on matching commits in `gussy/gussy-collage` and `gussy/gussy-website`. Use contributor language because this was a team project and the user was not the project lead.

Use this file to decide:

- what to claim
- how to word the impact
- which technologies to name
- what still needs confirmation before publishing

## Best Resume Positioning

Gussy should be framed as full-stack product contribution to an interior design and commerce platform.

The strongest story is not just "fixed bugs on a website." It is:

> Contributed to connected product workflows for designers, project managers, clients, and shoppers, including a canvas-based design tool, project review lifecycle, product catalog, checkout, and order management.

This gives the project weight because it shows:

- product complexity
- multiple user roles
- frontend depth through the canvas builder
- backend depth through Firebase Functions and payment/order flows
- business relevance through commerce, receipts, and client delivery

## What I Did

Based on the source review, the likely work areas to represent are:

- Contributed fixes and enhancements to the GussyApp collage builder used by designers to compose 2D schematic room designs.
- Improved canvas/project workflows around comments, local storage compression, finished-project access, client files, uploaded photos, project questionnaire behavior, and redirect paths.
- Supported role-based workflows for designers, project managers, admins, and clients, including review handoff, client delivery, status updates, and access locking.
- Improved commerce/admin workflows around order previews, delivery fees, order status actions, voucher handling, merchant/admin exports, Gussy Finds, Get That Look, product/category behavior, and checkout edge cases.
- Maintained the Gussy public website and shop experience, including Get That Look behavior, related-product randomization, responsive layouts, empty-cart checkout handling, and shop page fixes.
- Worked in a Firebase/React/JavaScript codebase with Realtime Database, Firestore, Storage, Auth, Cloud Functions, Contentful, SendGrid, and payment integrations present in the system.

## Impact Framing

Confirmed impact from source:

- Improved collaboration between designers, PMs/admins, and clients through fixes to project access, review states, client files, uploaded photos, comments, and project navigation.
- Reduced workflow friction in shopping and operations by fixing order previews, delivery fee loading, order status controls, voucher storage, exports, checkout button states, and product display behavior.
- Improved public shop and inspiration flows through fixes to Get That Look behavior, related products, responsive layouts, and shop page display issues.

Impact to verify before publishing:

- Number of designers, clients, projects, or orders supported.
- Whether the collage builder replaced a previous manual tool such as slides, Photoshop, Figma, or email attachments.
- Time saved per designer/project when creating a design presentation or tear sheet package.
- Payment/order volume or number of merchant purchase orders generated.
- Whether Cloud Build reduced manual deployment effort or deployment risk.

## Tech To Mention

Use these in the resume when space allows:

- JavaScript
- React
- Firebase
- Firebase Cloud Functions
- Realtime Database
- Firestore
- Firebase Storage
- Firebase Auth
- Konva
- Contentful
- SendGrid
- PayMaya, PayMongo, Dragonpay, and Google Cloud Build only if the final bullet claims broader platform context rather than direct ownership.

Avoid listing every library. Bootstrap, jQuery, React Query, jsPDF, html-pdf, Netlify, and SweetAlert are useful supporting details, but they do not need to be in the final bullet unless the target role values them.

## Strongest Bullet Options

Use 2-4 of these, depending on available resume space.

- Contributed to a Firebase-backed interior design platform spanning designer tools, admin workflows, client review, shopping, checkout, and order management.
- Improved GussyApp project workflows across collage-builder comments, project access controls, uploaded files/photos, questionnaire behavior, local storage compression, and client-facing review states.
- Fixed and refined commerce workflows across order previews, delivery fees, order status actions, voucher handling, merchant/admin exports, Gussy Finds, Get That Look, checkout states, and product display behavior.
- Maintained React/Firebase shop surfaces for Gussy, including responsive Get That Look layouts, related-product behavior, empty-cart checkout handling, and shop page fixes.

## Short Resume Version

Use this if Gussy is one project entry with limited space:

- Contributed to a Firebase-backed interior design platform with designer tools, client review workflows, product catalog, checkout, and order management.
- Improved collage/project and shop workflows across comments, uploaded files/photos, access controls, order previews, vouchers, exports, Get That Look, and checkout edge cases.

## Experience Version

Use this if Gussy is part of a job entry:

- Contributed to Gussy's Firebase-backed design and commerce platform, supporting designer tools, PM/admin workflows, client review, public shopping, checkout, and order management.
- Improved GussyApp project workflows across collage-builder comments, uploaded files/photos, project questionnaire behavior, access controls, local storage compression, and client-facing review states.
- Fixed commerce and admin workflows across order previews, delivery fees, paid/cancelled/delivered status actions, voucher storage, merchant/admin exports, Gussy Finds, Get That Look, and checkout edge cases.
- Maintained the React public website and shop, including responsive Get That Look layouts, related-product behavior, empty-cart checkout handling, product display fixes, and shop page cleanup.

## Project Version

Use this if Gussy appears in a Projects section:

Gussy - Interior Design and Commerce Platform

- Team-built Firebase/React platform for online interior styling, design collaboration, product shopping, and checkout.
- Contributed fixes and enhancements across the GussyApp collage/project workflow, including comments, access controls, uploaded files/photos, questionnaire behavior, local storage compression, and review states.
- Fixed commerce and shop edge cases across order previews, delivery fees, voucher handling, exports, Get That Look, related products, responsive layouts, and empty-cart checkout states.

## Final Resume Entry Draft

This is the current best draft before dates/role/metrics are confirmed:

Gussy - Contributing Software Engineer  
Nov 2020 - Mar 2021

- Contributed to a Firebase-backed interior design platform spanning designer tools, PM/admin workflows, client review, public shopping, checkout, and order management.
- Improved GussyApp project workflows across collage-builder comments, uploaded files/photos, project questionnaire behavior, access controls, local storage compression, and client-facing review states.
- Fixed commerce and admin workflows across order previews, delivery fees, paid/cancelled/delivered status actions, voucher storage, merchant/admin exports, Gussy Finds, Get That Look, and checkout edge cases.
- Maintained React/Firebase shop surfaces, including responsive Get That Look layouts, related-product behavior, empty-cart checkout handling, product display fixes, and shop page cleanup.

## Confidence Notes

High confidence:

- Gussy included both a collage/admin app and a React public website/shop.
- The collage app used Firebase Hosting, Realtime Database, Firestore, Storage, Auth, and Cloud Functions.
- The collage builder used Konva and persisted serialized canvas JSON.
- The app generated PDFs for projects, tear sheets, receipts, and purchase orders.
- Payment integrations included PayMaya, PayMongo, and Dragonpay.
- Current source grouping places Gussy outside `ai-augmented/`, so do not label it AI-augmented unless the user later confirms otherwise.
- Personal commit evidence confirms work from Nov 25, 2020 to Mar 26, 2021 in `gussy-collage`, and Dec 8, 2020 to Jan 8, 2021 in `gussy-website`.
- Shortlog evidence and user confirmation indicate this was a team project; use "contributed to" or "improved" rather than lead/owner wording.

Needs confirmation:

- Exact personal ownership for each feature.
- Exact title/employer/client context.
- Whether to say "built" for all areas or "built and maintained" for safer wording.
- Quantified outcomes.

## Questions For Later

- What was your official title/employer/client context on Gussy?
- Did you build the initial collage builder, inherit it, or significantly extend it?
- Which payment/provider work did you personally implement?
- Did you own the public website/shop, or only specific features?
- Any metrics: number of projects, designers, orders, merchants, products, or revenue processed?
