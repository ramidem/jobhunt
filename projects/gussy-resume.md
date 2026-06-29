# Gussy Resume Companion

## Purpose

This file translates `projects/gussy.md` into resume-ready material. It is not the evidence log; it is the working draft for what should eventually appear in the public resume.

Source grouping: `gussy/` in the local `resume-reference` folder. Gussy is not currently marked as AI-augmented in the reference tree.

Use this file to decide:

- what to claim
- how to word the impact
- which technologies to name
- what still needs confirmation before publishing

## Best Resume Positioning

Gussy should be framed as a full-stack product build for an interior design and commerce platform.

The strongest story is not just "built a website." It is:

> Built connected product workflows for designers, project managers, clients, and shoppers, including a canvas-based design tool, project review lifecycle, PDF exports, product catalog, checkout, and payment integrations.

This gives the project weight because it shows:

- product complexity
- multiple user roles
- frontend depth through the canvas builder
- backend depth through Firebase Functions and payment/order flows
- business relevance through commerce, receipts, and client delivery

## What I Did

Based on the source review, the likely work areas to represent are:

- Built or maintained the GussyApp collage builder used by designers to compose 2D schematic room designs.
- Implemented canvas interactions with Konva: drag/drop, resize, mirror, crop, labels, copy/paste, undo/redo, selection, keyboard shortcuts, and save behavior.
- Persisted project versions by serializing canvas state and saving project/version thumbnails to Firebase Storage.
- Supported role-based workflows for designers, project managers, admins, and clients, including review handoff, send-to-client flows, access locking, and project status updates.
- Generated project PDFs containing cover/back pages, floor plans, schematic designs, renders, and furniture tear sheets.
- Built or maintained Firebase Cloud Functions for review emails, payment callbacks, order receipts, purchase orders, and merchant/client notifications.
- Built or maintained the Gussy public website and shop, including marketing routes, style quiz, product browsing, filtering/search, cart, checkout, and payment result pages.
- Integrated third-party services: Contentful, SendGrid, PayMaya, PayMongo, Dragonpay, Netlify, Firebase, and Google Cloud Build.

## Impact Framing

Confirmed impact from source:

- Replaced manual design presentation workflows with a browser-based collage builder and export flow.
- Supported collaboration between designers, PMs/admins, and clients through project statuses, review states, versioning, and email delivery.
- Connected design recommendations to product commerce through furniture metadata, shop filters, carts, checkout, receipts, and purchase orders.
- Reduced operational friction by centralizing design files, thumbnails, tear sheets, receipts, and client-facing PDFs inside the app workflow.

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
- PayMaya
- PayMongo
- Dragonpay
- Google Cloud Build

Avoid listing every library. Bootstrap, jQuery, React Query, jsPDF, html-pdf, Netlify, and SweetAlert are useful supporting details, but they do not need to be in the final bullet unless the target role values them.

## Strongest Bullet Options

Use 2-4 of these, depending on available resume space.

- Built a Firebase-backed interior design platform spanning designer tools, project management, client review, shopping, checkout, and payment processing.
- Implemented a Konva-based collage builder for composing 2D room designs with drag-and-drop products, object transforms, labels, version history, thumbnails, and PDF export.
- Automated client delivery workflows by persisting canvas state, generating project PDFs and furniture tear sheets, sending review emails, and updating role-based project statuses.
- Integrated product catalog and checkout flows across React, Firebase, and payment providers, supporting search/filtering, merchant inventory, vouchers, receipts, purchase orders, and payment callbacks.
- Maintained the public Gussy website and shop, including Contentful-backed pages, style quiz, product browsing, cart, checkout, and payment result routes.

## Short Resume Version

Use this if Gussy is one project entry with limited space:

- Built a Firebase-backed interior design platform with a Konva collage builder, project review workflows, PDF exports, product catalog, checkout, and PayMaya/PayMongo/Dragonpay integrations.
- Implemented designer and client workflows for composing room designs, saving versioned canvas state, generating thumbnails and tear sheets, and sending projects through review and delivery states.

## Experience Version

Use this if Gussy is part of a job entry:

- Built and maintained Gussy's Firebase-backed design and commerce platform, connecting designer tools, PM/admin workflows, client review, public shopping, checkout, and payment processing.
- Implemented a Konva-based 2D schematic builder with drag-and-drop products, object transforms, labels, version history, thumbnail generation, and PDF export for client-facing design packages.
- Developed Firebase Cloud Functions for review emails, payment callbacks, order receipts, purchase orders, and merchant/client notifications across PayMaya, PayMongo, Dragonpay, and SendGrid.
- Maintained the React public website and shop, including Contentful-backed content, style quiz, product search/filtering, cart, checkout, and payment result pages.

## Project Version

Use this if Gussy appears in a Projects section:

Gussy - Interior Design and Commerce Platform

- Full-stack Firebase/React platform for online interior styling, design collaboration, product shopping, and checkout.
- Built a Konva collage builder for designer-created 2D room schematics, including drag/drop furniture placement, transforms, labels, versioned saves, thumbnails, and PDF exports.
- Supported project review and commerce workflows with Firebase Functions, SendGrid email delivery, product filtering, receipts, purchase orders, and payment integrations.

## Final Resume Entry Draft

This is the current best draft before dates/role/metrics are confirmed:

Gussy - Software Engineer  
Dates TBD

- Built and maintained a Firebase-backed interior design platform spanning designer tools, project management, client review, public shopping, checkout, and payment processing.
- Implemented a Konva-based collage builder for composing 2D room designs with drag-and-drop products, object transforms, labels, version history, thumbnail generation, and PDF export.
- Automated client delivery workflows by persisting canvas state, generating project PDFs and furniture tear sheets, sending review emails, and updating role-based project statuses.
- Integrated React/Firebase commerce flows with product search/filtering, merchant inventory, vouchers, receipts, purchase orders, and PayMaya, PayMongo, and Dragonpay payment paths.

## Confidence Notes

High confidence:

- Gussy included both a collage/admin app and a React public website/shop.
- The collage app used Firebase Hosting, Realtime Database, Firestore, Storage, Auth, and Cloud Functions.
- The collage builder used Konva and persisted serialized canvas JSON.
- The app generated PDFs for projects, tear sheets, receipts, and purchase orders.
- Payment integrations included PayMaya, PayMongo, and Dragonpay.
- Current source grouping places Gussy outside `ai-augmented/`, so do not label it AI-augmented unless the user later confirms otherwise.

Needs confirmation:

- Exact personal ownership for each feature.
- Dates and title.
- Whether to say "built" for all areas or "built and maintained" for safer wording.
- Quantified outcomes.

## Questions For Later

- What was your official role/title on Gussy?
- What dates did you work on it?
- Did you build the initial collage builder, inherit it, or significantly extend it?
- Which payment/provider work did you personally implement?
- Did you own the public website/shop, or only specific features?
- Any metrics: number of projects, designers, orders, merchants, products, or revenue processed?
