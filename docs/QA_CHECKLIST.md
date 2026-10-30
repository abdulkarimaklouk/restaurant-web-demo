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

## Menu (Phase 2 Full CRUD & Mutations — Upcoming)

- [ ] Availability changes immediately mutate in-memory menu state.
- [ ] Unavailable items are excluded from simulated orders.
- [ ] Add and edit forms validate required fields and positive numeric prices.
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


