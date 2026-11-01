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

## D-019: Menu Management Dashboard Interface (Phase 1)

To deliver the main Menu Dashboard interface in accordance with reference specifications:

- **Navigation Integration**: Activated the existing `menu` icon in `BottomNavigation.tsx` so clicking it switches the view directly to the new `MenuPage` rather than showing a notice toast.
- **Page Header**: Features the page title ("القائمة" / "Menu") aligned with a primary "+ إضافة عنصر" ("+ Add Item") action button styled with `var(--color-primary-dark)`.
- **Horizontal Category Tabs**: Horizontally scrollable category pills with count badges ("الكل" [7], "أطباق رئيسية" [3], "المقبلات" [2], "المشروبات" [2]). Touch-friendly with hidden scrollbars and zero page-level horizontal overflow.
- **Search & Filter Bar**: Search input with magnifying glass icon and placeholder alongside a dedicated Filter button with sliders icon.
- **Seven Presentation Products**: Seeded with 7 mock items (Beef Burger 120 EGP, Grilled Chicken 110 EGP, Pasta Alfredo 95 EGP, French Fries 40 EGP, Caesar Salad 65 EGP Unavailable, Coca Cola 25 EGP, Orange Juice 30 EGP).
- **Card Anatomy & States**: Each card includes category, title, formatted price in EGP, status badge with check icon when available, toggle switch, Edit button, and More actions button. Caesar Salad features dimmed opacity and gray "غير متوفر" badge.
- **Phase 1 UI Scope & Feedback**: Item creation, editing, deletion, filtering, and persistence are reserved for Phase 2. Localized feedback toasts inform the user when interacting with Add Item, Search, Filter, Toggle, Edit, and More controls.
- **Theming & Localization**: Seamlessly supports Light and Dark themes via semantic CSS custom properties and provides natural Arabic RTL and English LTR translations.

## D-020: Menu Data Model, Centralized Store & LocalStorage Persistence (Phase 2)

To establish the central data foundation for Menu Management:

- **Decoupled Bilingual Product Model**: Product names are stored directly as `{ ar: string; en: string }` on domain objects rather than UI translation strings. This enables user-managed product data persistence and future creation/editing workflows without touching translation dictionaries.
- **Centralized Observable Store**: Created `src/data/menuStore.ts` following the repository's observable singleton pattern (`subscribe`, `notify`, `getItems`, `updateItems`, `updateItem`, `resetToDefault`) and exposing the `useMenuStore()` hook.
- **Single Source of Truth**: Seed items are defined exclusively in `src/data/menuStore.ts`. Legacy `src/features/menu/data/mockMenu.ts` acts as a re-export proxy to prevent duplication.
- **Persistence (`menu_items`)**: On first launch, the 7 default products are initialized and persisted to `localStorage['menu_items']`. On subsequent visits, data is restored faithfully.
- **Defensive Parsing & Validation**: Implemented robust schema validation (`validateMenuItem`) for IDs, bilingual names, categories, positive prices, currencies, image types, and availability booleans. Malformed or invalid storage payloads fall back gracefully to the initial seed without throwing runtime errors.
- **UI Integration**: Updated `MenuPage.tsx` and `MenuProductCard.tsx` to subscribe to the store, dynamically compute category badge counts, and display the appropriate localized product name based on the active language while preserving all Phase 1 visual styling, tokens, and non-blocking placeholder interactions.

## D-021: Add New Product Editing Interface (Phase 3A)

To provide an intuitive, accessible Add Product editing experience:

