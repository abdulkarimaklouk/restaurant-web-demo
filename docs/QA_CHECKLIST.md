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

## Menu Management — Phase 3C: Edit Product Interface & Live Preview

- [x] Clicking Edit (`btn-edit-item`) on any menu card opens dedicated `EditProductScreen` for the selected product.
- [x] Selected product object correctly passed and loaded using `key={editingItem.id}` to isolate component state.
- [x] All 7 seed products verified for accurate initial field pre-population (Arabic/English names, category, price, image type, availability).
- [x] Initially unavailable products (e.g. `menu-item-5` Caesar Salad) correctly initialize with `isAvailable = false`.
- [x] Each form field can be edited locally without mutating store or other products.
- [x] Live Preview card updates in real-time as user types names, adjusts price, selects category, or toggles availability.
- [x] Client-side validation catches missing Arabic name, missing English name, missing category, and non-positive price.
- [x] Inline localized validation error messages (`AlertCircle` icon + red borders) displayed, and entered values preserved.
- [x] Cancel button discards local modifications and returns to Menu dashboard with existing data intact.
- [x] Save Changes validates form, displays localized placeholder toast (`editProduct.placeholderSaveSuccess`), and returns to Menu without modifying `menuStore` (deferred to Phase 3D).
- [x] Bilingual RTL Arabic and LTR English layouts verified.
- [x] Light and Dark theme styling verified with semantic CSS tokens.
- [x] Mobile viewport at 390 × 844 CSS pixels verified with 0 horizontal overflow.
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Menu Management — Phase 3D: Product Edit Logic & Persistence

- [x] Form submission in `EditProductScreen` connected to `menuStore.updateItem(id, updates)`.
- [x] Updated Arabic and English names applied accurately to target product.
- [x] Price updates (including decimals like `135.5` and `38.25`) applied and formatted in EGP.
- [x] Category changes update product data and automatically recalculate dynamic category counts.
- [x] Image type modifications applied from all 7 supported culinary asset types.
- [x] Availability toggle modifications update both status pill/badge and card toggle switch.
- [x] Corresponding menu card on dashboard updates immediately upon returning to Menu.
- [x] Product ordering is preserved in place.
- [x] Original product ID (`menu-item-1`, etc.) is strictly preserved and cannot be overwritten.
- [x] Edits survive full browser reload and session restart via `localStorage['menu_items']`.
- [x] Multiple products can be edited independently without mutual interference or side-effects.
- [x] All unedited products remain completely intact.
- [x] Cancel button discards uncommitted modifications without mutating store or persistent storage.
- [x] Form validation blocks invalid submissions (negative prices, missing names, invalid categories) and preserves user-entered data.
- [x] Successful update displays localized success toast (`editProduct.editSuccess`) and returns to dashboard.
- [x] Bilingual RTL Arabic and LTR English layouts verified with edited data.
- [x] Light and Dark modes render edited cards without visual regressions.
- [x] 0 uncaught errors in browser console.
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Menu Management — Phase 3E: Delete Product Confirmation Interface

- [x] More Actions button (`btn-more-actions`) connected to `ProductActionsSheet` across all cards.
- [x] Selected product ID and data correctly identified when opening More Actions for different products.
- [x] Selecting "Delete Product" from actions sheet opens `DeleteProductDialog`.
- [x] Confirmation dialog displays the selected product's name in bold.
- [x] Dialog clearly explains that the deletion will remove the product from the menu.
- [x] Dialog features destructive Confirm Delete button (`var(--color-crimson)`) and Cancel button.
- [x] Cancel button closes dialog without mutating product data or persistent storage.
- [x] Backdrop click and `Escape` key dismiss both action sheet and confirmation dialog cleanly.
- [x] Confirm Delete shows localized placeholder feedback toast (`deleteProduct.placeholderSuccess`).
- [x] Product remains present in `menuStore` and `localStorage['menu_items']` (actual deletion deferred to Phase 3F).
- [x] Bilingual RTL Arabic and LTR English layouts verified.
- [x] Light and Dark theme styling verified with semantic CSS tokens.
- [x] Mobile viewport at 390 × 844 CSS pixels verified with 0 horizontal overflow.
- [x] 0 uncaught console errors.
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Menu Management — Phase 3F: Implement Actual Product Deletion Logic

