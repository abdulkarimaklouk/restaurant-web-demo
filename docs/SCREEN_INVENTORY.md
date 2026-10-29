# UI Reference Screen Inventory

Complete this inventory after adding the supplied reference images and before implementing the UI. Keep each original file unchanged. Use one row per image, including alternate states of the same screen.

| ID | Reference file | Screen or state | Image dimensions | Intended app state | Main visual details | Interactions to implement | Reviewed |
|---|---|---|---|---|---|---|---|
| REF-01 | `design/reference-screens/Restaurant Orders Dashboard UI.png` | Orders Overview (Awaiting Payment view active) | 1024 x 1536 px (Mockup with decorative frame) | Orders page with pending-verification orders selected | Top header with restaurant brand, status dot, search, bell with red dot; status filter tabs with count badges; order cards with student avatar, name, faculty, coins badge, item count, relative time, total in EGP, and solid red "Verify Payment" action button; bottom floating navigation bar | Switch tabs, tap order card to open details, tap "Verify Payment" button (without triggering card navigation) to advance order status, switch bottom nav to Menu or Demo Tools | Yes |
| DER-02 | Derived from REF-01 & Spec | Orders Overview (New, Preparing, Ready, Delivered, Empty views) | Target: 390 x 844 CSS px | Orders page for remaining 4 status views + empty states | Same card and header layout; status-specific badges and action buttons ("Start Preparing", "Mark Ready", "Mark Delivered"); localized Arabic empty states for each view | Tab switching, filtering by status, single-step status progression, empty state display | Yes |
| DER-03 | Derived from REF-01 & Spec | Order Details & Receipt Preview Modal | Target: 390 x 844 CSS px | Detailed order inspection view | Modal/sheet with order header, customer info, itemized snapshots (qty, unit price, line total), grand total, coins earned (`floor(total/10)`), mock InstaPay 12-digit ref, sender handle, and local receipt image thumbnail; tap thumbnail to expand preview; primary action button | Close modal, tap receipt for expanded preview, execute primary status transition | Yes |
| DER-04 | Derived from REF-01 & Spec | Menu Management Screen | Target: 390 x 844 CSS px | Menu list grouped by category | Categories (Sandwiches, Meals, Drinks, Desserts); item cards showing item name in Arabic, price in EGP, availability toggle; dimmed styling and "غير متوفر" badge for unavailable items; top "+ إضافة عنصر" action | Toggle item availability immediately (reflects in real-time), tap item to open edit modal, tap add button to open new item modal | Yes |
| DER-05 | Derived from REF-01 & Spec | Add / Edit Menu Item Modal Form | Target: 390 x 844 CSS px | Modal form for creating or editing menu items | Input fields: Item Name (Arabic), Category selector, Price (EGP, > 0), optional description; Arabic validation messages; save and cancel buttons | Field validation, save updates in-memory menu state immediately without mutating existing order snapshots | Yes |
| DER-06 | Derived from REF-01 & Spec | Demo Tools Screen | Target: 390 x 844 CSS px | Utility screen for prototype presentation | Persistent fictional data disclaimer banner; "محاكاة طلب جديد" (Simulate order) card button; "إعادة تعيين البيانات" (Reset seed data) card button; sound alert toggle; audio feedback simulation | Generate randomized valid pending order from available menu items only, show success toast/alert banner; confirm dialog before reset; toggle sound state | Yes |

## Detailed Reference Inspection (REF-01)

- **Source File**: `design/reference-screens/Restaurant Orders Dashboard UI.png`
- **Original Dimensions**: 1024 x 1536 px.
- **Hardware & Viewport Clarification**:
  - The source image is a presentation mockup containing a decorative iPhone frame.
  - The measured inner-screen display is an artistic mockup (~834 x 1504 px, aspect ratio ~1:1.803), which does not mathematically match 390 x 844 CSS px (aspect ratio ~1:2.164).
  - The baseline mobile browser test viewport is explicitly chosen as **`390 x 844 CSS px`** per `docs/WEB_DEMO_SPEC.md` and `docs/DECISIONS.md`.
- **Functional Specification vs. Reference Discrepancies**:
  - *Order Tabs*: Reference shows 4 tabs ("New", "Preparing", "Ready", "Delivered"); specification mandates 5 views (Pending Confirmation, New Confirmed, Preparing, Ready, Delivered). All 5 will be provided with matching pill styling.
  - *Bottom Navigation*: Reference shows 2 tabs ("Orders", "Menu"); specification mandates 3 destinations (Orders, Menu, Demo Tools).
  - *Counts & Seeds*: Reference shows static mock counts (4, 6, 2, 12); specification defines exactly 10 initial seeded orders (2 pending, 2 new, 2 preparing, 1 ready, 3 delivered). Live counts will reflect actual state.
  - *Action Buttons*: Reference shows "Verify Payment" on all cards; specification decouples payment confirmation from operational transitions (Verify Payment -> Start Preparing -> Mark Ready -> Mark Delivered).
- **Header Structure**:
  - Storefront icon container (light bordered rounded square, ~40x40px).
  - Restaurant title "Good Food" (Arabic: "مطعم الأطايب") with chevron-down.
  - Subtitle: Green status dot (`#10B981`) + "مفتوح • يغلق 11:00 م" (Open • Closes 11:00 PM).
  - Actions: Search icon (`#0F172A`) and Notification Bell with red indicator badge (`#EF4444`).
- **Page Heading**:
  - Large bold heading "Orders" (Arabic: "الطلبات"), ~24px font-size, bold weight.
- **Status Filter Tabs**:
  - Tab 1 ("New" / Arabic "بانتظار الدفع" - Pending Payment): Red outline + `#FEF2F2` fill, red clock icon, bold red text, pill count badge.
  - Tab 2 ("Preparing" / Arabic "قيد التحضير"): Light border, white bg, chef hat icon, count badge in light blue.
  - Tab 3 ("Ready" / Arabic "جاهز للاستلام"): Light border, white bg, checkmark in circle icon, count badge in light green.
  - Tab 4 ("Delivered" / Arabic "تم التسليم"): Light border, white bg, box icon, count badge in light slate.
- **Order Card Anatomy**:
  - Background: Pure white `#FFFFFF`, border-radius 16px, subtle drop shadow (`0 2px 8px rgba(0,0,0,0.04)`), border `1px solid #F1F5F9`.
  - Top row (3 sections):
    - Section 1 (Order metadata): Relative timestamp (e.g. "منذ ساعتين"), order number (e.g. "#1044", bold 18px), item count with bag icon (e.g. "عنصر ١").
    - Section 2 (Student information): Circular avatar with user silhouette (~40px), student name in bold Arabic, college department (e.g. "علوم حاسب"), amber coins badge (`#FEF3C7` bg, `#D97706` text, coins stack icon, e.g. "+20 عملة").
    - Vertical Divider: subtle light gray line separating student info from price.
    - Section 3 (Status & Total): Pill badge with orange clock icon + "جديد", label "الإجمالي", large bold price (e.g. "90 ج.م").
  - Bottom row (Action button):
    - Full-width button with 12px border radius, height ~46px.
    - Solid crimson/red background (`#EF233C`), credit card icon + "تأكيد الدفع" (Verify Payment) in white for pending orders.
- **Bottom Navigation**:
  - Floating pill bar at screen bottom with rounded corners and light elevation.
  - Active tab: Solid dark slate `#0F172A` rounded container with white icon + white label.
  - Inactive tabs: Neutral gray icon + label.
  - Destinations: Orders (الطلبات), Menu (القائمة), Demo Tools (أدوات العرض).
