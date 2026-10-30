# Implementation Decisions

Keep this file short. Record only material decisions that are not explicitly resolved by the active web demo specification or reference images.

## D-001: Active delivery target

The current milestone is a React + TypeScript + Vite website intended to be demonstrated on a phone. It supersedes the Flutter/Android delivery constraint from the original product requirements for this milestone only. The original document may be kept under `docs/archive/` as historical context, but it must not compete with `docs/WEB_DEMO_SPEC.md` as the active platform instruction.

## D-002: Reference viewport baseline

The reference image `Restaurant Orders Dashboard UI.png` (1024 x 1536 px) is a design presentation mockup inside a decorative phone frame. The measured inner-screen pixel dimensions (~834 x 1504 px, aspect ratio ~1:1.803) do not mathematically match 390 x 844 CSS pixels (aspect ratio ~1:2.164). In accordance with `WEB_DEMO_SPEC.md`, `390 x 844 CSS pixels` is established as the chosen mobile browser test viewport baseline, not as a mathematically derived dimension. Desktop browser review will render a centered mobile frame constrained to this viewport.

## D-003: State lifecycle

Use in-memory state and mock repositories. Seed initial orders and menu on a page load. A reload may reset the prototype. No persistent database or storage is required.

## D-004: Functional source of truth vs. visual source of truth

`WEB_DEMO_SPEC.md` is the authoritative source of truth for functional behavior, state machine transitions, data models, initial counts, and navigation architecture. The reference screenshot `Restaurant Orders Dashboard UI.png` is the primary visual source of truth for aesthetics, typography, colors, borders, shadows, spacing, card layouts, and component styling wherever it does not conflict with the specification.

## D-005: Historical order items

When creating an order, copy item names and unit prices into its line items. Later menu edits must not alter the details of existing orders.

## D-006: Responsive boundary

Do not implement tablet or desktop layouts. Prevent clipping and horizontal overflow only across ordinary phone widths. Desktop browser review may use a centered fixed mobile canvas.

## D-007: Visual uncertainty

When a reference image does not reveal a behavior, choose the simplest behavior compatible with the feature requirements. Do not invent a new screen or visual system. Update this file when an assumption affects more than one screen.

## D-008: Reconciliation of order tabs (4 visible vs. 5 required)

The reference screenshot displays 4 filter tabs ("New", "Preparing", "Ready", "Delivered"). However, `WEB_DEMO_SPEC.md` (§6, §8) mandates 5 logical views:
1. Pending payment confirmation (`pendingConfirmation`)
2. New orders with confirmed payment (`newOrder`)
3. Preparing (`preparing`)
4. Ready for collection (`ready`)
5. Delivered (`delivered`)

We adopt all 5 views to satisfy the functional specification. Visually, each tab replicates the reference's rounded pill and count badge styling. The first tab represents "بانتظار الدفع" (Pending Payment) and utilizes the red outline, red clock icon, and light pink accent styling demonstrated in the reference's selected tab.

## D-009: Reconciliation of bottom navigation (2 visible vs. 3 required)

The reference screenshot shows only 2 tabs ("Orders", "Menu"). `WEB_DEMO_SPEC.md` (§5) requires 3 primary destinations:
1. Orders (الطلبات)
2. Menu management (قائمة الطعام)
3. Demo tools (أدوات العرض)

We implement the 3 required destinations within the floating bottom pill navigation, preserving the exact visual language of the reference (floating container, dark navy active background `#0F172A`, white active icon/text, muted gray inactive icon/text).

## D-010: Reconciliation of badge counts and initial seed orders

The reference screenshot shows arbitrary static counts (New: 4, Preparing: 6, Ready: 2, Delivered: 12; total 24). In contrast, `WEB_DEMO_SPEC.md` (§10) requires exactly 10 seeded orders at startup:
- 2 awaiting payment confirmation
- 2 new with confirmed payment
- 2 preparing
- 1 ready for collection
- 3 delivered

The application will strictly seed these 10 orders per specification. Badge pills will dynamically calculate and display the live count of orders in each respective state.

## D-011: Reconciliation of payment buttons and state transitions

The reference screenshot displays identical red "Verify Payment" buttons across all cards shown. Per `WEB_DEMO_SPEC.md` (§6, §7, §8), payment status is strictly decoupled from operational status:
- "Verify Payment" ("تأكيد الدفع") in solid red appears only for orders in `pendingConfirmation`.
- Confirming payment transitions the order to `newOrder` (payment confirmed). Preparation is prohibited before payment is confirmed.
- Subsequent forward transitions use contextually appropriate primary action buttons ("بدء التحضير" / Start Preparing, "جاهز للاستلام" / Mark Ready, "تسليم الطلب" / Mark Delivered).
- Cards in the completed `delivered` state indicate completion.
- Card tap opens order details; action button tap executes the transition with event propagation stopped.