- [x] Implement `deleteItem(id)` in `src/data/menuStore.ts` with strict ID validation.
- [x] Connect `DeleteProductDialog` confirmation to `menuStore.deleteItem(id)`.
- [x] Deletion removes only the selected product and preserves all other products and their IDs.
- [x] Deletion updates `localStorage['menu_items']` immediately.
- [x] Dashboard card disappears immediately upon deletion confirmation without page refresh.
- [x] Category tabs count badges recalculate automatically across all categories.
- [x] Action sheet and confirmation dialog close immediately after deletion.
- [x] Localized success toast displays product name after deletion.
- [x] Cancel, backdrop click, or Escape dismisses dialog without mutating store or storage.
- [x] Handling of invalid or missing product IDs rejects safely without partial modification.
- [x] Deleting an original seed product verified.
- [x] Deleting a user-created product verified.
- [x] Refreshing the browser verifies persistent deletion in `localStorage`.
- [x] Verified across Arabic RTL, English LTR, Light Theme, and Dark Theme.
- [x] 0 uncaught console errors.
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Menu Management — Phase 4: Product Availability Management

- [x] Connect availability toggle switch (`.menu-toggle-switch`) to `menuStore.updateItem(item.id, { isAvailable })`.
- [x] Toggling an available product to unavailable immediately updates card state (switch turns inactive, badge updates to "غير متوفر" / "Unavailable", card dims).
- [x] Toggling an unavailable product back to available immediately restores card state (switch turns active, badge updates to "متوفر" / "Available" with checkmark, opacity restored).
- [x] Updating only the selected product and leaving all other products unmutated.
- [x] Multiple consecutive toggles on the same card function reliably and keep state consistent.
- [x] Toggling multiple different products preserves their independent states.
- [x] Changes persist to `localStorage['menu_items']` immediately.
- [x] Full page reload preserves the toggled availability state.
- [x] Localized feedback toast confirms availability status change in Arabic (`toasts.availabilityAvailable` / `toasts.availabilityUnavailable`).
- [x] Localized feedback toast confirms availability status change in English.
- [x] Verified across Light and Dark themes.
- [x] Verified across 390×844 mobile viewport with zero horizontal overflow.
- [x] 0 uncaught console errors.
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Menu Management — Phase 5: Menu Search & Filters

- [x] Arabic name search (e.g. "برجر", "دجاج").
- [x] English name search while the interface is Arabic (e.g. "burger", "chicken").
- [x] Arabic name search while the interface is English.
- [x] Case-insensitive English search ("bUrGeR", "BURGER", "burger").
- [x] Leading and trailing whitespace trimming (" burger ").
- [x] Category filtering for all tabs: All, Main Dishes, Appetizers, Drinks.
- [x] Available-only filtering via filter sheet.
- [x] Unavailable-only filtering via filter sheet.
- [x] Combined search, category, and availability filters work together concurrently.
- [x] Clearing the search via clear button or empty input restores results.
- [x] Resetting all filters from empty state restores all menu items.
- [x] Empty results state with localized messaging and reset action.
- [x] Correct category counts on horizontal tabs reflecting actual store data.
- [x] Newly created products appear in matching search/filter results immediately.
- [x] Edited product names are searchable immediately.
- [x] Deleted products disappear from search/filter results immediately.
- [x] Availability changes immediately affect filtered results.
- [x] Arabic RTL and English LTR layouts verified.
- [x] Light and Dark themes supported on filter sheet, empty state, and search controls.
- [x] 0 uncaught console errors.
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Menu Management — Phase 6: Menu Integration & Visual QA

- [x] Workflow A: Product creation ("فطيرة دجاج كريسبي" / "Crispy Chicken Pie"), category count increment (All: 8, Main: 4), Arabic & English search.
- [x] Workflow B: Editing product (renaming to "Crunchy Chicken Wrap", category migration to Appetizers, price update), old keyword no longer matches, new keyword searchable, category counts update (Main: 3, Apps: 3).
- [x] Workflow C: Availability management (toggling to unavailable updates badge/switch, Available-only filter hides item, Unavailable-only filter displays item, toggling back in-place dynamically unmounts it).
- [x] Workflow D: Product deletion & cancellation (cancel keeps product in memory/storage, confirm permanently deletes item, counts decrement back to 7).
- [x] Workflow E: Persistence across hard browser reload (all 7 seed products retain values and sequence, deleted product remains deleted, no corrupted records).
- [x] Regression: Multi-axis concurrent filters (Category + Availability + Search).
- [x] Regression: Empty search state and Reset All button.
- [x] Regression: Zero-product empty menu state with "+ Add Product" action.
- [x] Visual QA: Mobile viewport (390 × 844 CSS px) verified with 0 horizontal overflow.
- [x] Visual QA: Desktop viewport (1280 × 800 CSS px) renders mobile shell as centered frame without layout breakage.
- [x] Visual QA: Arabic RTL and English LTR layouts and typography.
- [x] Visual QA: Light and Dark theme styling across all Menu views and dialogs.
- [x] 0 uncaught console errors.
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Menu Management — Phase 7: Menu UI Visual Refinement