- **Sub-page Navigation**: Replaced the Add Item placeholder toast in `MenuPage.tsx` with dedicated view state (`isAddingProduct`). Header Back button (with RTL mirror) and Cancel button discard input and return to the Menu dashboard.
- **Form Architecture**: Local component state encapsulates Arabic name, English name, category, price, image type, and availability toggle.
- **Bilingual Inputs**: Distinct fields for Arabic (`dir="rtl"`) and English (`dir="ltr"`) product names with explicit required markers and validation.
- **Category Control**: Segmented buttons for Main Dishes (`main`), Appetizers (`appetizers`), and Drinks (`drinks`) with active highlight states.
- **Price Control**: Formatted decimal numeric input with `EGP` / `ج.م` suffix; disallows negative signs and validates that price is numeric and strictly greater than zero.
- **Image Type Selector & Live Preview**: Interactive grid supporting all 7 existing culinary types (`burger`, `chicken`, `pasta`, `fries`, `salad`, `cola`, `juice`). An interactive live preview card mirrors the dashboard card anatomy in real-time.
- **Phase 3A UI Scope**: Validating all fields triggers informative localized warning toasts if incomplete; submitting a valid form provides localized placeholder feedback (`addProduct.placeholderSaveSuccess`) and returns to Menu without mutating `menuStore` or persisting data.

## D-022: Menu Product Creation Logic & Persistence (Phase 3B)

To connect the Add Product form to the centralized `menuStore` and support full product creation:

- **Centralized Creation Method (`addItem`)**: Implemented `addItem(input: CreateMenuItemInput): MenuItem | null` in `src/data/menuStore.ts`. It securely validates candidate products, assigns next IDs, appends to store state, writes immediately to `localStorage['menu_items']`, and notifies reactive subscribers.
- **Deterministic ID Generation (`generateNextId`)**: Parses numeric suffixes (`menu-item-(\d+)`) from all existing products, finds the current maximum integer (e.g. 7 for initial seed items), and increments it safely (`menu-item-8`, `menu-item-9`, etc.). Includes a timestamp fallback in the event of collisions.
- **Strict Domain Validation**: Stricter schema enforcement in `validateMenuItem` checks that both Arabic and English names are present and non-empty, category matches allowed values (`'main' | 'appetizers' | 'drinks'`), price is numeric and strictly greater than zero (`price > 0`), and image type is one of the supported 7 types (`'burger' | 'chicken' | 'pasta' | 'fries' | 'salad' | 'cola' | 'juice'`). Invalid payloads are cleanly rejected without throwing or polluting storage.
- **Dynamic Category Count Synchronization**: Because category tabs in `MenuPage.tsx` compute totals directly via `getCategoryCounts(items)`, newly created items instantly increment their respective category badge count and the "All" badge count without requiring manual synchronization or page refreshes.
- **Form Submission & Navigation Flow**: In `AddProductScreen.tsx`, submitting a valid form triggers `addItem()`. On success, displays a localized success toast (`addProduct.createSuccess`), resets local form state, and invokes `onBack()` to return to the Menu dashboard. On failure, retains form contents and presents a localized error toast (`addProduct.createError`).
- **Persistence Across Sessions**: New products are saved to `localStorage['menu_items']` alongside existing seed items, surviving hard page refreshes and browser restarts without mutating or overwriting the original seed dataset.

## D-023: Edit Product Interface & State Architecture (Phase 3C)

To provide a consistent, accessible Edit Product experience using the existing Menu Management architecture:

- **Sub-page Navigation Integration**: In `MenuPage.tsx`, replaced the Edit placeholder toast with dedicated `editingItem: MenuItem | null` state. Clicking the Edit button (`btn-edit-item`) on any `MenuProductCard` passes the selected item to `setEditingItem(item)`. Rendered with `key={editingItem.id}` to cleanly initialize fresh local state and prevent state leakage across different products.
- **Accurate Initial State Pre-population**: Unlike the Add Product screen, `EditProductScreen.tsx` populates all fields directly from the passed `item` (Arabic and English names, category, price, image type, and initial availability status). Tested across all seven seed items including initially unavailable items (`menu-item-5` Caesar Salad) and distinct category types.
- **Reactive Live Preview Synchronization**: Incorporates an interactive preview card matching the dashboard card anatomy. Real-time changes to Arabic/English names, category, price, image type, or availability immediately update the live preview without submitting the form.
- **Strict Client-side Validation**: Requires both Arabic and English names, a valid category selection, and a positive numeric price (`price > 0`). Disallows negative price input directly on keystroke. Displays localized inline validation errors (`AlertCircle` icon + red borders) and surfaces warning toasts if submission is attempted with invalid inputs.
- **Phase 3C Non-Mutation Scope**: Submitting a valid form validates all fields, displays a localized placeholder success toast (`editProduct.placeholderSaveSuccess`), and returns to Menu via `onBack()` without updating `menuStore` or mutating stored products. Clicking Cancel or Back discards local edits immediately without altering existing data. Actual update mutations and persistence are deferred to Phase 3D.
- **Theming & Localization**: Seamlessly supports Light and Dark modes via semantic CSS custom properties (`--color-card-bg`, `--color-border`, `--color-primary-dark`, etc.) and full bilingual RTL Arabic and LTR English layouts.

