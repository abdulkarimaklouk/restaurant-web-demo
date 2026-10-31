# Prototype QA Checklist

Update this checklist during implementation. Do not mark an item complete until it has actually been tested.

## Visual Fidelity

- [x] Every reference image has a matching screen or documented reason it is not implemented.
- [x] The target phone viewport is recorded in `SCREEN_INVENTORY.md`.
- [x] Header, navigation, spacing, card sizes, typography, colors, and icons have been compared against the references.
- [x] All visible copy is Arabic and the interface is RTL.
- [x] The page does not show the raw reference screenshot as a full-page background.
- [x] The intended phone viewport has no clipped controls or horizontal overflow.
- [x] A slightly narrower phone width has been checked for overflow only; no desktop or tablet redesign was added.

## Orders

- [x] The initial orders are in the required status groups.
- [x] Order cards are sorted oldest first within each tab.
- [x] Opening a card shows the correct order details. (Verified via bottom-sheet Order Review Modal with mock InstaPay receipt and payment confirmation)
- [x] The primary action does not also trigger card navigation.
- [x] Payment must be confirmed before preparation.
- [x] Valid operational transitions advance one step at a time.
- [x] Counts and visible orders update after each transition.
- [x] Payment reference and receipt preview are clearly fictional.
- [x] Empty states are present for every order tab.

## Menu (Phase 1 Dashboard UI)

- [x] Dedicated Menu page connected to Bottom Navigation without page reloads.
- [x] Page header displays title "القائمة" / "Menu" and primary "+ إضافة عنصر" ("+ Add Item") button.
- [x] Category tabs (All [7], Main Dishes [3], Appetizers [2], Drinks [2]) render with live product counts.
- [x] Horizontal category scrolling functions smoothly without page-level overflow.
- [x] Search input box renders with magnifying glass icon and localized placeholder.
- [x] Filter trigger button renders with sliders icon.
- [x] All 7 mock presentation products are displayed with accurate prices, categories, and availability.
- [x] Caesar Salad is visibly dimmed (`opacity: 0.72`) and labeled with "غير متوفر" status badge.
- [x] Available products display green check status badge and active toggle switch.
- [x] Phase 1 interactions trigger localized placeholder toasts for Add Item, Search, Filter, Toggle, Edit, and More actions.
- [x] Seamless Dark Theme and Light Theme compatibility across all cards, inputs, tabs, and action buttons.
- [x] Complete bilingual support with Arabic RTL and English LTR layouts.
- [x] Zero console errors; production build (`tsc && vite build`) passed with 0 errors.

## Menu (Phase 2 Data Model, Store & Persistence)

- [x] Strongly typed data models in `src/types/menu.ts` supporting `id`, bilingual `name: { ar, en }`, `category`, `price`, `currency`, `imageType`, and `isAvailable`.
- [x] Product names decoupled from UI translation files into dynamic domain objects.
- [x] Centralized observable store in `src/data/menuStore.ts` with React hook `useMenuStore()`.
- [x] Initial seed products moved into single source of truth in `src/data/menuStore.ts`.
- [x] Initial launch initializes store and persists 7 products to `localStorage['menu_items']`.
- [x] Subsequent launches restore saved menu data without overwriting valid items.
- [x] Malformed or corrupt storage payloads handled safely with defensive fallback.
- [x] Category badge counts derived dynamically from live store menu data.
- [x] Product cards consume store items and display localized names based on active language.
- [x] Switching language does not mutate stored menu data.
- [x] Zero regression on Orders, Settings, Working Hours, Notifications, and Themes.
- [x] 0 console errors; production build succeeded.

## Menu (Phase 3A Add New Product Interface)

- [x] Dedicated Add Product screen accessible from "+ Add Item" button in Menu header.
- [x] Sub-page navigation provides Back header arrow (with RTL mirror) and Cancel button returning to Menu dashboard.
- [x] Required Arabic name input (`dir="rtl"`) and English name input (`dir="ltr"`).
- [x] Category selection buttons for Main Dishes (`main`), Appetizers (`appetizers`), and Drinks (`drinks`).
- [x] Numeric price input with decimal support, negative sign prevention, and validation > 0.
- [x] Image selector grid supporting 7 culinary icon types with active selection indicator.
- [x] Live product preview card updating in real time with selected image, name, category, price, and availability.
- [x] Availability toggle switch defaulting to enabled with reactive status badge ("متوفر" / "غير متوفر").
- [x] Required fields validation displays localized warning toasts and inline errors.
- [x] Cancel discards entered input and returns to Menu dashboard.
- [x] Submitting valid form provides localized placeholder feedback (`addProduct.placeholderSaveSuccess`) without mutating `menuStore`.
- [x] 100% Arabic and English localization with natural terminology.
- [x] Light and Dark theme compatibility via design system tokens.
- [x] Production build succeeded with zero errors.

## Menu (Phase 3B Product Creation & Mutations — Upcoming)