- [x] Overall visual direction aligns with Reference Image 1 (clean, bright, modern, subtle borders, soft shadows, blue primary actions).
- [x] Header refined with stronger visual hierarchy for restaurant brand, green status dot glow, and improved spacing.
- [x] Demo notice strip refined to be visually secondary without omitting useful information.
- [x] Prominent "+ Add Item" header button styled with primary blue tokens (`#2563eb`), clear icon, and hover/active states.
- [x] Category tabs redesigned with meaningful icons (`LayoutGrid`, `Utensils`, `Salad`, `CupSoda`) and clear count badges.
- [x] Selected category tab displays light blue background (`#eff6ff`), blue text/icon, and blue badge styling.
- [x] Inactive category tabs maintain neutral styling with subtle borders.
- [x] Search input box expanded to spacious 42px height with subtle borders, clear icon, and soft focus ring.
- [x] Filter trigger styled as separate outlined square button (42x42px) with active-filter blue dot and state.
- [x] Product cards redesigned as cohesive horizontal compositions without disconnected bottom action rows.
- [x] Arabic RTL product cards: thumbnail on right, details beside it, switch and action buttons aligned together on opposite side (left).
- [x] English LTR product cards: naturally mirrored layout.
- [x] Consistent 64x64px image thumbnail dimensions with culinary icon themes.
- [x] Strong product name typography, muted category text, and prominent price in EGP.
- [x] Compact green availability status badge with checkmark icon when available, gray badge when unavailable.
- [x] Blue active availability toggle switch with standardized physical left/right translation.
- [x] Subtle outlined Edit and More Actions buttons with touch-friendly hit areas.
- [x] Bottom navigation displays both icons and text labels across all 4 tabs.
- [x] Bottom navigation active tab features soft light-blue background and blue primary icon and label.
- [x] Bottom navigation inactive tabs remain muted with preserved order, badges, and navigation behavior.
- [x] Zero horizontal overflow verified at 390x844 CSS px mobile baseline.
- [x] Desktop centered mobile canvas verified at 1280x800 CSS px.
- [x] Verified across Arabic Light, Arabic Dark, English Light, and English Dark themes.
- [x] Full regression test suite passed with 0 console errors.
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Phase 7.2: Menu UI Input Controls & Toggle Polish

- [x] Price input native spinners hidden across AddProductScreen and EditProductScreen (`appearance: textfield`).
- [x] Currency indicator (`ج.م` / `EGP`) padded cleanly without overlapping input value in RTL and LTR.
- [x] Availability toggle physical knob strictly mapped to left for OFF and right for ON across both RTL and LTR.

## Analytics Dashboard Phase 2: Data Layer & Calculation Utilities

- [x] Test 1: Today date range boundaries start at local midnight and end at start of tomorrow (24h span `[start, end)`).
- [x] Test 2: Saturday week start: business week starts Saturday 00:00:00 local time.
- [x] Test 3: Friday week end: business week ends Friday 23:59:59.999 (exclusive boundary Saturday 00:00:00, 7 days).
- [x] Test 4: Week transitions across months bridge cleanly (e.g. Oct 31 to Nov 7).
- [x] Test 5: Month and year boundaries: Jan 15 compares to Dec 2026; leap year February has 29 days vs 28 days.
- [x] Test 6: Custom range: start inclusive, end exclusive next-day boundary, prior comparison duration matches exactly.
- [x] Test 7: Local timezone-safe calculations: midnight boundaries calculated without UTC offset skew.
- [x] Test 8: Confirmed vs pending order qualification: `pendingConfirmation` orders strictly excluded from calculations.
- [x] Test 9: Total Sales calculation: accurately sums gross order totals with floating-point precision.
- [x] Test 10: Total Orders calculation: accurately counts qualified confirmed orders.
- [x] Test 11: Items Sold calculation: accurately sums line item quantities across all qualified orders.
- [x] Test 12: Average Order Value calculation: correctly computes Total Sales / Total Orders.
- [x] Test 13: Zero-order handling: safe execution returning 0 with no NaN or Division-by-Zero errors.
- [x] Test 14: Percentage change calculations: accurately computes positive and negative percentage changes.
- [x] Test 15: Missing comparison-period handling: zero prior data returns status `no_prior_data` with `null` percentage.
- [x] Test 16: Sales aggregation: 10 AM strictly covers 10:00-12:00, boundary tests pass, out-of-chart-hours tracked explicitly with full conservation.
- [x] Test 17: Orders aggregation: counts qualifying orders per time bucket.
- [x] Test 18: Top-selling product ranking: sorts by quantity sold descending with revenue as deterministic tiebreaker.
- [x] Test 19: Product name normalization: casing and whitespace variants merge into a single item group.
- [x] Test 20: Order status distribution: accurately calculates counts and percentages for 4 operational statuses (excluding pending).
- [x] Test 21: Zero-data chart aggregation: empty orders returns clean 7-bucket zero template (10 AM to 10 PM) with `hasData: false`.
- [x] Test 22: Seed data integrity: the original 10 seed orders remain completely intact and unmodified (8 confirmed, 2 pending).
- [x] Automated test runner (`node scratch/run_phase2_verification.mjs`) passed 22/22 tests with exit code 0.
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Analytics Dashboard Phase 3: Page Structure, Date Filters & KPI Cards