## D-024: Product Update Mutation & Persistence Logic (Phase 3D)

To connect the Edit Product form to the centralized `menuStore` and support full product updates:

- **Centralized Update Method (`updateItem`)**: Enhanced `menuStore.updateItem(id: string, updates: Partial<MenuItem>): boolean` in `src/data/menuStore.ts`. It strictly locks the original `id` (`id: current.id`) so product identifiers cannot be modified, safely handles numeric conversions for prices, executes schema validation against `validateMenuItem`, updates the item in place preserving card sequence, writes immediately to `localStorage['menu_items']`, and notifies reactive subscribers.
- **Form Submission Flow in `EditProductScreen.tsx`**: Submitting a valid form validates all fields and calls `updateItem(item.id, ...)`. On success, presents a localized success toast (`editProduct.editSuccess`: "تم تعديل بيانات العنصر بنجاح." / "Product updated successfully."), resets state, and calls `onBack()` to return to the dashboard. On failure, preserves user-entered values in the form and surfaces a localized error toast (`editProduct.editError`).
- **Real-time Dashboard & Count Synchronization**: When an item's category changes, `useMenuStore()` automatically triggers recalculation in `CategoryTabs` via `getCategoryCounts(items)`, updating category badge counts and dashboard cards synchronously without full page reload.
- **Persistence Across Sessions**: Updates are serialized to `localStorage['menu_items']`, surviving hard browser reloads and tab closures while leaving other products in the store unmutated.
- **Cancel Safety**: Clicking Cancel discards uncommitted modifications without mutating the store or storage.

## D-025: Product Deletion Confirmation UI & Actions Architecture (Phase 3E)

To establish an accessible, mobile-first product deletion entry point and confirmation flow:

- **Two-Step Action Flow**: Connected the existing More Actions button (`btn-more-actions`) in `MenuProductCard.tsx` to `ProductActionsSheet.tsx`. Clicking More Actions opens a touch-friendly bottom sheet displaying the product preview with "Edit Product Details" and "Delete Product" actions. Selecting "Delete Product" dismisses the sheet and opens `DeleteProductDialog.tsx`.
- **Accessible Confirmation Dialog Anatomy**: Designed according to WCAG/ARIA guidelines with `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`. Displays a crimson trash badge (`var(--color-crimson)`), prominent dialog title, product visual preview box with thumbnail and category/price, clear explanatory warning explaining that students will no longer be able to order the item, a destructive Confirm Delete action button, and a Cancel button.
- **Dismissal & Accessibility Handlers**: Both the bottom sheet and confirmation dialog dismiss cleanly upon clicking the backdrop, pressing the `Escape` key, or clicking the Cancel button.
- **Phase 3E Non-Mutation Scope**: In compliance with UI-only requirements, clicking Confirm Delete validates the product existence, shows an informative localized placeholder toast (`deleteProduct.placeholderSuccess`), and closes the dialog without mutating `menuStore` or `localStorage['menu_items']`. Actual item removal from memory and storage is deferred to Phase 3F.
- **Theming & Localization**: Seamlessly supports Light and Dark modes via semantic CSS tokens (`--color-modal-bg`, `--color-modal-overlay`, `--color-crimson`, etc.) and full RTL Arabic and LTR English layouts without horizontal overflow on mobile viewports.

