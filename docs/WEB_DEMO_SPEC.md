# Web Demo Specification: Restaurant Ordering Prototype

## 1. Purpose

Build a polished, interactive website prototype to demonstrate the restaurant-facing experience of a university food-ordering platform to a restaurant owner. The prototype validates the concept and gathers feedback; it is not the production product.

**This document changes the delivery target for the current milestone to a mobile-only website.** Product behavior from older requirements remains relevant when compatible, but Flutter/Android build instructions, tablet layouts, and production-system requirements do not apply to this web milestone.

## 2. Delivery Target

- Website only.
- React + TypeScript + Vite.
- Phone-focused layout using the supplied UI/UX screenshots as the primary visual reference.
- No general responsive redesign for tablets or desktop. Target the actual CSS viewport implied by the reference images; if unavailable, start near 390 x 844 CSS pixels. Prevent clipping on ordinary phone widths without adding desktop/tablet layouts.
- The visible interface is Arabic and RTL.
- Code identifiers, comments, filenames, and documentation are English.
- The website should run locally in a browser and can later be hosted as a static site if needed. Hosting is not part of this task.

## 3. Non-Negotiable Constraints

- No backend, database, authentication, server, API, or network call.
- No real InstaPay/bank/payment integration or verification.
- No real stored balance, coins ledger, rewards engine, or money transfer.
- No student-facing application.
- No real-time synchronization or external notification service.
- No analytics, production dashboard, production deployment, or unrelated features.
- All order, menu, payment, receipt, and student data are fictional.
- Use local state and mock repositories only. State may reset on page reload.
- Do not load remote images or fonts at runtime. Use supplied local assets or CSS placeholders.

## 4. Visual Source of Truth

Images in `design/reference-screens/` define the intended design. Before writing UI code:

1. Inventory every image and identify the screen and state it represents.
2. Inspect its aspect ratio, visible viewport, safe areas, navigation, spacing, component sizes, typography, colors, borders, icons, and text hierarchy.
3. Create or update `docs/SCREEN_INVENTORY.md` with an image-to-screen mapping.
4. Identify which details are visible facts and which interactions must be inferred.
5. Record important unknowns in `docs/DECISIONS.md` rather than inventing a redesign.

Recreate screenshots using real DOM components and CSS. Never use a complete screenshot as the implementation of a screen. Keep visual fidelity high and do not add styles that conflict with the reference images.

## 5. Product Structure and Navigation

Use a small mobile application shell with three primary destinations, matching the source product requirements where compatible:

1. Orders.
2. Menu management.
3. Demo tools.

Use the navigation style visible in the references. If the references do not show navigation, use a restrained mobile bottom navigation with three items. Do not add desktop navigation or unrelated pages.

## 6. Orders Screen

The orders screen is the main entry point. It should include:

- A fictional restaurant name and simple logo placeholder.
- A persistent demo-only notice indicating all data is fictional.
- Five order views, with counts: pending payment confirmation, new, preparing, ready for collection, and delivered.
- Order cards sorted oldest first within the selected view.
- Each card includes a human-readable order number, fictional student name, short item summary, total, relative creation time, payment status, and a coins-to-earn line.
- Each card has one clear primary action for the next valid step.
- Tapping the card opens order details. Tapping the action button must only perform the action and must not also open details.
- An Arabic empty state for every view.

If the reference images specify a different visual arrangement, use the reference arrangement while preserving these required pieces of information and behaviors.

## 7. Order Details

Show:

- Order number, operational status, and payment status.
- Item rows with quantity, unit price, and line total.
- Grand total calculated from stored order-item snapshots.
- Student note when present.
- Fictional InstaPay transaction reference, fictional sender handle, amount, and a local placeholder receipt image.
- Tapping the receipt opens a larger in-app preview.
- If payment is pending, the primary action confirms payment.
- Otherwise, the primary action is the next valid operational status step.
- A coins-to-earn line based on the display-only rule `floor(total / 10)`, defined once in a named constant or utility.

Do not show real transaction details or imply that an image or reference was actually verified. Payment confirmation is a manual local demo action only.

## 8. Order State Rules

Separate payment status from operational status.

Payment status:
- `pendingConfirmation`
- `confirmed`

Operational status:
- `newOrder`
- `preparing`
- `ready`
- `delivered`

Allowed flow:

1. Payment is pending; the order appears in the pending-payment view.
2. Confirming payment changes payment status to confirmed and moves the order into the new-orders view.
3. Starting preparation moves a new order to preparing.
4. Marking ready moves it from preparing to ready.
5. Marking delivered moves it from ready to delivered.

Rules:

- Only forward one step at a time; never skip a state.
- Do not allow preparation while payment is pending.
- Show an Arabic validation message if the prohibited action is attempted.
- No undo, backward transition, order rejection, cancellation, refund, or pickup scheduling.
- Enforce transitions in a domain function or mock repository as well as in button visibility.
- Count badges and lists must update consistently after a transition.

## 9. Mock Menu and Menu Management

Group menu items by category. Each item row shows a local category icon or placeholder, item name, price, and availability switch. Tapping an item opens the add/edit form. Unavailable items remain visible but dimmed and carry a clear unavailable label.

Required categories and seed data (prices in Egyptian pounds):

