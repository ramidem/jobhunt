# Disabled

Pages parked here are not routed by Next.js. They were moved out of
`src/app/(workspace)/` while user and auth work is in progress.

To re-enable one, move `src/disabled/pages/<name>/` back to
`src/app/(workspace)/<name>/`.

Also parked: the public resume home page (`pages/home-page.tsx`, originally `src/app/(workspace)/page.tsx`).
`/` is the sign-in page and redirects to `/settings` after sign-in. The workspace layout (sidebar and
`AuthGate`) is live again at `src/app/(workspace)/layout.tsx`; the sidebar lists only the pages in
`enabledHrefs` in `workspace-nav.tsx`. Add a page's path there when you move it back.