## D-026: Product Deletion Logic, Store API & Persistence (Phase 3F)

To connect the Delete Product confirmation interface to the centralized `menuStore` and support irreversible removal:

- **Centralized Deletion Method (`deleteItem`)**: Implemented `menuStore.deleteItem(id: string): boolean` in `src/data/menuStore.ts`. Validates product ID string, identifies the index of the target item, filters it out from the array (`filter((i) => i.id !== trimmedId)`), serializes the updated array to `localStorage['menu_items']`, updates in-memory `items`, and notifies reactive listeners.
- **Atomic Failure Handling & Safety**: If serialization fails or the item does not exist, `deleteItem()` rejects the mutation safely and returns `false`, ensuring that the menu state is not partially modified.
- **Dynamic Category Count Recalculation**: Removing an item updates `useMenuStore()` state, causing `getCategoryCounts(items)` to recalculate badge counts synchronously across all category tabs (`all`, `main`, `appetizers`, `drinks`).
- **Immediate Dashboard Card Removal**: The deleted card is removed immediately from the React DOM tree without page refresh. Other items and their stable IDs remain intact in their original display order.
- **Dialog & Sheet Lifecycle**: On confirmation, both `DeleteProductDialog` and `ProductActionsSheet` are closed cleanly (`null`). A localized success toast (`deleteProduct.deleteSuccessWithName` / `deleteProduct.deleteSuccess`) informs the user of successful removal.
- **Non-Mutation on Dismissal**: Closing via Cancel button, backdrop click, or `Escape` key closes the dialog without triggering `deleteItem()`, leaving the product present in memory and `localStorage`.
- **Persistence Across Sessions**: Changes are persisted directly to `localStorage['menu_items']`. On hard page reload or browser restart, deleted products do not reappear. Empty menu state (`[]`) is defensively supported in `readFromStorage()`.

## D-027: Product Availability Management & Persistence (Phase 4)

To deliver real-time, persistent availability management from the Menu dashboard:

- **Reuse Existing Store Mutation (`menuStore.updateItem`)**: Rather than creating a separate store or custom persistence path, the availability toggle calls `updateItem(item.id, { isAvailable: !item.isAvailable })`.
- **Targeted Property Mutation**: Only the target item's `isAvailable` boolean is toggled; all other properties (unique `id`, bilingual `name`, `category`, `price`, `currency`, `imageType`) are strictly locked and preserved.
- **Reactive UI Synchronization**: Because `MenuProductCard` derives its visual state (toggle switch `.menu-toggle-switch.active`, status badge `.product-status-badge.available`/`.unavailable`, card dimming `.menu-product-card.unavailable`, thumbnail style) directly from `item.isAvailable`, store notification triggers an immediate synchronous DOM re-render without page refresh.
- **Persistence (`localStorage['menu_items']`)**: The updated items array is serialized immediately to localStorage under `menu_items`, ensuring the availability status survives page reloads, tab navigation, and browser restarts.
- **Bilingual Context-Aware Toast Feedback**: Successful availability changes trigger localized feedback toasts specifying both the item's name and whether it is now available or temporarily unavailable (`toasts.availabilityAvailable` / `toasts.availabilityUnavailable`), supported in Arabic and English.

## D-028: Live Product Search, Category & Availability Filtering Architecture (Phase 5)

To implement live search, multi-axis filtering, and dedicated empty states without redesigning the screen:

- **Client-Side Derived State**: Filtered products (`filteredItems`) are derived via `useMemo` from `useMenuStore().items` rather than duplicating product collections in local component state.
- **Combined Filtering Pipeline**:
  1. _Category Filter_: When `activeCategory !== 'all'`, filters strictly by `item.category === activeCategory`.
  2. _Availability Filter_: Handled through `MenuFilterSheet.tsx` with options `'all'`, `'available'` (`isAvailable === true`), and `'unavailable'` (`isAvailable === false`).
  3. _Bilingual Case-Insensitive Search_: Checks if trimmed, lowercased query substrings match either Arabic (`item.name.ar`) or English (`item.name.en`) product names. Works uniformly regardless of current active UI language.
