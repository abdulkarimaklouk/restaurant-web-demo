# Prompt 2: Implement the Currently Approved Screen

Implement only the single screen currently approved for execution. For the initial run, this is the Orders Dashboard.

Before modifying or creating any code, thoroughly read:

- `AGENTS.md`
- `docs/WEB_DEMO_SPEC.md`
- `docs/PROJECT_STRUCTURE.md`
- `docs/SCREEN_INVENTORY.md`
- `docs/DECISIONS.md`
- The approved discovery report and plan (`discovery_report_and_plan.md`)
- The matching reference image in `design/reference-screens/` at full resolution

---

## 1. Single-Screen Scope Control

1. **Implement Only the Approved Screen**: Build only the currently approved screen and the minimum supporting architecture, layout shell, components, and local mock state required for that screen to function.
2. **First Run Scope**: The first run implements the **Orders Dashboard** (and its minimum supporting shell, seed data, and status tabs).
3. **No Unapproved Screens & Secondary Interaction Boundaries**:
   - Do not implement other screens (e.g., Menu Management, Menu Item Form, Demo Tools) during this execution.
   - **Order Card Tap**: Tapping an order card may open a minimal temporary order-summary preview only (e.g., a simple dialog/sheet showing the order items summary). Do not implement the complete Order Details screen or receipt preview in this phase.
   - **Navigation Items (Menu & Demo Tools)**: Tapping the Menu or Demo Tools bottom navigation items should show a brief Arabic notice (toast or inline banner) indicating that the section will be implemented later, while keeping the Orders Dashboard active.
   - **All Primary Actions Functional**: All primary action buttons within the Orders Dashboard (e.g., status advancement, tab filtering) must be fully functional.
   - Do not add any other screens.
4. **No Premature Advancement**: Do not proceed to subsequent screens or phases without explicit user review and approval.
5. **No Architectural Creep**: Do not introduce libraries, state management frameworks, databases, or patterns outside the approved discovery plan.

---

## 2. Core Implementation Constraints

- **Platform & Language**: React, TypeScript, and Vite.
- **Styling**: Plain CSS utilizing the design tokens defined in `src/styles/tokens.css` and `src/styles/global.css`.
- **Localization & Direction**: All user-facing text must be natural Arabic with native RTL layout (`dir="rtl"`). Western digits (`0-9`) for numbers and currency formatted with `ج.م`. Internal identifiers, comments, and filenames remain English.
- **Viewport**: Strictly target the chosen mobile browser viewport of **`390 x 844 CSS pixels`**.
- **No Decorative Framing**: Do not render the decorative phone frame or Dynamic Island in the web application UI. On desktop, constrain the app to a centered canvas.
- **Data & State**: In-memory local state only. All order, menu, and student data are fictional.
- **Strict Non-Goals**: No backend, no databases, no external APIs, no real payment or InstaPay verification, no student app, no remote fonts or images.
- **Minimal Dependencies**: Use only pre-approved lightweight dependencies (e.g., `lucide-react` for icons).

---

## 3. Approved Screen Focus: Orders Dashboard (First Execution)

For the initial screen implementation, deliver:

1. **Restaurant Header**: Brand name in Arabic ("مطعم الأطايب" or "جود فود"), status dot with operating hours ("مفتوح • يغلق 11:00 م"), search, and notification icon.
2. **Page Title**: "الطلبات" (Orders) heading.
3. **5 Logical Order Views**: Implement all five specification tabs with dynamic count badges:
   - "بانتظار الدفع" (Pending Payment - red accent pill and clock icon matching reference style)
   - "طلبات جديدة" (New Confirmed Orders)
   - "قيد التحضير" (Preparing - chef hat icon)
   - "جاهز للاستلام" (Ready - checkmark circle icon)
   - "تم التسليم" (Delivered - package box icon)
4. **Order Cards**: High-fidelity reproduction of reference cards:
   - Customer silhouette avatar, student name, faculty/department, and coins badge (`floor(total / 10)`).
   - Order number (`#1044`), relative timestamp, and item count.
   - Status badge and total price in `ج.م`.
   - Full-width primary action button with isolated click handling (`e.stopPropagation()` so button click advances state without triggering card navigation).
5. **State Transition Rules**:
   - Decouple payment status from operational status.
   - "Verify Payment" ("تأكيد الدفع") applies only to pending payment orders.
   - Forward-only operational steps: "بدء التحضير" -> "جاهز للاستلام" -> "تسليم الطلب".
   - Preparation is prohibited while payment is pending.
6. **Arabic Empty States**: Render friendly Arabic empty states for tabs without orders.
7. **Supporting Shell**: Centered mobile viewport shell and floating bottom navigation showing the active tab.

---

## 4. Phase Boundary: Implementation vs. Visual QA

- **In This Implementation Phase**:
  - Implement functional components, types, seed data, and styling.
  - Run the application locally and verify that the screen renders without runtime or console errors.
  - Test required primary interactions (tab switching, state advancement, event propagation).
  - Run type checking and build checks (`npm run build`).
  - Capture a baseline screenshot at `390 x 844 CSS px` to confirm basic layout rendering.
- **Deferred to Phase 3 (`prompts/03_VISUAL_QA.md`)**:
  - Detailed pixel-by-pixel reference image overlay and comparative analysis.
  - Iterative micro-adjustments to spacing, font weights, shadows, and color hexes.
  - Narrow-phone edge case overflow audits.
  - Do not spend time on exhaustive visual QA loops in this phase.

---

## 5. Stop Condition & Handover

Stop immediately after implementing the single approved screen. Do not continue to additional screens or Phase 3.

Present a concise summary for review containing:

1. **Implemented Scope**: Exactly what components and features were built.
2. **Files Created / Modified**: List of new or altered files.
3. **Execution Commands**: Exact command to launch the app locally (`npm run dev`).
4. **Verification & Build Status**: Confirmation that the screen renders and `npm run build` passes.
5. **Initial Verification Screenshot**: File path or view of the captured baseline screenshot.
6. **Known Stubs / Placeholders**: Any minimal placeholders used for unapproved screens or secondary flows.

Wait for review and approval before proceeding to the next step.
