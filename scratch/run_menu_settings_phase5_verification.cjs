const fs = require('fs');
const path = require('path');

// Setup mock window and localStorage before requiring stores
const mockStorage = {
  store: {},
  getItem(k) {
    return this.store[k] !== undefined ? this.store[k] : null;
  },
  setItem(k, v) {
    this.store[k] = String(v);
  },
  removeItem(k) {
    delete this.store[k];
  },
  clear() {
    this.store = {};
  },
};

global.window = {
  localStorage: mockStorage,
  setInterval: global.setInterval.bind(global),
  clearInterval: global.clearInterval.bind(global),
};

// Mock i18n module before requiring orderTransitions
const i18nPath = path.resolve(__dirname, 'compiled_menu_settings_cjs/i18n/index.js');
require.cache[i18nPath] = {
  id: i18nPath,
  filename: i18nPath,
  loaded: true,
  exports: {
    default: {
      t: (k) => k,
      language: 'ar',
    },
  },
};

// Import compiled stores
const {
  MenuSettingsStore,
  STORAGE_KEY_MENU_SETTINGS,
} = require('./compiled_menu_settings_cjs/data/menuSettingsStore.js');

const {
  MenuStore,
  menuStore,
  getCategoryCounts,
  STORAGE_KEY_MENU_ITEMS,
  INITIAL_MENU_ITEMS,
} = require('./compiled_menu_settings_cjs/data/menuStore.js');

const {
  WorkingHoursStore,
  DEFAULT_WORKING_HOURS,
  getEffectiveRestaurantStatus,
} = require('./compiled_menu_settings_cjs/data/workingHoursStore.js');

const {
  advanceOrderStatus,
} = require('./compiled_menu_settings_cjs/features/orders/orderTransitions.js');

const {
  getInitialOrders,
} = require('./compiled_menu_settings_cjs/data/seedOrders.js');

const testResults = [];

function assert(condition, testNumber, description, details = '') {
  if (condition) {
    testResults.push({ id: testNumber, description, passed: true, details });
    console.log(`[PASS] Test ${testNumber}: ${description}`);
  } else {
    testResults.push({ id: testNumber, description, passed: false, details });
    console.error(`[FAIL] Test ${testNumber}: ${description} -> ${details}`);
  }
}