- **Independent State Persistence Across Filters**: Adjusting category does not clear search or availability; opening and applying availability options preserves the active search query and category.
- **Two-Tier Empty States (`MenuEmptyState.tsx`)**:
  - _No Products in Menu_ (`items.length === 0`): Prompts user to add their first product (`+ Add Item`).
  - _No Matches Found_ (`items.length > 0 && filteredItems.length === 0`): Displays `SearchX` graphic, informative description with search query context, and a primary action button to reset all filters (`handleResetAllFilters`).
- **Reactive Synchronization**: When products are added, edited, deleted, or toggled in `menuStore`, `filteredItems` re-evaluates immediately without full reload.

## D-029: Menu Filter Sheet Positioning & Frame Containment (Phase 6)

During desktop review verification (1280 × 800 CSS viewport) of the centered mobile phone shell:

- `MenuFilterSheet.css` backdrop was updated from `position: fixed; inset: 0;` to `position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 150;` to ensure it is cleanly contained within `.shell-container`, aligning with the containment pattern established for `ProductActionsSheet` and `DeleteProductDialog`.
- Added safe-area padding-bottom (`calc(16px + env(safe-area-inset-bottom, 8px))`) and normalized the top border-radius to 16px to prevent bottom-clipping on modern mobile viewports.

## D-030: Menu Dashboard UI Visual Refinement (Phase 7)

To align the Menu Dashboard with the visual hierarchy, polish, and modern aesthetic of Reference Image 1:

- **Card Composition**: Reworked `MenuProductCard` from a vertical two-row layout with divider line into a cohesive horizontal composition. In Arabic RTL, the culinary thumbnail ($64 \times 64\text{px}$) is on the right, title/category/price/compact status badge are in the middle, and the blue availability toggle switch and outlined action buttons (`Edit` and `More Actions`) are clustered on the opposite side (left in RTL, right in LTR).
- **Toggle Switch Orientation**: Enforced `direction: ltr` on `.menu-toggle-switch` so the physical switch knob rests consistently on the left when inactive and translates $+16\text{px}$ to the right with blue track when active across both RTL and LTR languages.
- **Category Tabs**: Added meaningful category icons (`LayoutGrid`, `Utensils`, `Salad`, `CupSoda`), refined tab proportions, and applied soft light-blue background (`#eff6ff`), blue text/icon, and blue badge styling for the active tab per Reference Image 1.
- **Search & Filter Controls**: Expanded search input to $42\text{px}$ height with subtle borders and soft focus ring, and styled the filter trigger as a standalone $42 \times 42\text{px}$ outlined square button with blue active state and indicator dot.
- **Bottom Navigation**: Refined the shared bottom navigation bar to display both icons and text labels. Active tab features a soft light-blue rounded pill container with blue primary icon and label; inactive tabs remain muted with generous $44\text{px}$ touch targets.
- **Header & Action Prominence**: Refined restaurant brand typography, status dot glow, and styled the "+ Add Item" header button with prominent blue styling (`#2563eb`) and hover/active states.

## D-031: Price Input Currency Indicator Overlap & Toggle Knob Direction Fixes (Phase 7.2)

To resolve UI overlap in product price inputs and normalize toggle behavior:

- **Currency Indicator Collision**: In `AddProductScreen` and `EditProductScreen`, native number input spinners caused visual collision with the localized currency badge (`ج.م` / `EGP`). Hidden native stepper controls via `appearance: textfield` / `::-webkit-inner-spin-button: none` while preserving numeric keypad input and adjusted `padding-inline` to ensure permanent visual separation between the numeric value and the currency badge.
- **Physical Switch Normalization**: Enforced explicit LTR coordinate mapping on `.menu-toggle-switch` across both Arabic RTL and English LTR layouts so that the inactive OFF position rests on the left and the active ON position translates to the right with blue active track.

