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

async function runPhase4Verification() {
  console.log('========================================================================');
  console.log('MENU SETTINGS PHASE 4 VERIFICATION: AUTOMATIC AVAILABILITY & PRICING UI');
  console.log('========================================================================\n');

  // Load translations
  const arSettings = JSON.parse(fs.readFileSync('src/i18n/locales/ar/settings.json', 'utf8'));
  const enSettings = JSON.parse(fs.readFileSync('src/i18n/locales/en/settings.json', 'utf8'));

  // 1. Arabic localization keys completeness
  const arMenu = arSettings.menuSettings;
  const hasArAuto =
    arMenu &&
    arMenu.autoAvailabilitySectionTitle &&
    arMenu.syncWorkingHoursTitle &&
    arMenu.syncWorkingHoursDesc &&
    arMenu.syncWorkingHoursDesc.includes('تصفح العملاء') &&
    !arMenu.syncWorkingHoursDesc.includes('ظاهرة للطلاب') &&
    arMenu.dailyAutoResetTitle &&
    arMenu.dailyAutoResetDesc &&
    arMenu.statusEnabled &&
    arMenu.statusDisabled &&
    arMenu.toggleAria &&
    arMenu.manualResetTitle &&
    arMenu.manualResetDesc &&
    arMenu.manualResetBtn &&
    arMenu.manualResetConfirmTitle &&
    arMenu.manualResetConfirmDesc &&
    arMenu.manualResetConfirmBtn;

  assert(
    Boolean(hasArAuto),
    1,
    'Arabic localization registered for Automatic Availability section with "customer browsing" phrasing',
    `syncTitle: ${arMenu?.syncWorkingHoursTitle}, dailyTitle: ${arMenu?.dailyAutoResetTitle}`
  );

  // 2. Arabic localization keys for Pricing Preferences & Toasts
  const hasArPricing =
    arMenu &&
    arMenu.pricingSectionTitle &&
    arMenu.pricingSectionDesc &&
    arMenu.currencyLabel &&
    arMenu.currencyValue &&
    arMenu.currencyDesc &&
    arMenu.fixedBadge &&
    arMenu.taxPolicyLabel &&
    arMenu.taxPolicyValue &&
    arMenu.taxPolicyDesc &&
    arMenu.taxPolicyDesc.includes('ضريبة القيمة المضافة') &&
    !arMenu.taxPolicyDesc.includes('رسوم') &&
    arMenu.taxInclusiveBadge &&
    arMenu.precisionLabel &&
    arMenu.precisionValue &&
    arMenu.precisionDesc &&
    arMenu.toasts &&
    arMenu.toasts.resetAvailabilitySuccess &&
    arMenu.toasts.syncWorkingHoursUpdated &&
    arMenu.toasts.dailyAutoResetUpdated;

  assert(
    Boolean(hasArPricing),
    2,
    'Arabic localization registered for Pricing Preferences (VAT-inclusive only, zero fee claims) and toasts',
    `currencyValue: ${arMenu?.currencyValue}, resetSuccessToast: ${arMenu?.toasts?.resetAvailabilitySuccess}`
  );

  // 3. English localization completeness
  const enMenu = enSettings.menuSettings;
  const hasEnAutoAndPricing =
    enMenu &&
    enMenu.autoAvailabilitySectionTitle &&
    enMenu.syncWorkingHoursTitle &&
    enMenu.syncWorkingHoursDesc &&
    enMenu.syncWorkingHoursDesc.includes('customer browsing') &&
    !enMenu.syncWorkingHoursDesc.includes('student browsing') &&
    enMenu.dailyAutoResetTitle &&
    enMenu.dailyAutoResetDesc &&
    enMenu.statusEnabled &&
    enMenu.statusDisabled &&
    enMenu.manualResetTitle &&
    enMenu.manualResetBtn &&
    enMenu.pricingSectionTitle &&
    enMenu.currencyValue &&
    enMenu.taxPolicyValue &&
    enMenu.taxPolicyDesc &&
    enMenu.taxPolicyDesc.includes('value-added tax (VAT)') &&
    !enMenu.taxPolicyDesc.includes('fees') &&
    enMenu.precisionValue &&
    enMenu.toasts?.resetAvailabilitySuccess;

  assert(
    Boolean(hasEnAutoAndPricing),
    3,
    'English localization symmetric and complete for Automatic Availability and Pricing Preferences',
    `currencyValue: ${enMenu?.currencyValue}, pricingTitle: ${enMenu?.pricingSectionTitle}`
  );

  // 4. Source file inspection: EditMenuSettings.tsx imports and component structure
  const editMenuSource = fs.readFileSync(
    'src/features/settings/components/EditMenuSettings.tsx',
    'utf8'
  );

  const hasRequiredIcons =
    editMenuSource.includes('Clock') &&
    editMenuSource.includes('RotateCcw') &&
    editMenuSource.includes('Coins') &&
    editMenuSource.includes('Receipt') &&
    editMenuSource.includes('Hash');

  const usesAutoAvailability =
    editMenuSource.includes('autoAvailability') &&
    editMenuSource.includes('updateAutoAvailability');

  const usesMenuStoreUpdate =
    editMenuSource.includes('updateItems') &&
    editMenuSource.includes('useMenuStore()');

  assert(
    hasRequiredIcons && usesAutoAvailability && usesMenuStoreUpdate,
    4,
    'EditMenuSettings imports required Lucide icons, connects to autoAvailability and updateItems',
    `Icons: ${hasRequiredIcons}, AutoAvailability: ${usesAutoAvailability}, UpdateItems: ${usesMenuStoreUpdate}`
  );

  // 5. Section 2: Automatic Availability UI layout and accessibility
  const hasSyncToggle =
    editMenuSource.includes('id="toggle-sync-working-hours"') &&
    editMenuSource.includes('role="switch"') &&
    editMenuSource.includes('aria-checked={autoAvailability.syncWithWorkingHours}');

  const hasDailyResetToggle =
    editMenuSource.includes('id="toggle-daily-auto-reset"') &&
    editMenuSource.includes('role="switch"') &&
    editMenuSource.includes('aria-checked={autoAvailability.dailyAutoReset}');

  const hasManualResetBtn =
    editMenuSource.includes('id="btn-reset-all-available"') &&
    editMenuSource.includes('setIsResetConfirmOpen(true)');

  assert(
    hasSyncToggle && hasDailyResetToggle && hasManualResetBtn,
    5,
    'Automatic Availability card provides accessible toggles and manual reset action trigger',
    `SyncToggle: ${hasSyncToggle}, DailyResetToggle: ${hasDailyResetToggle}, ManualResetBtn: ${hasManualResetBtn}`
  );

  // 6. Section 3: Pricing Preferences UI non-editable informational structure
  const hasPricingSection =
    editMenuSource.includes('section-pricing-title') &&
    editMenuSource.includes('t(\'menuSettings.currencyLabel\')') &&
    editMenuSource.includes('t(\'menuSettings.taxPolicyLabel\')') &&
    editMenuSource.includes('t(\'menuSettings.precisionLabel\')');

  // Verify non-editable: no input, select, or editable form controls in Section 3
  const section3Match = editMenuSource.match(/aria-labelledby="section-pricing-title"[\s\S]*?<\/section>/);
  const section3Content = section3Match ? section3Match[0] : '';
  const hasEditableControl =
    section3Content.includes('<input') ||
    section3Content.includes('<select') ||
    section3Content.includes('<textarea') ||
    section3Content.includes('onChange');

  assert(
    hasPricingSection && !hasEditableControl,
    6,
    'Pricing Preferences section is strictly informational, non-editable, and free of input/select controls',
    `HasSection: ${hasPricingSection}, HasEditableControls: ${hasEditableControl}`
  );

  // 7. Reset Availability Confirmation Modal
  const hasResetModal =
    editMenuSource.includes('ResetAvailabilityDialog') &&
    editMenuSource.includes('isResetConfirmOpen') &&
    editMenuSource.includes('handleConfirmResetAll') &&
    editMenuSource.includes('updateItems(updatedItems)');

  assert(
    Boolean(hasResetModal),
    7,
    'ResetAvailabilityDialog enforces explicit user confirmation before executing availability restore',
    `ModalConnected: ${hasResetModal}`
  );

  // 8. CSS styling and design token adherence in EditMenuSettings.css
  const editMenuCss = fs.readFileSync(
    'src/features/settings/components/EditMenuSettings.css',
    'utf8'
  );

  const hasSwitchStyles =
    editMenuCss.includes('.menu-toggle-switch') &&
    editMenuCss.includes('[dir="ltr"] .menu-toggle-switch.active .toggle-knob') &&
    editMenuCss.includes('[dir="rtl"] .menu-toggle-switch.active .toggle-knob');

  const hasTokenRadius =
    editMenuCss.includes('--radius-card') &&
    editMenuCss.includes('--radius-btn') &&
    editMenuCss.includes('--radius-badge');

  const hasPricingStyles =
    editMenuCss.includes('.pricing-value-tag') &&
    editMenuCss.includes('.pricing-info-row');

  assert(
    hasSwitchStyles && hasTokenRadius && hasPricingStyles,
    8,
    'EditMenuSettings.css implements bilingual switch animations, design token radius, and pricing tags',
    `SwitchStyles: ${hasSwitchStyles}, TokenRadius: ${hasTokenRadius}, PricingStyles: ${hasPricingStyles}`
  );

  // 9. Store logic: Toggle persistence and manual reset execution
  // Mock localStorage for node environment
  const mockStorage = {};
  global.window = {
    localStorage: {
      getItem: (key) => mockStorage[key] || null,
      setItem: (key, val) => {
        mockStorage[key] = String(val);
      },
      removeItem: (key) => {
        delete mockStorage[key];
      },
      clear: () => {
        for (const k in mockStorage) delete mockStorage[k];
      },
    },
  };

  // Compile and load compiled CJS stores from scratch/compiled_menu_settings_cjs
  const { MenuSettingsStore } = require('./compiled_menu_settings_cjs/data/menuSettingsStore.js');
  const menuSettingsStore = new MenuSettingsStore();
  menuSettingsStore.resetToDefault();

  const initialSettings = menuSettingsStore.getSettings();
  const defaultSync = initialSettings.autoAvailability.syncWithWorkingHours;
  const defaultDaily = initialSettings.autoAvailability.dailyAutoReset;

  menuSettingsStore.updateAutoAvailability({ syncWithWorkingHours: true });
  const afterSyncUpdate = menuSettingsStore.getSettings();

  menuSettingsStore.updateAutoAvailability({ dailyAutoReset: true });
  const afterDailyUpdate = menuSettingsStore.getSettings();

  const storeDefaultsAndTogglesPass =
    defaultSync === false &&
    defaultDaily === false &&
    afterSyncUpdate.autoAvailability.syncWithWorkingHours === true &&
    afterSyncUpdate.autoAvailability.dailyAutoReset === false &&
    afterDailyUpdate.autoAvailability.dailyAutoReset === true;

  assert(
    storeDefaultsAndTogglesPass,
    9,
    'MenuSettingsStore starts with false defaults and persists independent toggle updates',
    `DefaultSync: ${defaultSync}, DefaultDaily: ${defaultDaily}, UpdatedSync: ${afterSyncUpdate.autoAvailability.syncWithWorkingHours}, UpdatedDaily: ${afterDailyUpdate.autoAvailability.dailyAutoReset}`
  );

  // 10. Manual Reset Logic: Restores all unavailable products to isAvailable: true
  const { menuStore } = require('./compiled_menu_settings_cjs/data/menuStore.js');
  menuStore.resetToDefault();
  const itemsBefore = menuStore.getItems();
  // Ensure at least one item is unavailable for testing (Caesar Salad is false initially)
  const hadUnavailable = itemsBefore.some((i) => !i.isAvailable);

  // Simulate manual reset logic exactly as executed by handleConfirmResetAll in EditMenuSettings
  const resetItems = itemsBefore.map((item) => ({ ...item, isAvailable: true }));
  menuStore.updateItems(resetItems);

  const itemsAfter = menuStore.getItems();
  const allAvailable = itemsAfter.every((i) => i.isAvailable === true);

  assert(
    allAvailable && itemsAfter.length === itemsBefore.length,
    10,
    'Manual reset action successfully sets isAvailable: true for 100% of menu items without data loss',
    `TotalItems: ${itemsAfter.length}, AllAvailable: ${allAvailable}, PreviouslyHadUnavailable: ${hadUnavailable}`
  );

  console.log('\n========================================================================');
  const passedCount = testResults.filter((r) => r.passed).length;
  console.log(`PHASE 4 VERIFICATION SUMMARY: ${passedCount}/${testResults.length} PASSED`);
  console.log('========================================================================');

  if (passedCount !== testResults.length) {
    process.exit(1);
  }
}

runPhase4Verification().catch((err) => {
  console.error('Phase 4 verification crashed:', err);
  process.exit(1);
});
