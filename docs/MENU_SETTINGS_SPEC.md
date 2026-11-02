# Menu Settings Specification

## 1. Overview and Purpose

This specification governs the implementation of the **Menu Settings** feature accessible from:
`Settings → Restaurant Settings → Menu Settings`

The feature provides restaurant owners with centralized control over three core pillars of their digital menu:
1. **Categories Management**: Dynamic category configuration, bilingual names, curated culinary icons, ordering, and deletion safety.
2. **Automatic Availability**: Working-hours synchronization, daily availability auto-resets, and manual master overrides.
3. **Pricing Preferences**: Informational tax-inclusive display, currency baseline, and clean integer price formatting.

The demonstration target remains a mobile web experience optimized for a $390 \times 844\text{ CSS px}$ viewport baseline, supporting both Arabic (RTL) and English (LTR) layouts, as well as Light and Dark theme modes.

---

## 2. Approved Functional Requirements and Business Rules

### 2.1 Categories Management

- **Dynamic Categories**: Move beyond rigid compile-time unions to support user-configured category definitions.
- **Bilingual Category Names**: Every category must include both Arabic (`name.ar`) and English (`name.en`) labels. Both fields are required and must be validated for non-empty text.
- **Curated Culinary Icons**: Categories can be assigned one of eight (8) curated food-themed Lucide icons:
  1. `utensils` (General dining / Main dishes)
  2. `salad` (Salads / Appetizers / Healthy)
  3. `cup-soda` (Cold drinks / Refreshments)
  4. `coffee` (Hot beverages / Café)
  5. `cake` (Desserts / Bakery)
  6. `pizza` (Pizza / Italian)
  7. `sandwich` (Sandwiches / Fast casual)
  8. `layout-grid` (General / Miscellaneous)
- **Category Display Ordering**: Categories maintain a defined `sortOrder` index. The UI supports moving categories up and down to determine their sequence in the Menu category tabs.
- **Default Category Protection**: The three initial seed categories:
  - `main` (الأطباق الرئيسية / Main Dishes)
  - `appetizers` (المقبلات / Appetizers)
  - `drinks` (المشروبات / Drinks)
  are marked with `isDefault: true` and cannot be deleted under any circumstances. Their names and icons may be edited.
- **Category Deletion Safety**:
  - A custom (non-default) category cannot be deleted if it currently contains one or more menu items (`count > 0`).
  - Attempting to delete a non-empty category is blocked with clear feedback requiring products to be reassigned or deleted first.
  - Empty custom categories (`count === 0`) can be deleted after confirming a deletion dialog.

### 2.2 Automatic Availability

- **Working-Hours Synchronization**:
  - Disabled by default (`syncWithWorkingHours: false`).
  - When enabled, the menu automatically observes operational status from `workingHoursStore`.
  - When the restaurant is closed (either by schedule or manual closure), ordering is halted (e.g. order simulation is blocked, and an informative operational banner appears on the Menu screen) while all menu items remain fully visible for student browsing.
- **Daily Availability Reset**:
  - Disabled by default (`dailyAutoReset: false`).
  - When enabled, any products previously marked unavailable (`isAvailable: false`) are automatically restored to available (`isAvailable: true`) at the beginning of a new business day.
  - Since this is a client-side prototype, the start of a new business day is detected on app launch by comparing the current local date (`YYYY-MM-DD`) against a stored `lastAutoResetDate`.
- **Manual Reset Action**:
  - The UI provides an explicit *"Reset All Items to Available Now"* action button.
  - Triggering this action immediately sets all menu items to `isAvailable: true` and displays instant toast feedback, enabling reliable live demonstrations.
- **Manual Override Priority**:
  - Manual changes to product availability made directly on the Menu screen take effect immediately and persist until the next automated day reset or explicit manual reset action.

### 2.3 Pricing Preferences

- **Base Currency**: Strictly Egyptian Pound (`EGP` / `ج.م`). No secondary or selectable currency is supported.
- **Tax-Inclusive Pricing**:
  - Egyptian university dining operates on gross all-inclusive pricing.
  - The tax-inclusive status is informational, enabled by default, and cannot be toggled off or modified.
  - The UI clearly communicates: *"All displayed prices include value-added tax (VAT) and applicable fees"*.
- **Price Formatting**:
  - Maintain clean integer formatting (e.g., `90 ج.م` / `90 EGP`) matching seed orders and reference designs.
- **Explicit Non-Goals (Scope Exclusions)**:
  - Do NOT calculate or add dynamic sales taxes or service charges.
  - Do NOT alter historical order item snapshots or seed order totals.
  - Do NOT build a bulk price adjustment or automated discounting engine.

---

## 3. UI Structure and Component Hierarchy

The Menu Settings interface is implemented as a standard Settings sub-screen (`EditMenuSettings.tsx`):