## D-032: Analytics Data Layer and Calculation Architecture (Phase 2)

Following the approved Analytics Dashboard design and calculation requirements:

- **Preservation of Seed Dataset**: Kept the original 10 seed orders untouched. No additional seed orders were fabricated, and existing IDs, timestamps, items, and statuses remain preserved.
- **Order Financial Qualification**: Only orders with `paymentStatus === 'confirmed'` qualify for revenue and order analytics. The two seed orders (`1044` and `1045`) with `paymentStatus === 'pendingConfirmation'` are strictly excluded from Total Sales, Total Orders, Items Sold, Average Order Value, and Top Selling Products calculations to prevent revenue inflation.
- **Business Week Definition**: Defined the business week as Saturday 00:00:00 through Friday 23:59:59.999 local time. Represented range boundaries as `[startInclusive, endExclusive)` where the end boundary is the following Saturday 00:00:00.
- **Deterministic Time Boundaries**: Date range resolution utilities (`dateRangeUtils.ts`) support deterministic `now` parameter injection for repeatable testing across month transitions, leap years, and daylight changes without timezone skew.
- **Zero-Prior Period Handling**: When a metric has zero units or zero revenue in the prior comparison period and non-zero value in the current period, the calculation engine returns `status: 'no_prior_data'` and `percentageChange: null`. An artificial $+100\%$ change is never invented for new activity.
- **Product Normalization**: Aggregation groups order line items by normalized product name (`normalizeProductName` trims whitespace and converts to lower case) while preserving the original display name, ensuring variations merge properly into unified item metrics.
- **Operational Statuses**: Orders by Status distribution calculates percentages and counts across the 4 operational statuses (`delivered`, `ready`, `preparing`, `newOrder`) among confirmed orders, guaranteeing an exact 100.0% sum when data is present and safe empty distribution when 0 orders exist.
- **Today's Chart Alignment**: Aligned Today's chart buckets with the 7 reference points shown in `Restaurant Analytics Dashboard.png` (`10 AM`, `12 PM`, `2 PM`, `4 PM`, `6 PM`, `8 PM`, `10 PM`). The 10 AM bucket strictly represents 10:00–12:00, and remaining buckets represent consecutive 2-hour intervals through 10 PM (22:00–24:00). Out-of-chart-hours sales and orders (e.g. before 10 AM or after chart hours) are tracked explicitly in `outOfChartHours` without merging them into the 10 AM bucket, ensuring $\sum \text{bucket.sales} + \text{outOfChartHours.sales} \equiv \text{totalSales}$ without assuming unverified restaurant operating hours.
- **Top-Selling Item Calculations**: Strictly referenced actual `OrderItem` properties (`lineTotal` and `unitPrice`), never referencing non-existent properties. Tiebreakers for identical sold unit quantities sort deterministically by total revenue descending.
- **Custom Lightweight Architecture**: In accordance with project policy, no third-party charting or analytics packages were introduced. Pure TypeScript calculation functions generate structured data ready for SVG chart rendering in subsequent phases.

## D-033: Analytics Page Structure, Date Filtering & KPI Cards UI (Phase 3)

Following the approved `Restaurant Analytics Dashboard.png` reference image:

- **Bottom Navigation Activation**: Replaced the previous `nav.analyticsNotice` toast interception in `BottomNavigation.tsx` with direct navigation to the `analytics` tab, rendering `AnalyticsPage.tsx` in `App.tsx` and displaying active pill styling with `BarChart2` icon.
- **Modular Component Architecture**: Separated concerns into modular presentation components (`AnalyticsHeader`, `DateFilterTabs`, `KpiCardGrid`, `KpiCard`, and `CustomDateRangeModal`), driving state reactively from `useOrderStore()` and `generateAnalyticsDataSet`.
- **Reference-Accurate KPI Card Styling**: Replicated the 2×2 grid layout with individual pastel background colors:
  - Total Sales: mint green surface (`#ecfdf5`), green border (`#d1fae5`), and `Coins` badge.
  - Total Orders: soft blue surface (`#eff6ff`), blue border (`#dbeafe`), and `ShoppingBag` badge.
  - Items Sold: soft lavender surface (`#f5f3ff`), purple border (`#ede9fe`), and `Utensils` badge.
  - Average Order Value: soft peach surface (`#fff7ed`), orange border (`#ffedd5`), and `Receipt` badge.
  - Dark mode surfaces adapt via semantic `[data-theme="dark"]` selectors with elevated contrast and glowing badges.