## D-012: Arabic localization and RTL orientation

Although the reference mockup displays English text ("Good Food", "Orders", "Verify Payment", "Total"), the active specification and workspace rules mandate complete Arabic UI copy and RTL layout. All strings (status tabs, buttons, form labels, student names, dish names, categories, and currency `ج.م`) will be in natural Arabic, with numbers displayed in Western digits (`0-9`) as specified.

## D-013: Minimal dependencies and styling architecture

To ensure high performance, zero build complexity, and exact fidelity to the reference image, we avoid large UI frameworks or heavy CSS libraries. We will use plain CSS with structured CSS custom properties (design tokens in `src/styles/tokens.css`) and `lucide-react` for clean, lightweight SVG icons matching the reference visual language.

## D-014: Order card simplification and payment review modal workflow

In targeted refinement for the Orders Dashboard:
1. **Student Academic Info**: Faculty/major details were removed from all order cards and the modal header. Only the student name and relevant order details are displayed.
2. **Unified Review Action**: For pending-payment orders, both tapping the card and tapping the primary button ("مراجعة الإيصال") open the same bottom-sheet Order Review Modal without prematurely confirming payment.
3. **InstaPay Mock Receipt Preview**: A clearly fictional InstaPay receipt section is embedded in the review modal for pending orders, complete with a transfer reference number, student handle, mock amount, and full-screen lightbox preview.
4. **Payment Confirmation**: The bottom-sheet modal contains a pinned primary action ("تأكيد الدفع") that executes the payment confirmation transition, moving the order from `pendingConfirmation` to `newOrder` and updating live tab counters.

## D-015: Shared Primary Dark Design Token Reuse

To maintain design system consistency across the mobile interface without duplicating hardcoded dark values:
- The existing primary dark token `--color-primary-dark` defined in `src/styles/tokens.css` is aligned to `#111827` (`rgb(17, 24, 39)`).
- The active Bottom Navigation button (`.nav-item.active .nav-icon-wrap`) references `var(--color-primary-dark, #111827)`.
- In the Working Hours feature (`EditWorkingHours.css`), both the Save Changes button background (`.btn-save-changes`) and the active state of daily toggle switches (`.day-toggle-switch.active`) reuse `var(--color-primary-dark)`.
- Dynamically updating `--color-primary-dark` instantly and synchronously updates all three interface elements in unison.

## D-016: Notifications & Alerts Preferences Architecture

To provide realistic in-app notification controls without backend/push dependencies:
- Notification preferences are encapsulated in `src/data/notificationsStore.ts` under `notification_preferences` in `localStorage`.
- Two independent preferences: `newOrdersEnabled` (defaults to true) and `paymentConfirmationsEnabled` (defaults to true).
- In accordance with non-blocking enterprise UX standards, disabling notifications suppresses only UI notification presentation (toasts, bell icon dot indicator); it never blocks order progression, payment confirmations, or error alerts.
- In the static demo environment, incoming orders are currently initial seed states; therefore, `newOrdersEnabled` controls presentation on the header bell notification action and dot badge, while `paymentConfirmationsEnabled` controls payment confirmation toasts upon state transition.

## D-017: Appearance & Theme Settings Phase 1 (UI-Only Implementation)

In accordance with Phase 1 requirements:
- The Appearance & Theme row in Settings opens a dedicated view (`EditAppearance.tsx`).
- Offers two explicit theme options: Light Mode ("الوضع الفاتح" / "فاتح") and Dark Mode ("الوضع الداكن" / "داكن").
- Light Mode is initialized as the selected state by default.
- Selection is maintained exclusively within local component state for Phase 1.
- Global CSS custom properties (such as `--color-page-bg`) and active application appearance remain completely unmutated.
- Saving triggers a localized success toast and returns to Settings; Cancel returns immediately without side effects.

## D-018: Global Light and Dark Theme Architecture (Phase 2)

To deliver a consistent, robust, and accessible light/dark theme system:
- Centralized in `src/data/themeStore.ts` using an observable pattern matching existing stores.
- Persisted in `localStorage` under `app_theme` (`'light' | 'dark'`), defaulting to `light`.
- Applied immediately to the DOM via the document root attribute: `document.documentElement.setAttribute('data-theme', theme)`.
- Imported eagerly in `main.tsx` to prevent theme flash (FOUC) on application startup or refresh.
- Extended `tokens.css` with semantic CSS variables for page background, card surfaces, text hierarchy, borders/dividers, inputs, bottom navigation, modals, overlays, toasts, and badges for both `light` and `dark` themes.
- Reused design tokens across all components so the original Light Theme remains 100% visually unchanged while Dark Theme provides high-contrast, accessible slate styling across all screens, cards, modals, and navigation.



