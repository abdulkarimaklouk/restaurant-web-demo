# Restaurant Mobile Web Demo

A mobile-first web prototype for a university restaurant ordering experience, designed to demonstrate the product's user interface, user experience, and core ordering flows.

## Overview

This project is a frontend-only presentation prototype that transforms a university restaurant ordering concept into an interactive mobile web experience.

The goal is to deliver a polished, realistic interface that demonstrates how students can explore the restaurant menu, browse food items, and interact with the ordering experience.

The interface is designed primarily for mobile devices and supports Arabic with a complete Right-to-Left (RTL) layout.

## Project Scope

This milestone focuses exclusively on the web demonstration.

### Included

- Mobile-first responsive interface.
- Arabic language and RTL layout.
- Restaurant menu browsing.
- Food item presentation and ordering interactions.
- Client-side UI states and navigation.
- Realistic prototype interactions using local mock data.

### Out of Scope

- Backend services and APIs.
- Database integration.
- Authentication and user accounts.
- Real payment processing.
- Network requests and production integrations.
- Native Android or Flutter implementation.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | UI development |
| TypeScript | Type safety |
| Vite | Development server and build tooling |
| CSS | Styling and responsive layouts |
| JSON | Mock data |

## Project Structure

    restaurant-web-demo/
    ├── AGENTS.md
    ├── docs/
    │   ├── WEB_DEMO_SPEC.md
    │   ├── PROJECT_STRUCTURE.md
    │   └── SCREEN_INVENTORY.md
    ├── design/
    │   └── reference-screens/
    ├── prompts/
    │   ├── 01_ANALYZE_REFERENCES.md
    │   ├── 02_IMPLEMENT_APPROVED_PLAN.md
    │   └── 03_VISUAL_QA.md
    ├── public/
    ├── src/
    ├── package.json
    └── README.md

See `docs/PROJECT_STRUCTURE.md` for the detailed application structure.

## Getting Started

### Prerequisites

- Node.js LTS compatible with the installed Vite version.
- npm.

### Installation

    npm install

### Development

    npm run dev

### Production Build

    npm run build

### Preview Production Build

    npm run preview

## Development Guidelines

- Keep the rendered interface entirely in Arabic.
- Use RTL direction throughout the user interface.
- Keep source code, identifiers, and documentation in English.
- Prioritize mobile-first design.
- Follow the approved UI/UX references.
- Use reusable React components.
- Maintain TypeScript type safety.
- Keep mock data separate from presentation components.
- Avoid unnecessary dependencies and overengineering.

## AI Agent Instructions

`AGENTS.md` contains persistent instructions for AI coding agents working on this repository.

Before making changes, agents must inspect and follow the project documentation.

Important documents:

- `AGENTS.md` — Persistent development instructions.
- `docs/WEB_DEMO_SPEC.md` — Active scope and requirements.
- `docs/PROJECT_STRUCTURE.md` — Application architecture and folder organization.
- `docs/SCREEN_INVENTORY.md` — Screen inventory and reference mapping.

## Design & Implementation Workflow

Development follows an incremental, reference-driven workflow:

1. **Reference Collection** — Add original UI/UX screenshots to `design/reference-screens/`.
2. **Reference Analysis** — Analyze the screenshots and identify screens, components, layouts, and interactions.
3. **Implementation Planning** — Define and review the screen map and implementation plan.
4. **Development** — Implement the approved plan using React and TypeScript.
5. **Visual QA** — Compare implemented screens against the original references and refine them iteratively.

See the `prompts/` directory for the corresponding workflow instructions.

## Design Principles

- Mobile-first experience.
- Arabic-first interface.
- Consistent RTL behavior.
- Clear visual hierarchy.
- Intuitive navigation.
- Reusable components.
- Consistent spacing and typography.
- High visual fidelity to approved references.

## Important Notes

This repository represents a web-demo milestone of a broader university restaurant ordering concept.

Original product requirements may include Flutter and Android-specific instructions. Those instructions are superseded only for this milestone. Compatible product behaviors should be preserved where applicable.

The web demo must remain independent of backend services and production integrations.

---

**Project:** Restaurant Mobile Web Demo  
**Type:** Frontend Prototype  
**Status:** Web Demo Development
