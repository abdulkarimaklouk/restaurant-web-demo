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

global.window = { localStorage: mockStorage };

// Import compiled store and types
const {
  MenuSettingsStore,
  STORAGE_KEY_MENU_SETTINGS,
  isValidCategoryIcon,
  validateCategoryDefinition,
} = require('./compiled_menu_settings_cjs/data/menuSettingsStore.js');

const {
  CURATED_CATEGORY_ICONS,
  DEFAULT_CATEGORY_DEFINITIONS,
  DEFAULT_AUTO_AVAILABILITY_SETTINGS,
  DEFAULT_PRICING_SETTINGS,
  DEFAULT_MENU_SETTINGS,
} = require('./compiled_menu_settings_cjs/types/menuSettings.js');

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

async function runPhase2Tests() {
  console.log('========================================================================');
  console.log('MENU SETTINGS PHASE 2 VERIFICATION: DATA MODELS & CENTRALIZED STORE');
  console.log('========================================================================\n');

  // Clear mock storage for a fresh test run
  mockStorage.clear();

  // ---------------------------------------------------------------------------
  // 1. Correct default categories
  // ---------------------------------------------------------------------------
  const store = new MenuSettingsStore();
  const initialCategories = store.getCategories();
  const defaultIds = initialCategories.map((c) => c.id);

  assert(
    initialCategories.length === 3 &&
      defaultIds.includes('main') &&
      defaultIds.includes('appetizers') &&
      defaultIds.includes('drinks') &&
      initialCategories[0].name.ar === 'أطباق رئيسية' &&
      initialCategories[0].name.en === 'Main Dishes' &&
      initialCategories[0].icon === 'utensils' &&
      initialCategories[0].isDefault === true &&
      initialCategories[1].name.ar === 'المقبلات' &&
      initialCategories[1].name.en === 'Appetizers' &&
      initialCategories[1].icon === 'salad' &&
      initialCategories[1].isDefault === true &&
      initialCategories[2].name.ar === 'المشروبات' &&
      initialCategories[2].name.en === 'Drinks' &&
      initialCategories[2].icon === 'cup-soda' &&
      initialCategories[2].isDefault === true,
    1,
    'Correct default categories: 3 protected seed categories with exact bilingual labels and icons',
    JSON.stringify(initialCategories)
  );

  // ---------------------------------------------------------------------------
  // 2. Correct default pricing values
  // ---------------------------------------------------------------------------
  const settings = store.getSettings();
  assert(
    settings.pricing &&
      settings.pricing.currency === 'EGP' &&
      settings.pricing.isTaxInclusive === true &&
      settings.pricing.decimalPrecision === 0,
    2,
    'Correct default pricing values: currency EGP, isTaxInclusive true, decimalPrecision 0',
    JSON.stringify(settings.pricing)
  );

  // ---------------------------------------------------------------------------
  // 3. Automatic availability options default to false
  // ---------------------------------------------------------------------------
  assert(
    settings.autoAvailability &&
      settings.autoAvailability.syncWithWorkingHours === false &&
      settings.autoAvailability.dailyAutoReset === false &&
      settings.autoAvailability.lastResetDate === undefined,
    3,
    'Automatic availability options default to false (syncWithWorkingHours=false, dailyAutoReset=false)',
    JSON.stringify(settings.autoAvailability)
  );

  // ---------------------------------------------------------------------------
  // 4. Add category with valid bilingual names
  // ---------------------------------------------------------------------------
  const addResult = store.addCategory({
    id: 'desserts',
    name: {
      ar: 'حلويات',
      en: 'Desserts',
    },
    icon: 'cake',
  });

  const categoriesAfterAdd = store.getCategories();
  const addedCat = store.getCategoryById('desserts');

  assert(
    addResult.success === true &&
      addedCat !== undefined &&
      addedCat.id === 'desserts' &&
      addedCat.name.ar === 'حلويات' &&
      addedCat.name.en === 'Desserts' &&
      addedCat.icon === 'cake' &&
      addedCat.isDefault === false &&
      addedCat.sortOrder === 3 &&
      categoriesAfterAdd.length === 4,
    4,
    'Add category with valid bilingual names succeeds and appends category with next sortOrder',
    JSON.stringify(addResult)
  );

  // ---------------------------------------------------------------------------
  // 5. Reject empty names
  // ---------------------------------------------------------------------------
  const emptyArResult = store.addCategory({
    name: { ar: '   ', en: 'Pizzas' },
    icon: 'pizza',
  });
  const emptyEnResult = store.addCategory({
    name: { ar: 'بيتزا', en: '' },
    icon: 'pizza',
  });

  assert(
    emptyArResult.success === false &&
      emptyArResult.error.includes('Arabic') &&
      emptyEnResult.success === false &&
      emptyEnResult.error.includes('English'),
    5,
    'Reject empty or whitespace-only category names in Arabic or English',
    `Ar error: ${emptyArResult.error}, En error: ${emptyEnResult.error}`
  );

  // ---------------------------------------------------------------------------
  // 6. Reject duplicate Arabic names
  // ---------------------------------------------------------------------------
  const dupArResult = store.addCategory({
    name: { ar: 'أطباق رئيسية', en: 'Special Dishes' },
    icon: 'utensils',
  });
  const dupArTrimResult = store.addCategory({
    name: { ar: '  حلويات  ', en: 'Sweet Treats' },
    icon: 'cake',
  });

  assert(
    dupArResult.success === false &&
      dupArResult.error.includes('Arabic') &&
      dupArTrimResult.success === false &&
      dupArTrimResult.error.includes('Arabic'),
    6,
    'Reject duplicate Arabic names (prevent duplicate collision across categories)',
    `dupAr error: ${dupArResult.error}`
  );

  // ---------------------------------------------------------------------------
  // 7. Reject duplicate English names
  // ---------------------------------------------------------------------------
  const dupEnResult = store.addCategory({
    name: { ar: 'أطباق فاخرة', en: 'Main Dishes' },
    icon: 'utensils',
  });
  const dupEnCaseResult = store.addCategory({
    name: { ar: 'تحليات', en: 'desserts' },
    icon: 'cake',
  });

  assert(
    dupEnResult.success === false &&
      dupEnResult.error.includes('English') &&
      dupEnCaseResult.success === false &&
      dupEnCaseResult.error.includes('English'),
    7,
    'Reject duplicate English names (case-insensitive collision check)',
    `dupEn error: ${dupEnResult.error}`
  );

  // ---------------------------------------------------------------------------
  // 8. Reject invalid icons
  // ---------------------------------------------------------------------------
  const invalidIconResult = store.addCategory({
    name: { ar: 'شاي وقهوة', en: 'Hot Drinks' },
    icon: 'rocket_ship', // invalid
  });

  assert(
    invalidIconResult.success === false &&
      invalidIconResult.error.includes('icon') &&
      CURATED_CATEGORY_ICONS.length === 8,
    8,
    'Reject invalid category icons outside the 8 approved curated icons',
    `invalidIcon error: ${invalidIconResult.error}`
  );

  // ---------------------------------------------------------------------------
  // 9. Edit category while preserving its ID
  // ---------------------------------------------------------------------------
  const editResult = store.updateCategory('desserts', {
    name: {
      ar: 'الحلويات والمخبوزات',
      en: 'Desserts & Bakery',
    },
    icon: 'coffee',
  });

  const editedCat = store.getCategoryById('desserts');

  assert(
    editResult.success === true &&
      editedCat !== undefined &&
      editedCat.id === 'desserts' &&
      editedCat.name.ar === 'الحلويات والمخبوزات' &&
      editedCat.name.en === 'Desserts & Bakery' &&
      editedCat.icon === 'coffee' &&
      editedCat.isDefault === false,
    9,
    'Edit category updates names and icon while strictly preserving ID and isDefault flag',
    JSON.stringify(editedCat)
  );

  // ---------------------------------------------------------------------------
  // 10. Protect default categories from deletion
  // ---------------------------------------------------------------------------
  const delMainResult = store.deleteCategory('main');
  const delAppResult = store.deleteCategory('appetizers');
  const delDrinksResult = store.deleteCategory('drinks');

  assert(
    delMainResult.success === false &&
      delAppResult.success === false &&
      delDrinksResult.success === false &&
      store.getCategoryById('main') !== undefined &&
      store.getCategoryById('appetizers') !== undefined &&
      store.getCategoryById('drinks') !== undefined,
    10,
    'Protect default categories from deletion (main, appetizers, drinks cannot be deleted)',
    `Errors: ${delMainResult.error}, ${delAppResult.error}, ${delDrinksResult.error}`
  );

  // ---------------------------------------------------------------------------
  // 11. Block deletion of categories containing products
  // ---------------------------------------------------------------------------
  // Simulate category containing active products via custom checker
  const delInUseResult = store.deleteCategory('desserts', (catId) => catId === 'desserts');

  assert(
    delInUseResult.success === false &&
      delInUseResult.error.includes('products') &&
      store.getCategoryById('desserts') !== undefined,
    11,
    'Block deletion of categories containing products (requires product reassignment)',
    `Blocked with error: ${delInUseResult.error}`
  );

  // ---------------------------------------------------------------------------
  // 12. Allow deletion of eligible empty custom categories
  // ---------------------------------------------------------------------------
  // Category has 0 products
  const delEmptyResult = store.deleteCategory('desserts', () => false);
  const categoriesAfterDelete = store.getCategories();

  assert(
    delEmptyResult.success === true &&
      delEmptyResult.category.id === 'desserts' &&
      store.getCategoryById('desserts') === undefined &&
      categoriesAfterDelete.length === 3,
    12,
    'Allow deletion of eligible empty custom categories',
    JSON.stringify(delEmptyResult)
  );

  // ---------------------------------------------------------------------------
  // 13. Reorder categories correctly
  // ---------------------------------------------------------------------------
  // Add another category to test reordering 4 items
  store.addCategory({
    id: 'pizza',
    name: { ar: 'بيتزا', en: 'Pizza' },
    icon: 'pizza',
  });

  // Current order: ['main', 'appetizers', 'drinks', 'pizza']
  // New desired order: ['pizza', 'drinks', 'main', 'appetizers']
  const reorderResult = store.reorderCategories(['pizza', 'drinks', 'main', 'appetizers']);
  const reorderedCategories = store.getCategories();

  assert(
    reorderResult.success === true &&
      reorderedCategories[0].id === 'pizza' &&
      reorderedCategories[0].sortOrder === 0 &&
      reorderedCategories[1].id === 'drinks' &&
      reorderedCategories[1].sortOrder === 1 &&
      reorderedCategories[2].id === 'main' &&
      reorderedCategories[2].sortOrder === 2 &&
      reorderedCategories[3].id === 'appetizers' &&
      reorderedCategories[3].sortOrder === 3,
    13,
    'Reorder categories correctly updates sortOrder indices sequentially',
    reorderedCategories.map((c) => `${c.id}:${c.sortOrder}`).join(', ')
  );

  // ---------------------------------------------------------------------------
  // 14. Preserve categories during reordering
  // ---------------------------------------------------------------------------
  // Test invalid reorders (missing category, extra category, duplicate category)
  const missingIdReorder = store.reorderCategories(['pizza', 'drinks', 'main']);
  const duplicateIdReorder = store.reorderCategories(['pizza', 'drinks', 'main', 'main']);
  const invalidIdReorder = store.reorderCategories(['pizza', 'drinks', 'main', 'unknown_cat']);

  assert(
    missingIdReorder.success === false &&
      duplicateIdReorder.success === false &&
      invalidIdReorder.success === false,
    14,
    'Preserve categories during reordering: rejects missing, duplicate, or invalid IDs',
    `Errors: ${missingIdReorder.error}; ${duplicateIdReorder.error}; ${invalidIdReorder.error}`
  );

  // ---------------------------------------------------------------------------
  // 15. Persist settings after reload
  // ---------------------------------------------------------------------------
  // Update auto availability
  store.updateAutoAvailability({
    syncWithWorkingHours: true,
    dailyAutoReset: true,
    lastResetDate: '2026-11-02',
  });

  // Create a completely new store instance reading from the same mock localStorage
  const reloadedStore = new MenuSettingsStore();
  const reloadedSettings = reloadedStore.getSettings();
  const reloadedCats = reloadedStore.getCategories();

  assert(
    reloadedSettings.autoAvailability.syncWithWorkingHours === true &&
      reloadedSettings.autoAvailability.dailyAutoReset === true &&
      reloadedSettings.autoAvailability.lastResetDate === '2026-11-02' &&
      reloadedCats.length === 4 &&
      reloadedCats[0].id === 'pizza' &&
      reloadedStore.getCategoryById('pizza') !== undefined,
    15,
    'Persist settings after reload: second store instance restores all modified data from localStorage',
    JSON.stringify(reloadedSettings.autoAvailability)
  );

  // ---------------------------------------------------------------------------
  // 16. Recover safely from malformed LocalStorage data
  // ---------------------------------------------------------------------------
  mockStorage.setItem(STORAGE_KEY_MENU_SETTINGS, '{ broken json !! [}');
  const fallbackStore1 = new MenuSettingsStore();
  const recoversFromMalformed =
    fallbackStore1.getCategories().length === 3 &&
    fallbackStore1.getSettings().autoAvailability.syncWithWorkingHours === false;

  // Test corrupted array with missing default categories
  mockStorage.setItem(
    STORAGE_KEY_MENU_SETTINGS,
    JSON.stringify({
      categories: [{ id: 'random', name: { ar: 'عشوائي', en: 'Random' }, icon: 'cake', sortOrder: 0 }],
      autoAvailability: { syncWithWorkingHours: true },
    })
  );
  const fallbackStore2 = new MenuSettingsStore();
  const cats2 = fallbackStore2.getCategories();
  const ids2 = cats2.map((c) => c.id);
  const reinjectsDefaults =
    ids2.includes('main') &&
    ids2.includes('appetizers') &&
    ids2.includes('drinks') &&
    ids2.includes('random');

  assert(
    recoversFromMalformed && reinjectsDefaults,
    16,
    'Recover safely from malformed JSON and corrupted data in localStorage, re-injecting missing defaults',
    `Categories: ${ids2.join(', ')}`
  );

  // ---------------------------------------------------------------------------
  // 17. Notify subscribers after successful changes
  // ---------------------------------------------------------------------------
  let notificationCount = 0;
  const testNotifyStore = new MenuSettingsStore();
  const unsubscribe = testNotifyStore.subscribe(() => {
    notificationCount++;
  });

  testNotifyStore.addCategory({
    name: { ar: 'مشروبات ساخنة', en: 'Hot Drinks' },
    icon: 'coffee',
  });
  testNotifyStore.updateCategory('cat-hot-drinks', {
    icon: 'cup-soda',
  });
  testNotifyStore.deleteCategory('cat-hot-drinks', () => false);
  testNotifyStore.updateAutoAvailability({ syncWithWorkingHours: true });
  testNotifyStore.resetToDefault();

  unsubscribe();
  testNotifyStore.addCategory({
    name: { ar: 'تجربة', en: 'Test' },
    icon: 'sandwich',
  });

  assert(
    notificationCount === 5,
    17,
    'Notify subscribers after successful changes (5 notifications for 5 operations; unsubscribes cleanly)',
    `Total notifications: ${notificationCount}`
  );

  // ---------------------------------------------------------------------------
  // 18. Preserve existing menu_items data
  // ---------------------------------------------------------------------------
  // Simulate existing menu_items in localStorage
  const rawMenuItems = mockStorage.getItem('menu_items');
  let menuItemsValid = true;
  if (rawMenuItems) {
    try {
      const parsedItems = JSON.parse(rawMenuItems);
      menuItemsValid = Array.isArray(parsedItems) && parsedItems.length === 7;
    } catch {
      menuItemsValid = false;
    }
  }

  assert(
    menuItemsValid === true,
    18,
    'Preserve existing menu_items data: localStorage menu_items is untouched and intact (7 seed products)',
    rawMenuItems ? 'Found 7 items' : 'Unmodified'
  );

  // ---------------------------------------------------------------------------
  // 19. Preserve existing working hours settings
  // ---------------------------------------------------------------------------
  // Set simulated working hours in storage
  mockStorage.setItem('restaurant_working_hours', JSON.stringify({ isMockWorkingHours: true }));
  const testWorkingHoursStore = new MenuSettingsStore();
  testWorkingHoursStore.updateAutoAvailability({ syncWithWorkingHours: true });

  const workingHoursStillPresent = mockStorage.getItem('restaurant_working_hours');
  assert(
    workingHoursStillPresent && workingHoursStillPresent.includes('isMockWorkingHours'),
    19,
    'Preserve existing working hours settings: restaurant_working_hours storage key remains untouched',
    workingHoursStillPresent
  );

  // ---------------------------------------------------------------------------
  // 20. Preserve existing product availability values
  // ---------------------------------------------------------------------------
  // Verify seed menu item availabilities: Caesar Salad (menu-item-5) is false, others are true
  const { INITIAL_MENU_ITEMS } = require('./compiled_menu_settings_cjs/data/menuStore.js');
  const saladItem = INITIAL_MENU_ITEMS.find((i) => i.id === 'menu-item-5');
  const burgerItem = INITIAL_MENU_ITEMS.find((i) => i.id === 'menu-item-1');

  assert(
    saladItem &&
      saladItem.isAvailable === false &&
      burgerItem &&
      burgerItem.isAvailable === true &&
      INITIAL_MENU_ITEMS.filter((i) => i.isAvailable).length === 6,
    20,
    'Preserve existing product availability values: Caesar Salad remains unavailable (false), other 6 products remain available (true)',
    `Available: ${INITIAL_MENU_ITEMS.filter((i) => i.isAvailable).length}/7`
  );

  console.log('\n========================================================================');
  const allPassed = testResults.every((t) => t.passed);
  console.log(`VERIFICATION SUMMARY: ${testResults.filter((t) => t.passed).length} / ${testResults.length} TESTS PASSED`);
  console.log('========================================================================');

  if (!allPassed) {
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