- [ ] Product creation mutates in-memory menu state and assigns stable IDs.
- [ ] Availability changes immediately mutate in-memory menu state.
- [ ] Unavailable items are excluded from simulated orders.
- [ ] Existing order item snapshots do not change when a menu item is edited.
- [ ] Item deletion is not present.

## Demo Tools

- [ ] Simulating an order creates a pending-payment order with valid mock data.
- [ ] The simulated order uses only available menu items.
- [ ] The transaction reference is a unique 12-digit mock value.
- [ ] The new-order banner appears and the pending count changes.
- [ ] The sound toggle behaves as documented without external services.
- [ ] Reset asks for confirmation and restores the exact initial seed.

## Technical Verification

- [x] The application starts with the documented command.
- [x] `npm run build` succeeds.
- [x] Available lint or test scripts have been run.
- [x] Browser console contains no uncaught errors during the primary flow.
- [x] Screenshots were captured for each implemented reference screen.
- [x] Remaining issues are recorded honestly in the handover.

## Working Hours & Design System Tokens

- [x] Shared `--color-primary-dark` design token in `src/styles/tokens.css` unified with the active footer button (`#111827` / `rgb(17, 24, 39)`).
- [x] Save Changes button in Working Hours reuses `var(--color-primary-dark)` for its background.
- [x] Active state of daily working-hours toggle switches reuses `var(--color-primary-dark)`.
- [x] Changing `--color-primary-dark` dynamically propagates to the active footer button, Save Changes button, and active daily toggles in unison.
- [x] Blue accents on info icon and input focus border remain unaffected.
- [x] Save button hover, active, focus, and disabled states verified across RTL Arabic and LTR English.

## Notifications & Alerts Preferences

- [x] Both preferences (`newOrdersEnabled`, `paymentConfirmationsEnabled`) default to `true`.
- [x] Preferences persist in `localStorage` under key `notification_preferences`.
- [x] Disabling new-order notifications suppresses the header bell dot indicator and toast without impacting order lists.
- [x] Disabling payment confirmation notifications suppresses only the payment confirmation toast; the payment transition itself still advances order state normally.
- [x] Both preferences persist independently across page reloads.
- [x] Cancel discards unsaved toggle changes.
- [x] Full Arabic RTL and English LTR coverage verified with 0 console errors.

## Appearance & Theme Settings (Phase 1 & 2)

- [x] Connected Settings row "Appearance & Theme" ("المظهر والسمة") to dedicated editing screen.
- [x] Light Mode ("فاتح" / "Light") is selected by default on initial application load.
- [x] Dark Mode ("داكن" / "Dark") can be selected with clear active radio indicators and border highlights.
- [x] Selected theme is persisted in `localStorage` under key `app_theme`.
- [x] Global theme attribute `data-theme="light"` / `data-theme="dark"` applied directly on document root without page reload.
- [x] Theme restored synchronously on application launch and refresh before rendering to prevent FOUC.
- [x] Cancel discards unsaved theme selections without modifying the applied theme.
- [x] Reopening Settings displays the active theme badge on the Appearance row.
- [x] Complete semantic tokens defined in `tokens.css` for both light and dark modes.
- [x] Light mode remains 100% visually identical to original design.
- [x] Dark mode verified across all surfaces: TopHeader, BottomNavigation, Orders, Cards, Tabs, SummaryModal, MockReceipt, Lightbox, Settings, and all Sub-pages.
- [x] Arabic RTL and English LTR layouts verified across both themes.
- [x] 0 console errors logged; production build passed with 0 errors.

## Menu Management — Phase 3B: Product Creation Logic & Persistence

- [x] Add New Product form connected to `menuStore.addItem()`.
- [x] Form submission creates a conformant `MenuItem` object with safe, unique sequential ID (`menu-item-8`, `menu-item-9`, etc.).
- [x] Bilingual name inputs validated: requires both Arabic and English names.
- [x] Category selection strictly validated against allowed values (`'main' | 'appetizers' | 'drinks'`).
- [x] Numeric price validation strictly enforces positive value (`price > 0`) and supports decimals.
- [x] Currency is set to `'EGP'`.
- [x] Selected culinary `imageType` preserved and validated across all 7 asset types.
- [x] Initial availability switch state (`isAvailable`) preserved accurately.
- [x] New items immediately appended to store state and persisted to `localStorage['menu_items']`.
- [x] Menu dashboard updates reactively upon creation without full page reload.
- [x] Dynamic category counts in tab pills update automatically (both category count and "All" count).
- [x] Reloading or refreshing the page faithfully restores created products alongside seed items.
- [x] Original seed products (`menu-item-1` to `menu-item-7`) are preserved without mutation or overwrite.
- [x] Successful submission shows localized success toast (`addProduct.createSuccess`) and returns to Menu dashboard.
- [x] Cancel button discards all entered inputs without saving or mutating store state.
- [x] Zero regressions across Orders, Settings, Working Hours, Notifications, and Appearance/Theme features.
- [x] TypeScript compilation and production build (`npm run build`) succeeded with 0 errors.



