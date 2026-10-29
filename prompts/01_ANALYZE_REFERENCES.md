# Prompt 1: Analyze UI References and Prepare the Plan

Use Planning mode or the `/plan` command. Do not start implementation yet.

Read `AGENTS.md`, `docs/WEB_DEMO_SPEC.md`, `docs/PROJECT_STRUCTURE.md`, `docs/SCREEN_INVENTORY.md`, and `docs/DECISIONS.md`. Inspect every image in `design/reference-screens/` at full resolution.

Your task in this phase is to:

1. Inventory each image, its dimensions, likely phone viewport, screen name, and UI state.
2. Map each image to a screen and list the visible components, text hierarchy, spacing, colors, shapes, assets, and interactive controls.
3. Identify screen-to-screen navigation and the minimum state needed to make each reference interactive.
4. Propose a React + TypeScript + Vite file plan that follows the recommended feature-first structure but does not over-engineer the prototype.
5. Identify the smallest set of dependencies required. Avoid a large component library unless there is a clear reason.
6. Describe how the design will be checked against reference screenshots at the target phone viewport.
7. Update `docs/SCREEN_INVENTORY.md` and record material assumptions in `docs/DECISIONS.md`.

Do not modify application source files yet. Do not ask broad product questions; make low-risk assumptions and document them. Present the plan and wait for my review before implementation.