### 3.1 Layout Anatomy ($390 \times 844\text{ CSS px}$)
1. **Demo Notice Bar**: Persistent top banner indicating fictional demonstration data.
2. **Sub-Screen Header**:
   - Back button (`ArrowLeft`, automatically mirrored in RTL).
   - Localized title: "إعدادات القائمة" / "Menu Settings".
3. **Scrollable Content**:
   - **Info Banner Card**: `UtensilsCrossed` icon, summary title, and descriptive copy.
   - **Section 1: Categories Management Card**:
     - Header with total active category count badge.
     - Category list rows displaying sort position, icon, bilingual names, and product count.
     - Row actions: Reorder (Move Up / Down), Edit (opens Edit Category dialog/sheet), Delete (disabled for default and non-empty categories).
     - Card action: "+ إضافة تصنيف جديد" (+ Add New Category) button opening Add Category dialog/sheet.
   - **Section 2: Automatic Availability Card**:
     - Toggle 1: "ربط التوفر بأوقات العمل" (Sync with Working Hours) with operational explanation.
     - Toggle 2: "إعادة تعيين التوفر يومياً" (Daily Availability Auto-Reset) with daily schedule explanation.
     - Quick Action Button: "إعادة ضبط توفر جميع الأصناف الآن" (Reset All Items to Available Now).
   - **Section 3: Pricing Preferences Card**:
     - Informational currency indicator: "الجنيه المصري (EGP / ج.م)".
     - Informational tax-inclusive status: "الأسعار شاملة ضريبة القيمة المضافة".
     - Integer display format indicator.
4. **Sticky Action Footer**:
   - Primary "حفظ التغييرات" (Save Changes) button.
   - Secondary "إلغاء" (Cancel) button returning to Settings dashboard.

### 3.2 Design Tokens & Styling
- Adheres strictly to established design tokens:
  - Major cards: `var(--radius-card, 6px)`
  - Buttons and interactive controls: `var(--radius-btn, 5px)`
  - Badges: `var(--radius-badge, 4px)`
  - Primary button background: `var(--color-primary-dark, #111827)`
- Full support for Light and Dark themes via semantic CSS custom properties.
- Dual RTL (Arabic) and LTR (English) layout handling.

---

## 4. Architecture and State Management

### 4.1 Data Models (`src/types/menuSettings.ts`)
```ts
import { LocalizedName } from './menu';

export type CategoryIconType =
  | 'utensils'
  | 'salad'
  | 'cup-soda'
  | 'coffee'
  | 'cake'
  | 'pizza'
  | 'sandwich'
  | 'layout-grid';

export interface CategoryDefinition {
  id: string;
  name: LocalizedName;
  icon: CategoryIconType;
  sortOrder: number;
  isDefault?: boolean;
}

export interface MenuAutoAvailabilitySettings {
  syncWithWorkingHours: boolean;
  dailyAutoReset: boolean;
  lastAutoResetDate?: string; // YYYY-MM-DD
}

export interface MenuPricingSettings {
  currency: 'EGP';
  isTaxInclusive: boolean;
  decimalPrecision: 0;
}

export interface MenuSettings {
  categories: CategoryDefinition[];
  autoAvailability: MenuAutoAvailabilitySettings;
  pricing: MenuPricingSettings;
}
```

### 4.2 Storage and Subscription (`src/data/menuSettingsStore.ts`)
- Stored in browser `localStorage` under key `'restaurant_menu_settings_v1'`.
- Implements the observer pattern with a public `subscribe(listener)` method.
- Provides standard accessor and mutation methods:
  - `getSettings()`
  - `updateSettings(partial)`
  - `getCategories()`
  - `addCategory(category)`
  - `updateCategory(id, updates)`
  - `deleteCategory(id)`
  - `reorderCategories(orderedIds)`
  - `resetAllProductAvailability()`
  - `checkAndExecuteDailyReset()`

### 4.3 Integration Boundaries
- **`menuStore`**: Reads dynamic category list to derive category counts and validate products; provides item counts per category for deletion safety checks.
- **`MenuPage`**: Category tabs render dynamically based on `menuSettingsStore.getCategories()`. If working-hours synchronization is enabled, an operational banner indicates when ordering is paused.
- **`AddProductScreen` & `EditProductScreen`**: Category selectors render dynamically from active categories.
- **Orders & Analytics**: Remain completely decoupled and unaffected; historical order snapshots are never modified.

---

## 5. Implementation Roadmap

1. **Phase 1: Requirements Analysis & Discovery** (Complete)
2. **Phase 2: Data Models, Types, Store & Calculation Utilities**
3. **Phase 3: Categories Management UI**
4. **Phase 4: Automatic Availability & Pricing Preferences UI**
5. **Phase 5: Menu & System Integration**
6. **Phase 6: Final Verification & Visual QA**