| Category | Item | Sample price | Initial availability |
|---|---|---:|---|
| Sandwiches | Chicken shawarma | 55 | Available |
| Sandwiches | Beef burger | 70 | Unavailable |
| Sandwiches | Fava and falafel | 20 | Available |
| Sandwiches | Cheese fries | 35 | Available |
| Meals | Koshari meal | 40 | Available |
| Meals | Grilled chicken meal | 90 | Available |
| Meals | Baked pasta with bechamel | 50 | Available |
| Drinks | Orange juice | 30 | Available |
| Drinks | Tea | 10 | Available |
| Drinks | Bottled water | 8 | Available |
| Desserts | Chocolate cake | 25 | Available |

Translate all displayed category and item names into natural Arabic. Keep internal IDs and code identifiers in English.

The item form supports add and edit, with fields for name, category, price, and optional description. Name and category are required, and price must be a number greater than zero. Show validation feedback in Arabic. Saving updates in-memory data immediately. Image upload and item deletion are out of scope.

Existing orders must preserve the item name and unit price that were copied into the order when it was created. Editing the current menu must not rewrite historical mock order details.

## 10. Initial Mock Orders

Seed exactly 10 fictional orders at app startup:

- 2 awaiting payment confirmation.
- 2 new with confirmed payment.
- 2 preparing.
- 1 ready for collection.
- 3 delivered.

Use fictional student first names, varied creation times spanning a few minutes to about an hour, unique 12-digit mock transaction references, one to four available menu items per order, quantities from one to three, and a couple of preparation notes. Use only available menu items when simulating new orders.

Use a consistent data model and calculate totals from item snapshots. Do not hand-maintain totals independently from the line items.

## 11. Demo Tools

Provide the following tools:

- Simulate a new order: pick a fictional student, one to four distinct currently available menu items where possible, quantities from one to three, a unique 12-digit mock transfer reference, pending payment status, and the current timestamp. Add the order to the pending-payment view, update its count, and show a new-order alert.
- Reset demo data: show a confirmation dialog, then reseed the original menu and all 10 initial orders.
- Sound toggle: enable or disable the optional local new-order alert sound. Do not request device permissions or connect to external services.
- Show a demo-only notice.

Since this is a website, replace any native-only haptic feedback with a clear visual in-app banner. A short local browser-generated sound may be used only if it is reliable and user-controlled. Do not claim native haptics are supported.

## 12. Required Arabic UI Localization

All visible application copy must be Arabic and RTL, including navigation, status labels, buttons, validation errors, empty states, dialogs, toasts, and sample data. Use the exact Arabic labels from the original product requirements where that source file is retained. If a label is not specified there, create one consistent natural Arabic translation and keep it in a central UI-copy module.

Use Western digits (0-9) for order numbers, counts, and prices unless the source reference explicitly shows otherwise. Display the Egyptian-pound suffix in the format specified by the original requirements. Keep mixed text, references, and numbers legible inside RTL layouts.

## 13. Recommended Source Layout

Organize by feature; avoid putting the whole prototype in one large component.

```text
src/
  app/
    App.tsx
    navigation.tsx
  components/
    layout/
      MobileAppShell.tsx
      BottomNavigation.tsx
    ui/
      StatusBadge.tsx
      DemoNotice.tsx
      EmptyState.tsx
      ConfirmDialog.tsx
      Toast.tsx
  features/
    orders/
      OrdersPage.tsx
      OrderDetailsPage.tsx
      components/
      orderTransitions.ts
    menu/
      MenuPage.tsx
      MenuItemForm.tsx
      components/
    demo-tools/
      DemoToolsPage.tsx
  data/
    seedOrders.ts
    seedMenu.ts
    mockRepositories.ts
  types/
    order.ts
    menu.ts
  styles/
    tokens.css
    global.css
  utils/
    formatCurrency.ts
    formatRelativeTime.ts
    calculateCoins.ts
  main.tsx
```

Adjust the layout only when the repository or the supplied screen map makes a simpler structure clearly preferable. Do not create all of these files empty; create components as the implementation needs them.

## 14. Visual QA Loop

For each reference screen:

1. Implement only the screen and the components it needs.
2. Run the website.
3. Open it at the target phone viewport derived from the reference image.
4. Capture a screenshot.
5. Compare it against the matching reference, looking at alignment, margins, spacing, font size, card height, colors, icon size, content density, and bottom navigation placement.
6. Fix visible differences before moving to the next screen.
7. Test the interactions specific to that screen.

Do not mark a screen complete based only on the application compiling. Verify both visual similarity and interactions.

## 15. Acceptance Criteria

- The website starts locally and has no backend or network dependency.
- All visible UI copy is Arabic and the layout is RTL.
- The interface follows the supplied UI/UX references closely.
- The main order, detail, menu, item form, and demo-tools flows are implemented.
- Payment confirmation and operational status transitions obey the specified state rules.
- Seed data and simulated-order generation work locally.
- Menu availability changes immediately and unavailable items are excluded from simulated orders.
- Add/edit form validation works and item deletion is absent.
- Reset returns all mock data to the original seed.
- Every visible primary control works.
- No horizontal overflow or clipping occurs at the intended phone viewport.
- Build succeeds and available lint/test checks have been run.
- A screenshot comparison has been performed for every supplied screen before the final handover.

## 16. Non-Goals

Do not build the student app, backend, database, authentication, production payment, actual coins accounting, real notifications, analytics, multi-restaurant support, roles, deletion, cancellation, refund, schedule-a-pickup flow, tablet/desktop layouts, or dark mode.