- [x] Test 1: Analytics navigation activation (AnalyticsPage rendered, notice interceptor removed).
- [x] Test 2: Analytics page rendering (TopHeader, AnalyticsHeader, KpiCardGrid, CustomDateRangeModal).
- [x] Test 3: Correct four KPI cards (Total Sales, Total Orders, Items Sold, Avg. Order Value).
- [x] Test 4: Correct 2×2 grid layout (`grid-template-columns: repeat(2, 1fr)`).
- [x] Test 5: Today filter: accurately calculates sales (861 EGP), orders (8), items (25), and AOV (107.63 EGP).
- [x] Test 6: Saturday-start This Week filter: starts on Saturday, spans 7 days.
- [x] Test 7: This Month filter: spans 1st of month to start of next month.
- [x] Test 8: Custom date range application: applies arbitrary custom start/end boundaries.
- [x] Test 9: Custom date range cancellation: closing without apply triggers `onClose` and preserves state.
- [x] Test 10: Invalid date-range prevention: validates `endDate >= startDate` and disables Apply.
- [x] Test 11: Reactive KPI updates: changing date preset immediately recalculates all 4 KPIs without page reload.
- [x] Test 12: Confirmed vs pending order qualification: strictly excludes `#1044` and `#1045` from revenue KPIs.
- [x] Test 13: Correct values against calculation engine: exact identity with Phase 2 pure calculation functions.
- [x] Test 14: No fabricated percentage comparisons: returns status `no_prior_data` with null percentage.
- [x] Test 15: Arabic RTL translation completeness.
- [x] Test 16: English LTR translation completeness.
- [x] Test 17: Light theme styling: four distinct pastel backgrounds with matching icon badges.
- [x] Test 18: Dark theme styling: comprehensive `[data-theme="dark"]` overrides.
- [x] Test 19: Mobile layout at 390×844: scroll container with bottom-nav clearance and 390×844 baseline.
- [x] Test 20: Code integrity: production build compiled cleanly with zero TypeScript errors or missing imports.
- [x] Automated test runner (`node scratch/run_phase3_verification.mjs`) passed 20/20 tests with exit code 0.
- [x] Actual browser screenshots captured at 390×844 for Arabic Light, English Light, Custom Modal, and Arabic Dark.
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Analytics Dashboard Phase 4: Sales Overview Interactive SVG Chart

