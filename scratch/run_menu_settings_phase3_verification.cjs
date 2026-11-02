const fs = require('fs');
const path = require('path');

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

async function runPhase3Verification() {
  console.log('========================================================================');
  console.log('MENU SETTINGS PHASE 3 VERIFICATION: CATEGORIES MANAGEMENT UI');
  console.log('========================================================================\n');

  // Load translations
  const arSettings = JSON.parse(fs.readFileSync('src/i18n/locales/ar/settings.json', 'utf8'));
  const enSettings = JSON.parse(fs.readFileSync('src/i18n/locales/en/settings.json', 'utf8'));

  // 1. Navigation activation in SettingsPage
  const settingsPageContent = fs.readFileSync('src/features/settings/SettingsPage.tsx', 'utf8');
  const hasMenuSettingsImport = settingsPageContent.includes("import { EditMenuSettings } from './components/EditMenuSettings';");
  const hasMenuSettingsState = settingsPageContent.includes('isEditingMenuSettings');
  const hasMenuSettingsRender = settingsPageContent.includes('if (isEditingMenuSettings)');
  const hasMenuSettingsClick = settingsPageContent.includes('onClick={() => setIsEditingMenuSettings(true)}');

  assert(
    hasMenuSettingsImport && hasMenuSettingsState && hasMenuSettingsRender && hasMenuSettingsClick,
    1,
    'SettingsPage replaces temporary toast notice with accessible navigation to EditMenuSettings',
    `Import: ${hasMenuSettingsImport}, State: ${hasMenuSettingsState}, Render: ${hasMenuSettingsRender}, Click: ${hasMenuSettingsClick}`
  );

  // 2. Arabic localization keys completeness
  const arMenu = arSettings.menuSettings;
  assert(
    arMenu &&
      arMenu.pageTitle === 'إعدادات القائمة' &&
      arMenu.backAria &&
      arMenu.infoCardTitle &&
      arMenu.categoriesSectionTitle &&
      arMenu.addCategoryBtn &&
      arMenu.defaultBadge === 'افتراضي' &&
      arMenu.deleteBlockedTitle &&
      arMenu.deleteConfirmTitle &&
      arMenu.toasts &&
      arMenu.toasts.addSuccess &&
      arMenu.toasts.editSuccess &&
      arMenu.toasts.deleteSuccess &&
      arMenu.toasts.reorderSuccess,
    2,
    'Complete Arabic localization registered under settings.menuSettings with natural terminology',
    JSON.stringify(arMenu?.toasts)
  );

  // 3. English localization keys completeness
  const enMenu = enSettings.menuSettings;
  assert(
    enMenu &&
      enMenu.pageTitle === 'Menu Settings' &&
      enMenu.backAria &&
      enMenu.infoCardTitle &&
      enMenu.categoriesSectionTitle &&
      enMenu.addCategoryBtn &&
      enMenu.defaultBadge === 'Default' &&
      enMenu.deleteBlockedTitle &&
      enMenu.deleteConfirmTitle &&
      enMenu.toasts &&
      enMenu.toasts.addSuccess &&
      enMenu.toasts.editSuccess &&
      enMenu.toasts.deleteSuccess &&
      enMenu.toasts.reorderSuccess,
    3,
    'Complete English localization registered under settings.menuSettings matching Arabic structure',
    JSON.stringify(enMenu?.toasts)
  );

  // 4. All 8 curated culinary icons localized
  const curatedIcons = [
    'utensils',
    'salad',
    'cup-soda',
    'coffee',
    'cake',
    'pizza',
    'sandwich',
    'layout-grid',
  ];
  const allIconsInAr = curatedIcons.every((icon) => arMenu?.icons?.[icon]);
  const allIconsInEn = curatedIcons.every((icon) => enMenu?.icons?.[icon]);

  assert(
    allIconsInAr && allIconsInEn,
    4,
    'All 8 curated culinary icons have natural labels in both Arabic and English',
    `Ar: ${allIconsInAr}, En: ${allIconsInEn}`
  );

  // 5. Component structure of EditMenuSettings.tsx
  const editMenuContent = fs.readFileSync('src/features/settings/components/EditMenuSettings.tsx', 'utf8');
  const hasStoreHooks = editMenuContent.includes('useMenuSettingsStore') && editMenuContent.includes('useMenuStore');
  const hasDemoNotice = editMenuContent.includes('demo-notice-bar');
  const hasCategoryList = editMenuContent.includes('categories-list');
  const hasReorderControls = editMenuContent.includes('reorder-controls') && editMenuContent.includes('btn-reorder');
  const hasAddModal = editMenuContent.includes('CategoryModal');
  const hasDeleteDialog = editMenuContent.includes('DeleteCategoryDialog');

  assert(
    hasStoreHooks && hasDemoNotice && hasCategoryList && hasReorderControls && hasAddModal && hasDeleteDialog,
    5,
    'EditMenuSettings composes Header, InfoBanner, CategoriesList, CategoryModal, and DeleteCategoryDialog',
    `Store: ${hasStoreHooks}, Notice: ${hasDemoNotice}, List: ${hasCategoryList}, Reorder: ${hasReorderControls}`
  );

  // 6. Default category deletion protection in UI
  const disablesDefaultDelete =
    editMenuContent.includes('disabled={cat.isDefault}') &&
    editMenuContent.includes('cat.isDefault ?');
  const showsDefaultBadge = editMenuContent.includes('cat.isDefault &&') && editMenuContent.includes('category-default-badge');

  assert(
    disablesDefaultDelete && showsDefaultBadge,
    6,
    'Default seed categories (main, appetizers, drinks) display protected badge and have deletion disabled in UI',
    `Disabled: ${disablesDefaultDelete}, Badge: ${showsDefaultBadge}`
  );

  // 7. Product-in-use deletion blocker in UI
  const checksProductCount =
    editMenuContent.includes('getProductCountForCategory') ||
    editMenuContent.includes('items.filter');
  const rendersBlockedDialog =
    editMenuContent.includes('deleteBlockedTitle') &&
    editMenuContent.includes('deleteBlockedDesc');

  assert(
    checksProductCount && rendersBlockedDialog,
    7,
    'Categories containing active products trigger informative deletion blocked modal with product count',
    `Count check: ${checksProductCount}, Blocked dialog: ${rendersBlockedDialog}`
  );

  // 8. Reordering controls in UI
  const hasMoveUp = editMenuContent.includes('handleMoveUp') && editMenuContent.includes('disabled={isFirst}');
  const hasMoveDown = editMenuContent.includes('handleMoveDown') && editMenuContent.includes('disabled={isLast}');

  assert(
    hasMoveUp && hasMoveDown,
    8,
    'Reorder controls provide Move Up and Move Down buttons with proper boundary disablement',
    `MoveUp: ${hasMoveUp}, MoveDown: ${hasMoveDown}`
  );

  // 9. Design token compliance in EditMenuSettings.css
  const editMenuCss = fs.readFileSync('src/features/settings/components/EditMenuSettings.css', 'utf8');
  const usesCardRadius = editMenuCss.includes('var(--radius-card, 6px)') || editMenuCss.includes('var(--radius-card)');
  const usesBtnRadius = editMenuCss.includes('var(--radius-btn, 5px)') || editMenuCss.includes('var(--radius-btn)');
  const usesBadgeRadius = editMenuCss.includes('var(--radius-badge, 4px)') || editMenuCss.includes('var(--radius-badge)');
  const usesDarkTokens = editMenuCss.includes('[data-theme="dark"]');
  const usesRtlRules = editMenuCss.includes('[dir="rtl"]');

  assert(
    usesCardRadius && usesBtnRadius && usesBadgeRadius && usesDarkTokens && usesRtlRules,
    9,
    'Styling strictly complies with design tokens (--radius-card, --radius-btn, --radius-badge) and dual-theme rules',
    `CardRadius: ${usesCardRadius}, BtnRadius: ${usesBtnRadius}, BadgeRadius: ${usesBadgeRadius}, Dark: ${usesDarkTokens}, RTL: ${usesRtlRules}`
  );

  // 10. Viewport safety (no horizontal overflow)
  const hasOverflowHidden = editMenuCss.includes('overflow-x: hidden') && editMenuCss.includes('min-width: 0');
  assert(
    hasOverflowHidden,
    10,
    'Viewport bounded for mobile 390px baseline with strict overflow-x: hidden and min-width: 0',
    `Overflow bounds: ${hasOverflowHidden}`
  );

  console.log('\n========================================================================');
  const allPassed = testResults.every((t) => t.passed);
  console.log(`VERIFICATION SUMMARY: ${testResults.filter((t) => t.passed).length} / ${testResults.length} TESTS PASSED`);
  console.log('========================================================================');

  if (!allPassed) {
    process.exit(1);
  }
}

runPhase3Verification().catch((err) => {
  console.error('Phase 3 verification failed:', err);
  process.exit(1);
});