- **Accessible Custom Date Range Selection**: Implemented `CustomDateRangeModal` with start/end date inputs, inline validation preventing invalid ranges where `endDate < startDate`, Apply and Cancel actions, keyboard `Escape` dismissal, and state preservation on cancellation.
- **Bilingual Context-Aware Translations**: Created dedicated `analytics` translation namespaces in `src/i18n/locales/ar/analytics.json` and `src/i18n/locales/en/analytics.json`, supporting localized comparison strings (e.g. `vs. yesterday`, `vs. last week`, `vs. last month`, `vs. previous period`, and `no comparison data`).

## D-034: Sales Overview Interactive SVG Chart Architecture (Phase 4)

To faithfully recreate the interactive Sales Overview section from `Restaurant Analytics Dashboard.png` without introducing third-party chart libraries:

- **Custom SVG Chart Canvas**: Implemented custom scalable vector graphics with a responsive `viewBox="0 0 350 190"` and mobile viewport baseline at $390 \times 844\text{ CSS px}$. Applied `direction: ltr` explicitly to the SVG element to enforce consistent Cartesian coordinate mathematics and prevent bidirectional layout flipping across Arabic RTL and English LTR layouts.
- **Smooth Bezier Spline & Gradient Area**: Generated smooth cubic Bezier paths (`buildSmoothBezierPath`) with calibrated tension ($0.2$) and boundary clamping between `minY` and `baselineY` to guarantee natural curves without artificial overshoot. Layered a linear gradient (`#2563eb` with 22% opacity to transparent) underneath the curve closed along the baseline.
- **Dual-Metric Toggle**: Integrated an accessible segmented toggle (`ChartMetricToggle`) for `Sales` (revenue in EGP) and `Orders` (confirmed orders count), switching modes seamlessly without resetting the selected date preset.
- **Reference-Accurate Y-Axis Scaling**: Created `calculateYAxisTicks` producing evenly distributed intervals:
  - Sales mode: Generates 7 ticks `[0, 200, 400, 600, 800, 1000, 1200]` with localized currency formatting (`EGP 1,200` in English, `١,٢٠٠ ج.م` in Arabic) for values near 1,000 EGP, matching the approved design reference.
  - Orders mode: Generates integer-only intervals (`[0, 2, 4, 6, 8, 10]`) preventing fractional counts.
- **Active Point & Floating Tooltip**:
  - Highlights the peak bucket by default (8 PM / index 5 on Today preset matching the reference design).
  - Displays a vertical dashed guide line (`stroke="#93c5fd" stroke-dasharray="3 3"`), an outer highlight halo (`rgba(37, 99, 235, 0.22)`), and an elevated floating tooltip card displaying the formatted value and time (e.g., `● 861 EGP / 8:00 PM` or `● 861 ج.م / 8:00 م`).
  - Supports mobile touch interaction through full-height invisible column hit targets ($44\text{px}+$ touch width).
- **Out-of-Chart-Hours Transparency**: Renders a subtle notice banner when sales occur outside displayed chart hours (e.g. before 10 AM or after 10 PM), ensuring complete financial conservation ($\sum \text{bucket.sales} + \text{outOfChartHours.sales} \equiv \text{totalSales}$).
- **Dark Mode & Contrast**: Full theme adaptation using design system tokens (`--color-card-bg`, `--color-divider`, `#60a5fa` guidelines, `#0f172a` tooltip background).