- [x] Test 1: Reference Y-axis scaling for 1050 EGP generates 7 ticks `[0, 200, 400, 600, 800, 1000, 1200]` matching `Restaurant Analytics Dashboard.png`.
- [x] Test 2: Y-axis currency formatting in English (`EGP 1,200` to `EGP 0`).
- [x] Test 3: Y-axis currency formatting in Arabic (`١,٢٠٠ ج.م` / `1,200 ج.م` to `0 ج.م`).
- [x] Test 4: Y-axis scale adaptability for smaller revenue values with positive step intervals.
- [x] Test 5: Y-axis integer-only scale for Orders mode (strictly no fractional orders).
- [x] Test 6: Zero orders fallback provides clean default scale `[0, 2, 4, 6, 8, 10]`.
- [x] Test 7: Smooth cubic Bezier path generation (`buildSmoothBezierPath`) with valid `M` and `C` commands.
- [x] Test 8: Gradient area path closure along baseline back to origin (`buildAreaPath`).
- [x] Test 9: Zero-data flat path stability without `NaN` coordinates or distortion.
- [x] Test 10: X-axis time label localization (`10 AM` to `10 ص`, `8 PM` to `8 م`, `Sat` to `السبت`).
- [x] Test 11: Tooltip 12-hour time formatting matching reference image (`8:00 PM` / `8:00 م`).
- [x] Test 12: Visual composition: full-width card, trend icon, SVG canvas, Bezier curve, area fill, guideline, data points, and floating tooltip.
- [x] Test 13: Accessible segmented toggle (`ChartMetricToggle`) for Sales and Orders with active pill styling.
- [x] Test 14: Metric mode state preservation in `AnalyticsPage` without resetting date preset.
- [x] Test 15: Design token adherence (`14px` radius, `--color-card-bg`, `--color-divider`, complete dark mode).
- [x] Test 16: Segmented toggle button styling (blue active pill `#2563eb`, white text, muted inactive).
- [x] Test 17: Dedicated chart localization strings registered in both Arabic and English.
- [x] Test 18: Dual-metric 7-bucket alignment for Today preset (10 AM to 10 PM).
- [x] Test 19: Strict financial conservation (`displayedBucketSales + outOfChartHours === totalSales`).
- [x] Test 20: Clean zero-data fallback template (`hasData: false`).
- [x] Automated test runner (`node scratch/run_phase4_verification.mjs`) passed 20/20 tests with exit code 0.
- [x] Actual browser screenshots captured at 390×844:
  - `analytics-sales-chart-ar-390x844.png` (Arabic Light, Sales mode)
  - `analytics-sales-chart-en-390x844.png` (English Light, Sales mode matching Reference)
  - `analytics-orders-chart-en-390x844.png` (English Light, Orders mode)
  - `analytics-sales-chart-dark-390x844.png` (Arabic Dark, Sales mode)
- [x] Production build (`npm run build`) succeeded with 0 errors.

## Analytics Dashboard Phase 5: Business Performance & Insights

- [x] Test 1: Top 3 product ranking aggregates correctly from qualifying orders.
- [x] Test 2: Products strictly ranked in descending order by quantity sold.
- [x] Test 3: Deterministic revenue tiebreaker ranks identical quantity items by revenue descending.
- [x] Test 4: Product mapping safely identifies unmapped items without guessing and preserves original name.
- [x] Test 5: Pending confirmation orders strictly excluded from top selling totals.
- [x] Test 6: Orders by status accurately counts all 4 confirmed operational statuses (3, 1, 2, 2).
- [x] Test 7: Orders by status percentages calculate accurately to 1 decimal place.
- [x] Test 8: Zero qualifying orders returns safe empty distribution with 0% and no division errors.
- [x] Test 9: Donut segments sum strictly to 100.0% when confirmed orders exist.
- [x] Test 10: Insights correctly generates positive sales growth message with best selling product.
- [x] Test 11: Insights correctly generates negative sales growth message.
- [x] Test 12: Insights accurately reports comparison data unavailable without fabricating percentage.
- [x] Test 13: Best-selling product insight accurately highlights top product name and quantity.
- [x] Test 14: Empty period generates localized empty-state message without crashing.
- [x] Test 15: All three performance outputs synchronize reactively with selected date range presets.
- [x] Test 16: Arabic translations fully defined for all Performance and Insights sections.
- [x] Test 17: English translations fully defined for all Performance and Insights sections.
- [x] Test 18: Light theme styling adheres to 14px radius, soft blue insights panel, and design tokens.
- [x] Test 19: Dark theme styling provides comprehensive `[data-theme="dark"]` overrides for cards and donut slices.
- [x] Test 20: Two-column lower performance grid defined with `repeat(2, 1fr)` and 12px gap.
- [x] Test 21: Card containers enforce `calc(100% - 32px)` margin bounds to prevent mobile horizontal overflow.
- [x] Test 22: AnalyticsPage seamlessly composes TopSellingItems, OrdersByStatusDonut, and AnalyticsInsights.
- [x] Test 23: OrdersByStatusDonut displays 1-decimal-place percentages summing to 100.0% and exact SVG slice proportions (regression test for 37.5%, 12.5%, 25.0%, 25.0%).
- [x] Automated test runner (`node scratch/run_phase5_verification.mjs`) passed 23/23 tests with exit code 0.
- [x] Regression test suites passed (Phase 2: 22/22, Phase 3: 20/20, Phase 4: 20/20).
- [x] Actual browser screenshots captured at 390×844:
  - `analytics-phase5-full-ar-light-390x844.png` (Arabic Light, full top view)
  - `analytics-phase5-scrolled-performance-ar-390x844.png` (Arabic Light, performance grid & insights)
  - `analytics-phase5-scrolled-performance-en-390x844.png` (English Light, performance grid & insights matching reference)
  - `analytics-phase5-ar-dark-390x844.png` (Arabic Dark, performance grid & insights)
- [x] Production build (`npm run build`) succeeded with 0 errors.