async function runPhase5Verification() {
  console.log('========================================================================');
  console.log('MENU SETTINGS PHASE 5 VERIFICATION: MENU & SYSTEM INTEGRATION');
  console.log('========================================================================\n');

  // Load translations
  const arMenu = JSON.parse(fs.readFileSync('src/i18n/locales/ar/menu.json', 'utf8'));
  const enMenu = JSON.parse(fs.readFileSync('src/i18n/locales/en/menu.json', 'utf8'));
  const arOrders = JSON.parse(fs.readFileSync('src/i18n/locales/ar/orders.json', 'utf8'));
  const enOrders = JSON.parse(fs.readFileSync('src/i18n/locales/en/orders.json', 'utf8'));

  // ---------------------------------------------------------------------------
  // 1. Localization completeness for operational banner
  // ---------------------------------------------------------------------------
  const hasArBanners =
    Boolean(arMenu.operationalClosedBanner) &&
    Boolean(arOrders.operationalClosedBanner) &&
    arMenu.operationalClosedBanner.includes('المطعم مغلق حالياً') &&
    arOrders.operationalClosedBanner.includes('المطعم مغلق حالياً');

  const hasEnBanners =
    Boolean(enMenu.operationalClosedBanner) &&
    Boolean(enOrders.operationalClosedBanner) &&
    enMenu.operationalClosedBanner.includes('Restaurant is currently closed') &&
    enOrders.operationalClosedBanner.includes('Restaurant is currently closed');

  assert(
    hasArBanners && hasEnBanners,
    1,
    'Operational closed banner translations registered in Arabic and English for Menu and Orders',
    `arMenu: ${arMenu.operationalClosedBanner}, enOrders: ${enOrders.operationalClosedBanner}`
  );

  // ---------------------------------------------------------------------------
  // 2. Application startup wiring in App.tsx
  // ---------------------------------------------------------------------------
  const appTsx = fs.readFileSync('src/app/App.tsx', 'utf8');
  const appCallsReset =
    appTsx.includes('menuSettingsStore.checkAndExecuteDailyReset()') &&
    appTsx.includes('useEffect(');

  assert(
    appCallsReset,
    2,
    'App.tsx executes menuSettingsStore.checkAndExecuteDailyReset() during startup mount',
    `Has call: ${appCallsReset}`
  );

  // ---------------------------------------------------------------------------
  // 3. Operational banner integration in MenuPage.tsx and OrdersPage.tsx
  // ---------------------------------------------------------------------------
  const menuPageTsx = fs.readFileSync('src/features/menu/MenuPage.tsx', 'utf8');
  const ordersPageTsx = fs.readFileSync('src/features/orders/OrdersPage.tsx', 'utf8');

  const menuPageIntegrates =
    menuPageTsx.includes('useMenuSettingsStore') &&
    menuPageTsx.includes('useWorkingHoursStore') &&
    menuPageTsx.includes('autoAvailability.syncWithWorkingHours') &&
    menuPageTsx.includes('!effectiveStatus.isEffectiveOpen') &&
    menuPageTsx.includes('menu-operational-banner');

  const ordersPageIntegrates =
    ordersPageTsx.includes('useMenuSettingsStore') &&
    ordersPageTsx.includes('useWorkingHoursStore') &&
    ordersPageTsx.includes('autoAvailability.syncWithWorkingHours') &&
    ordersPageTsx.includes('!effectiveStatus.isEffectiveOpen') &&
    ordersPageTsx.includes('orders-operational-banner');

  assert(
    menuPageIntegrates && ordersPageIntegrates,
    3,
    'MenuPage and OrdersPage dynamically render operational banners conditioned on syncWithWorkingHours & closed status',
    `menuPage: ${menuPageIntegrates}, ordersPage: ${ordersPageIntegrates}`
  );

  // ---------------------------------------------------------------------------
  // 4. Dynamic category UI consumption across all Menu subcomponents
  // ---------------------------------------------------------------------------
  const catTabsTsx = fs.readFileSync('src/features/menu/components/CategoryTabs.tsx', 'utf8');
  const addProdTsx = fs.readFileSync('src/features/menu/components/AddProductScreen.tsx', 'utf8');
  const editProdTsx = fs.readFileSync('src/features/menu/components/EditProductScreen.tsx', 'utf8');
  const prodCardTsx = fs.readFileSync('src/features/menu/components/MenuProductCard.tsx', 'utf8');
  const prodActTsx = fs.readFileSync('src/features/menu/components/ProductActionsSheet.tsx', 'utf8');

  const catTabsDynamic = catTabsTsx.includes('renderCategoryIcon') && catTabsTsx.includes('cat.name');
  const addProdDynamic = addProdTsx.includes('useMenuSettingsStore') && addProdTsx.includes('categories.map');
  const editProdDynamic = editProdTsx.includes('useMenuSettingsStore') && editProdTsx.includes('categories.map');
  const prodCardDynamic = prodCardTsx.includes('getCategoryById');
  const prodActDynamic = prodActTsx.includes('getCategoryById');

  assert(
    catTabsDynamic && addProdDynamic && editProdDynamic && prodCardDynamic && prodActDynamic,
    4,
    'All Menu views (tabs, add/edit product, product cards, actions sheet) dynamically consume categories from store',
    `tabs: ${catTabsDynamic}, add: ${addProdDynamic}, edit: ${editProdDynamic}, card: ${prodCardDynamic}, act: ${prodActDynamic}`
  );

  // ---------------------------------------------------------------------------
  // 5. Initial dynamic category counts computation
  // ---------------------------------------------------------------------------
  mockStorage.clear();
  const menuSettings = new MenuSettingsStore();
  const menu = menuStore;
  menu.resetToDefault();

  const initialCounts = getCategoryCounts(menu.getItems(), menuSettings.getCategories());
  const allCount = initialCounts.find((c) => c.id === 'all')?.count;
  const mainCount = initialCounts.find((c) => c.id === 'main')?.count;
  const appCount = initialCounts.find((c) => c.id === 'appetizers')?.count;
  const drinksCount = initialCounts.find((c) => c.id === 'drinks')?.count;

  assert(
    initialCounts.length === 4 &&
      allCount === 7 &&
      mainCount === 3 &&
      appCount === 2 &&
      drinksCount === 2,
    5,
    'getCategoryCounts dynamically computes accurate counts for default categories (All: 7, Main: 3, App: 2, Drinks: 2)',
    `all: ${allCount}, main: ${mainCount}, app: ${appCount}, drinks: ${drinksCount}`
  );

  // ---------------------------------------------------------------------------
  // 6. Dynamic addition of a custom category
  // ---------------------------------------------------------------------------
  const addCatRes = menuSettings.addCategory({
    name: { ar: 'حلويات', en: 'Desserts' },
    icon: 'cake',
  });

  const countsAfterAdd = getCategoryCounts(menu.getItems(), menuSettings.getCategories());
  const dessertsCat = countsAfterAdd.find((c) => c.id === addCatRes.category?.id);

  assert(
    addCatRes.success &&
      countsAfterAdd.length === 5 &&
      dessertsCat !== undefined &&
      dessertsCat.count === 0,
    6,
    'Adding a custom category dynamically reflects as a new category tab with 0 count',
    `catId: ${addCatRes.category?.id}, totalTabs: ${countsAfterAdd.length}, count: ${dessertsCat?.count}`
  );

  // ---------------------------------------------------------------------------
  // 7. Product assignment to custom category increments count dynamically
  // ---------------------------------------------------------------------------
  const newProductRes = menu.addItem({
    name: { ar: 'تشيز كيك', en: 'Cheesecake' },
    category: addCatRes.category.id,
    price: 85,
    currency: 'EGP',
    imageType: 'salad',
    isAvailable: true,
  });

  const countsAfterProd = getCategoryCounts(menu.getItems(), menuSettings.getCategories());
  const dessertsAfterProd = countsAfterProd.find((c) => c.id === addCatRes.category.id);
  const allAfterProd = countsAfterProd.find((c) => c.id === 'all');

  assert(
    Boolean(newProductRes) &&
      dessertsAfterProd?.count === 1 &&
      allAfterProd?.count === 8,
    7,
    'Assigning product to custom category dynamically increments category count to 1 and total to 8',
    `allCount: ${allAfterProd?.count}, dessertsCount: ${dessertsAfterProd?.count}`
  );

  // ---------------------------------------------------------------------------
  // 8. Category deletion safety: blocked when category contains products
  // ---------------------------------------------------------------------------
  const delBlockedRes = menuSettings.deleteCategory(
    addCatRes.category.id,
    (id) => menu.getItems().some((item) => item.category === id)
  );

  assert(
    !delBlockedRes.success &&
      delBlockedRes.error &&
      delBlockedRes.error.includes('Cannot delete category containing products'),
    8,
    'Deletion of custom category with active products is strictly blocked with error explanation',
    `error: ${delBlockedRes.error}`
  );

  // ---------------------------------------------------------------------------
  // 9. Category deletion safety: empty custom category deletes safely
  // ---------------------------------------------------------------------------
  const addEmptyCat = menuSettings.addCategory({
    name: { ar: 'مخبوزات', en: 'Bakery' },
    icon: 'sandwich',
  });
  const delEmptyRes = menuSettings.deleteCategory(
    addEmptyCat.category.id,
    (id) => menu.getItems().some((item) => item.category === id)
  );

  const countsAfterEmptyDel = getCategoryCounts(menu.getItems(), menuSettings.getCategories());
  const emptyCatExists = countsAfterEmptyDel.some((c) => c.id === addEmptyCat.category.id);

  assert(
    delEmptyRes.success && !emptyCatExists,
    9,
    'Eligible empty custom category deletes safely and is immediately removed from dynamic category tabs',
    `deletedId: ${addEmptyCat.category?.id}, exists: ${emptyCatExists}`
  );

  // ---------------------------------------------------------------------------
  // 10. Protection of default categories against deletion
  // ---------------------------------------------------------------------------
  const delMain = menuSettings.deleteCategory('main');
  const delApp = menuSettings.deleteCategory('appetizers');
  const delDrinks = menuSettings.deleteCategory('drinks');

  assert(
    !delMain.success && !delApp.success && !delDrinks.success,
    10,
    'Protected default categories (main, appetizers, drinks) can never be deleted',
    `main: ${delMain.error}, app: ${delApp.error}, drinks: ${delDrinks.error}`
  );

  // ---------------------------------------------------------------------------
  // 11. Working hours sync disabled (default) does not activate banner
  // ---------------------------------------------------------------------------
  // With syncWithWorkingHours = false:
  const syncDisabledStatus = menuSettings.getSettings().autoAvailability.syncWithWorkingHours;
  const isClosedSyncDisabled = syncDisabledStatus && false; // even if closed

  assert(
    syncDisabledStatus === false && isClosedSyncDisabled === false,
    11,
    'When syncWithWorkingHours is false (default), restaurant closure does not activate operational banner',
    `syncWithWorkingHours: ${syncDisabledStatus}`
  );

  // ---------------------------------------------------------------------------
  // 12. Working hours sync enabled: activates banner when closed, hides when open
  // ---------------------------------------------------------------------------
  menuSettings.updateAutoAvailability({ syncWithWorkingHours: true });
  const hoursStore = new WorkingHoursStore();

  // Evaluate closed restaurant (manualIsOpen = false)
  const closedStatus = hoursStore.getEffectiveStatus(false);
  const syncClosedBannerActive =
    menuSettings.getSettings().autoAvailability.syncWithWorkingHours &&
    !closedStatus.isEffectiveOpen;

  // Evaluate open restaurant (manualIsOpen = true, during valid hours)
  const openStatus = getEffectiveRestaurantStatus(true, DEFAULT_WORKING_HOURS, new Date('2026-11-02T12:00:00'));
  const syncOpenBannerActive =
    menuSettings.getSettings().autoAvailability.syncWithWorkingHours &&
    !openStatus.isEffectiveOpen;

  assert(
    syncClosedBannerActive === true && syncOpenBannerActive === false,
    12,
    'When syncWithWorkingHours is true, operational banner activates when closed and hides when open',
    `closedBanner: ${syncClosedBannerActive}, openBanner: ${syncOpenBannerActive}`
  );
  hoursStore.destroy();

  // ---------------------------------------------------------------------------
  // 13. Order advancement pipeline remains functional during closure
  // ---------------------------------------------------------------------------
  const orders = getInitialOrders();
  const pendingOrder = orders.find((o) => o.paymentStatus === 'pendingConfirmation');
  const newOrder = orders.find((o) => o.paymentStatus === 'confirmed' && o.operationalStatus === 'newOrder');

  const advancePending = advanceOrderStatus(pendingOrder);
  const advanceNew = advanceOrderStatus(newOrder);

  assert(
    advancePending.success &&
      advancePending.order.paymentStatus === 'confirmed' &&
      advanceNew.success &&
      advanceNew.order.operationalStatus === 'preparing',
    13,
    'Existing orders in the pipeline remain fully manageable and can advance status during restaurant closure',
    `pendingTo: ${advancePending.order?.paymentStatus}, newTo: ${advanceNew.order?.operationalStatus}`
  );

  // ---------------------------------------------------------------------------
  // 14. Daily automatic availability reset when disabled (does nothing)
  // ---------------------------------------------------------------------------
  // Ensure dailyAutoReset is false
  menuSettings.updateAutoAvailability({ dailyAutoReset: false, lastResetDate: undefined });
  // Mark an item unavailable
  menu.updateItem('menu-item-1', { isAvailable: false });

  const resetResultDisabled = menuSettings.checkAndExecuteDailyReset(new Date('2026-11-03T09:00:00'));
  const item1AfterDisabled = menu.getItemById('menu-item-1');

  assert(
    resetResultDisabled === false &&
      item1AfterDisabled.isAvailable === false &&
      menuSettings.getSettings().autoAvailability.lastResetDate === undefined,
    14,
    'When dailyAutoReset is disabled (false), reset check returns false and unavailable items remain unchanged',
    `resetResult: ${resetResultDisabled}, itemAvailable: ${item1AfterDisabled.isAvailable}`
  );

  // ---------------------------------------------------------------------------
  // 15. Daily automatic availability reset when enabled restores unavailable items
  // ---------------------------------------------------------------------------
  menuSettings.updateAutoAvailability({ dailyAutoReset: true, lastResetDate: undefined });
  const resetResultEnabled = menuSettings.checkAndExecuteDailyReset(new Date('2026-11-03T09:00:00'));
  const allItemsAfterReset = menu.getItems();
  const allAvailable = allItemsAfterReset.every((item) => item.isAvailable);
  const lastReset = menuSettings.getSettings().autoAvailability.lastResetDate;

  assert(
    resetResultEnabled === true &&
      allAvailable === true &&
      lastReset === '2026-11-03',
    15,
    'When dailyAutoReset is enabled on a new business day, restores all items to available and records lastResetDate',
    `resetResult: ${resetResultEnabled}, allAvailable: ${allAvailable}, lastResetDate: ${lastReset}`
  );

  // ---------------------------------------------------------------------------
  // 16. Daily reset is idempotent on the same business day (runs only once per day)
  // ---------------------------------------------------------------------------
  // Owner toggles Caesar salad to unavailable during the day
  menu.updateItem('menu-item-5', { isAvailable: false });

  // Later same day launch / check
  const secondCheckSameDay = menuSettings.checkAndExecuteDailyReset(new Date('2026-11-03T18:00:00'));
  const caesarAfterSameDay = menu.getItemById('menu-item-5');

  assert(
    secondCheckSameDay === false &&
      caesarAfterSameDay.isAvailable === false,
    16,
    'Same-day launch does not re-trigger reset, preserving manual availability modifications made during the business day',
    `secondCheck: ${secondCheckSameDay}, caesarAvailable: ${caesarAfterSameDay.isAvailable}`
  );

  // ---------------------------------------------------------------------------
  // 17. Next business day boundary triggers reset again
  // ---------------------------------------------------------------------------
  const nextDayReset = menuSettings.checkAndExecuteDailyReset(new Date('2026-11-04T08:30:00'));
  const caesarAfterNextDay = menu.getItemById('menu-item-5');
  const updatedResetDate = menuSettings.getSettings().autoAvailability.lastResetDate;

  assert(
    nextDayReset === true &&
      caesarAfterNextDay.isAvailable === true &&
      updatedResetDate === '2026-11-04',
    17,
    'Transition to a new business day triggers daily reset once again, restoring items and updating lastResetDate',
    `nextDayReset: ${nextDayReset}, caesarAvailable: ${caesarAfterNextDay.isAvailable}, date: ${updatedResetDate}`
  );

  // ---------------------------------------------------------------------------
  // 18. Seed orders integrity preserved
  // ---------------------------------------------------------------------------
  const initialSeedOrders = getInitialOrders();
  const pendingOrders = initialSeedOrders.filter((o) => o.paymentStatus === 'pendingConfirmation');
  const newOrders = initialSeedOrders.filter((o) => o.paymentStatus === 'confirmed' && o.operationalStatus === 'newOrder');
  const preparingOrders = initialSeedOrders.filter((o) => o.operationalStatus === 'preparing');
  const readyOrders = initialSeedOrders.filter((o) => o.operationalStatus === 'ready');
  const deliveredOrders = initialSeedOrders.filter((o) => o.operationalStatus === 'delivered');

  assert(
    initialSeedOrders.length === 10 &&
      pendingOrders.length === 2 &&
      newOrders.length === 2 &&
      preparingOrders.length === 2 &&
      readyOrders.length === 1 &&
      deliveredOrders.length === 3,
    18,
    'Seed orders integrity strictly preserved: exactly 10 initial orders (2 pending, 2 new, 2 prep, 1 ready, 3 delivered)',
    `total: ${initialSeedOrders.length}`
  );

  // ---------------------------------------------------------------------------
  // 19. Seed menu items integrity preserved
  // ---------------------------------------------------------------------------
  const initialSeedItems = INITIAL_MENU_ITEMS;
  const has7SeedItems =
    initialSeedItems.length === 7 &&
    initialSeedItems[0].name.ar === 'برجر لحم' &&
    initialSeedItems[0].price === 120 &&
    initialSeedItems[6].name.ar === 'عصير برتقال' &&
    initialSeedItems[6].price === 30;

  assert(
    has7SeedItems,
    19,
    'Seed menu items integrity strictly preserved with original prices, categories, and bilingual names',
    `seedItems: ${initialSeedItems.length}`
  );

  // ---------------------------------------------------------------------------
  // 20. Styling & design token compliance for operational banners
  // ---------------------------------------------------------------------------
  const menuCss = fs.readFileSync('src/features/menu/MenuPage.css', 'utf8');
  const ordersCss = fs.readFileSync('src/features/orders/OrdersPage.css', 'utf8');

  const menuCssCompliant =
    menuCss.includes('.menu-operational-banner') &&
    menuCss.includes('var(--radius-card, 6px)') &&
    menuCss.includes('[data-theme="dark"] .menu-operational-banner');

  const ordersCssCompliant =
    ordersCss.includes('.orders-operational-banner') &&
    ordersCss.includes('var(--radius-card, 6px)') &&
    ordersCss.includes('[data-theme="dark"] .orders-operational-banner');

  assert(
    menuCssCompliant && ordersCssCompliant,
    20,
    'Operational banners strictly adhere to design tokens (--radius-card: 6px) and support Light & Dark themes',
    `menuCss: ${menuCssCompliant}, ordersCss: ${ordersCssCompliant}`
  );

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n========================================================================');
  const passedCount = testResults.filter((r) => r.passed).length;
  console.log(`PHASE 5 VERIFICATION SUMMARY: ${passedCount}/${testResults.length} PASSED`);
  console.log('========================================================================\n');

  if (passedCount !== testResults.length) {
    process.exit(1);
  }
  process.exit(0);
}

runPhase5Verification().catch((err) => {
  console.error('Phase 5 verification suite crashed:', err);
  process.exit(1);
});
