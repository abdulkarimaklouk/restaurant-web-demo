# Restaurant Mobile Web Demo

A frontend-only, phone-focused presentation prototype for a university restaurant ordering concept.

## Important

- `AGENTS.md` contains persistent instructions for Antigravity.
- `docs/WEB_DEMO_SPEC.md` is the active scope for this web-demo milestone.
- `design/reference-screens/` is where original UI/UX reference images belong.
- The original product requirements may describe Flutter/Android. Those platform instructions are superseded for this milestone only; preserve compatible product behaviors but build a website.
- The rendered interface must be Arabic and RTL. Documentation and source identifiers remain English.
- No backend, database, authentication, real payments, network calls, or production integrations.

## Recommended Setup

Use a currently supported Node.js LTS release compatible with the current Vite version. The official Vite guide documents the current Node.js compatibility requirements: https://vite.dev/guide/.

Initialize a React + TypeScript project with Vite if the code scaffold does not already exist:

```bash
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

If Vite refuses to initialize in a non-empty directory, create the scaffold in a temporary sibling directory, then merge only the application scaffold files. Do not overwrite `AGENTS.md`, `docs/`, or `design/`.

Typical commands after setup:

```bash
npm run dev
npm run build
npm run preview
```

The agent must inspect the actual generated `package.json` and use scripts that exist in this project. Do not assume lint or test scripts exist unless they are configured.

## Suggested Work Order

1. Add the actual reference images and complete `docs/SCREEN_INVENTORY.md`.
2. Run the reference-analysis prompt in `prompts/01_ANALYZE_REFERENCES.md`.
3. Review the agent's proposed screen map and implementation plan.
4. Run `prompts/02_IMPLEMENT_APPROVED_PLAN.md`.
5. Iterate through `prompts/03_VISUAL_QA.md` screen by screen.

## Project Tree

See `docs/PROJECT_STRUCTURE.md` for the recommended source layout.
