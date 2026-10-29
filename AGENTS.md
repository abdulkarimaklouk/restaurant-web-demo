# Workspace Rules for the Restaurant Mobile Web Demo

## Authority and Scope

- This repository builds the first **web-only presentation prototype** for the restaurant-facing university ordering concept.
- `docs/WEB_DEMO_SPEC.md` is the active specification for this milestone.
- Any original Flutter/Android requirements document is background for product behavior only. It must not override the current web-only delivery target. If kept in this repository, archive it under `docs/archive/` and do not leave it as a competing active specification at the repository root.
- This is a demo, not a production application. Do not build a backend, database, authentication, real payment, or external-service integration.
- Make reasonable low-risk assumptions, record them in `docs/DECISIONS.md`, and continue. Do not stop over decisions that are irrelevant to a static prototype.

## Stack

- Use React, TypeScript, and Vite for a small client-side web app.
- Use plain CSS with design tokens and reusable components to reproduce the supplied visual references accurately.
- Keep dependencies minimal. Add an icon package only if an existing installed package does not meet the reference designs.
- Use local mock data and in-memory state only. No network requests, backend, remote image loading, analytics, or telemetry.
- Use the repository's existing working stack if one is already present and compatible; do not replace working project infrastructure without a clear reason.

## Reference-Driven UI Implementation

- Read `docs/WEB_DEMO_SPEC.md` and `docs/SCREEN_INVENTORY.md` before coding.
- Inspect every image inside `design/reference-screens/` before implementation. Do not assume the images all represent the same screen or state.
- Treat the supplied UI/UX images as the primary visual source of truth for layout, spacing, dimensions, typography, colors, borders, shadows, icons, and content density.
- Recreate the design with real HTML elements and CSS. Do not use an entire screenshot as the page background or fake interactive controls by placing hotspots over a screenshot.
- Do not invent new visual styles or redesign the references unless the specification requires a missing state. Record material ambiguities in `docs/DECISIONS.md`.
- Keep user-facing content in Arabic with RTL layout. Keep code identifiers, comments, filenames, and project documentation in English.

## Viewport Policy

- The demonstration is intended to be opened on a phone only. It is not a general responsive website and must not get separate tablet or desktop layouts.
- Determine the target CSS viewport from the supplied reference images where possible. If no viewport is clear, use a narrow phone baseline near 390 CSS pixels wide and 844 CSS pixels high.
- Keep the main interface optimized for that mobile viewport. Accommodate ordinary small-phone width variation only to prevent clipping and horizontal overflow; do not add tablet or desktop breakpoints or redesign the layouts for them.
- Use mobile viewport metadata and safe-area handling where needed. Test the main flows at the agreed phone viewport and a slightly narrower phone width.
- If inspected in a desktop browser, it is acceptable to center a single mobile-width canvas for visual review. Do not build a desktop navigation system.

## Architecture and Code Quality

- Organize code by feature, with shared layout components and reusable UI primitives.
- Keep order and menu seed data separate from view components.
- Use TypeScript types for the principal domain objects.
- Keep state transitions in small named functions or a mock repository/service, rather than duplicating business rules across components.
- Keep presentation components readable and avoid unnecessary abstractions, state libraries, or design-system frameworks.
- Do not add features that are not required by `docs/WEB_DEMO_SPEC.md` or the supplied reference designs.

## Required Verification Loop

For each screen or meaningful UI change:

1. Run the app and verify the route or view renders.
2. Test the important interactions for that screen.
3. Capture a browser screenshot at the target phone viewport.
4. Compare the screenshot against the matching reference image.
5. Fix noticeable differences in layout, spacing, typography, colors, and element sizes before moving on.
6. Run the available build and lint checks before declaring the milestone complete.

Update `docs/QA_CHECKLIST.md` and `docs/DECISIONS.md` when relevant. Never claim a test, browser check, or build passed unless it was actually run.
