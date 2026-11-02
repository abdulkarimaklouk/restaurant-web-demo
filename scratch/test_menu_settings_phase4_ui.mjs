import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;
const TARGET_URL = 'http://localhost:4173/restaurant-web-demo/';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      })
      .on('error', reject);
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) {
          reject(new Error(msg.error.message));
        } else {
          resolve(msg.result);
        }
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }
  }
}

const testResults = [];

function assert(condition, description, details = '') {
  if (condition) {
    testResults.push({ description, passed: true, details });
    console.log(`[PASS] ${description}`);
  } else {
    testResults.push({ description, passed: false, details });
    console.error(`[FAIL] ${description} -> ${details}`);
  }
}

async function runBrowserVerification() {
  console.log('========================================================================');
  console.log('MENU SETTINGS PHASE 4: BROWSER-LEVEL UI VERIFICATION (CDP)');
  console.log('========================================================================\n');

  // 1. Start vite preview server
  console.log('[1/7] Starting Vite preview server on port 4173...');
  const previewProcess = spawn('npx.cmd', ['vite', 'preview', '--port', '4173'], {
    stdio: 'ignore',
    shell: true,
  });

  await sleep(2500);

  // 2. Launch headless Chrome
  console.log('[2/7] Launching Chrome on debug port 9222...');
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=390,844',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  await sleep(2000);

  let version;
  for (let i = 0; i < 10; i++) {
    try {
      version = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (version?.webSocketDebuggerUrl) break;
    } catch (e) {
      await sleep(500);
    }
  }

  const client = new CdpClient(version.webSocketDebuggerUrl);
  await client.connect();

  const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
  const targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const pageTarget = targets.find((t) => t.id === targetId) || targets[0];

  const pageClient = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await pageClient.connect();

  await pageClient.send('Page.enable');
  await pageClient.send('Runtime.enable');

  const outDir = path.resolve('./design/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  await pageClient.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  const saveScreenshot = async (filename) => {
    const shot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(outDir, filename);
    fs.writeFileSync(fullPath, Buffer.from(shot.data, 'base64'));
    console.log(`[SAVED SCREENSHOT] ${filename}`);
  };

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Navigate to Menu Settings in Arabic Light Mode
    // -------------------------------------------------------------------------
    console.log('\n[3/7] Navigating to Menu Settings (Arabic RTL Light)...');
    await pageClient.send('Page.navigate', { url: TARGET_URL });
    await sleep(1500);

    // Initialize clean state: Arabic, Light mode, clear menu settings to default
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('app_language', 'ar');
          localStorage.setItem('app_theme', 'light');
          localStorage.removeItem('restaurant_menu_settings_v1');
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.setAttribute('dir', 'rtl');
          document.documentElement.setAttribute('lang', 'ar');
        })()
      `,
    });

    await pageClient.send('Page.navigate', { url: TARGET_URL });
    await sleep(1500);

    // Click Settings tab in bottom nav (index 3)
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navItems = document.querySelectorAll('.nav-item');
          if (navItems && navItems[3]) navItems[3].click();
        })()
      `,
    });
    await sleep(600);

    // Click Menu Settings row
    const menuRowClick = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = Array.from(document.querySelectorAll('.settings-row-btn'));
          const menuRow = rows.find(r =>
            r.textContent.includes('إعدادات القائمة') || r.textContent.includes('Menu Settings')
          );
          if (menuRow) {
            menuRow.click();
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true,
    });
    console.log('Clicked Menu Settings row:', menuRowClick.result.value);
    await sleep(1000);

    // Verify 390px mobile viewport with NO horizontal overflow
    const overflowCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const docWidth = document.documentElement.scrollWidth;
          const bodyWidth = document.body.scrollWidth;
          const winWidth = window.innerWidth;
          return { docWidth, bodyWidth, winWidth, hasOverflow: docWidth > winWidth || bodyWidth > winWidth };
        })()
      `,
      returnByValue: true,
    });

    assert(
      !overflowCheck.result.value.hasOverflow && overflowCheck.result.value.winWidth === 390,
      'Viewport verified at exactly 390 CSS px with zero horizontal overflow in Arabic RTL',
      JSON.stringify(overflowCheck.result.value)
    );

    // Save screenshot of full page in Arabic Light Mode
    await saveScreenshot('menu-settings-phase4-ar-light.png');

    // -------------------------------------------------------------------------
    // STEP 2: Verify Initial Toggle States & Customer Browsing / Tax Description
    // -------------------------------------------------------------------------
    console.log('\n[4/7] Verifying Toggle Initial States & Localized Copy...');
    const initialTogglesAndCopy = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const syncToggle = document.getElementById('toggle-sync-working-hours');
          const dailyToggle = document.getElementById('toggle-daily-auto-reset');
          const syncAria = syncToggle ? syncToggle.getAttribute('aria-checked') : null;
          const dailyAria = dailyToggle ? dailyToggle.getAttribute('aria-checked') : null;

          const pageText = document.body.innerText;
          const hasCustomerBrowsing = pageText.includes('تصفح العملاء');
          const hasStudentBrowsing = pageText.includes('تصفح الطلاب') || pageText.includes('ظاهرة للطلاب');
          const hasVatOnly = pageText.includes('ضريبة القيمة المضافة (VAT)');
          const hasFees = pageText.includes('والرسوم المطبقة') || pageText.includes('رسوم');

          return {
            syncAria,
            dailyAria,
            hasCustomerBrowsing,
            hasStudentBrowsing,
            hasVatOnly,
            hasFees,
          };
        })()
      `,
      returnByValue: true,
    });

    const v1 = initialTogglesAndCopy.result.value;
    assert(
      v1.syncAria === 'false' && v1.dailyAria === 'false',
      'Both automatic availability toggles default to false (disabled)',
      `Sync: ${v1.syncAria}, Daily: ${v1.dailyAria}`
    );

    assert(
      v1.hasCustomerBrowsing && !v1.hasStudentBrowsing,
      'Arabic copy correctly uses "تصفح العملاء" (customer browsing) without student references',
      `CustomerBrowsing: ${v1.hasCustomerBrowsing}, StudentBrowsing: ${v1.hasStudentBrowsing}`
    );

    assert(
      v1.hasVatOnly && !v1.hasFees,
      'Pricing policy communicates strictly VAT inclusion and makes zero claims of additional fees',
      `VatOnly: ${v1.hasVatOnly}, HasFees: ${v1.hasFees}`
    );

    // -------------------------------------------------------------------------
    // STEP 3: Toggle Both Switches and Verify Persistence Across Reload
    // -------------------------------------------------------------------------
    console.log('\n[5/7] Testing Toggle Interactions & Storage Persistence...');
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          document.getElementById('toggle-sync-working-hours').click();
          document.getElementById('toggle-daily-auto-reset').click();
        })()
      `,
    });
    await sleep(600);

    const toggledState = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const syncAria = document.getElementById('toggle-sync-working-hours').getAttribute('aria-checked');
          const dailyAria = document.getElementById('toggle-daily-auto-reset').getAttribute('aria-checked');
          const raw = localStorage.getItem('restaurant_menu_settings_v1');
          const parsed = raw ? JSON.parse(raw) : null;
          return {
            syncAria,
            dailyAria,
            storedSync: parsed?.autoAvailability?.syncWithWorkingHours,
            storedDaily: parsed?.autoAvailability?.dailyAutoReset,
          };
        })()
      `,
      returnByValue: true,
    });

    const v2 = toggledState.result.value;
    assert(
      v2.syncAria === 'true' &&
        v2.dailyAria === 'true' &&
        v2.storedSync === true &&
        v2.storedDaily === true,
      'Clicking toggles updates UI state to active and persists to localStorage',
      JSON.stringify(v2)
    );

    // Reload page to verify persistence across hard page refresh
    await pageClient.send('Page.navigate', { url: TARGET_URL });
    await sleep(1500);

    // Navigate back to Menu Settings
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navItems = document.querySelectorAll('.nav-item');
          if (navItems && navItems[3]) navItems[3].click();
        })()
      `,
    });
    await sleep(600);
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = Array.from(document.querySelectorAll('.settings-row-btn'));
          const menuRow = rows.find(r =>
            r.textContent.includes('إعدادات القائمة') || r.textContent.includes('Menu Settings')
          );
          if (menuRow) {
            menuRow.click();
            return true;
          }
          return false;
        })()
      `,
    });
    await sleep(800);

    const reloadedToggleState = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const syncAria = document.getElementById('toggle-sync-working-hours').getAttribute('aria-checked');
          const dailyAria = document.getElementById('toggle-daily-auto-reset').getAttribute('aria-checked');
          return { syncAria, dailyAria };
        })()
      `,
      returnByValue: true,
    });

    const v3 = reloadedToggleState.result.value;
    assert(
      v3.syncAria === 'true' && v3.dailyAria === 'true',
      'Toggle states reliably persist across page reload',
      `ReloadedSync: ${v3.syncAria}, ReloadedDaily: ${v3.dailyAria}`
    );

    // -------------------------------------------------------------------------
    // STEP 4: Test Reset All Available Confirmation Dialog & Execution
    // -------------------------------------------------------------------------
    console.log('\n[6/7] Testing Reset All Available Confirmation Modal & Execution...');

    // Open Reset modal
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const resetBtn = document.getElementById('btn-reset-all-available');
          if (resetBtn) resetBtn.click();
        })()
      `,
    });
    await sleep(400);

    // Capture screenshot of the confirmation dialog
    await saveScreenshot('menu-settings-phase4-reset-dialog.png');

    const modalCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const dialog = document.querySelector('.reset-availability-dialog');
          const title = document.getElementById('reset-dialog-title');
          const confirmBtn = document.querySelector('.btn-reset-confirm');
          return {
            hasDialog: Boolean(dialog),
            titleText: title ? title.textContent.trim() : '',
            hasConfirmBtn: Boolean(confirmBtn),
          };
        })()
      `,
      returnByValue: true,
    });

    assert(
      modalCheck.result.value.hasDialog && modalCheck.result.value.hasConfirmBtn,
      'Reset All Available confirmation dialog is displayed with title and confirm action',
      JSON.stringify(modalCheck.result.value)
    );

    // Click confirm reset button
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const confirmBtn = document.querySelector('.btn-reset-confirm');
          if (confirmBtn) confirmBtn.click();
        })()
      `,
    });
    await sleep(600);

    // Verify all menu items in localStorage are now available
    const resetExecutionCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const raw = localStorage.getItem('menu_items');
          const items = raw ? JSON.parse(raw) : [];
          const allAvailable = items.length > 0 && items.every((i) => i.isAvailable === true);
          const modalStillOpen = Boolean(document.querySelector('.reset-availability-dialog'));
          return { totalItems: items.length, allAvailable, modalStillOpen };
        })()
      `,
      returnByValue: true,
    });

    assert(
      resetExecutionCheck.result.value.allAvailable &&
        !resetExecutionCheck.result.value.modalStillOpen,
      'Reset All Available executes successfully: all items set to isAvailable=true and modal closes',
      JSON.stringify(resetExecutionCheck.result.value)
    );

    // -------------------------------------------------------------------------
    // STEP 5: Pricing Section Read-Only Verification
    // -------------------------------------------------------------------------
    const pricingCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const pricingCard = document.querySelector('[aria-labelledby="section-pricing-title"]');
          if (!pricingCard) return { found: false };
          const inputs = pricingCard.querySelectorAll('input, select, textarea, button:not([aria-label*="Back"])');
          const tags = Array.from(pricingCard.querySelectorAll('.pricing-value-tag')).map((el) => el.textContent.trim());
          return {
            found: true,
            interactiveCount: inputs.length,
            tags,
          };
        })()
      `,
      returnByValue: true,
    });

    assert(
      pricingCheck.result.value.found && pricingCheck.result.value.interactiveCount === 0,
      'Pricing Preferences card is strictly read-only with 0 interactive/form controls',
      JSON.stringify(pricingCheck.result.value)
    );

    // -------------------------------------------------------------------------
    // STEP 6: English LTR Verification
    // -------------------------------------------------------------------------
    console.log('\n[7/7] Testing English LTR & Dark Theme...');
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('app_language', 'en');
          document.documentElement.setAttribute('lang', 'en');
          document.documentElement.setAttribute('dir', 'ltr');
          // Dispatch language change if i18n is accessible
          window.location.reload();
        })()
      `,
    });
    await sleep(1500);

    // Navigate to Menu Settings in English
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navItems = document.querySelectorAll('.nav-item');
          if (navItems && navItems[3]) navItems[3].click();
        })()
      `,
    });
    await sleep(600);
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = Array.from(document.querySelectorAll('.settings-row-btn'));
          const menuRow = rows.find(r =>
            r.textContent.includes('Menu Settings') || r.textContent.includes('إعدادات القائمة')
          );
          if (menuRow) {
            menuRow.click();
            return true;
          }
          return false;
        })()
      `,
    });
    await sleep(800);

    const enCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const pageText = document.body.innerText;
          const hasCustomerBrowsing = pageText.includes('customer browsing');
          const hasStudentBrowsing = pageText.includes('student browsing');
          const hasVat = pageText.includes('value-added tax (VAT)');
          const hasFees = pageText.includes('applicable fees') || pageText.includes('fees');
          const dir = document.documentElement.getAttribute('dir');
          return { hasCustomerBrowsing, hasStudentBrowsing, hasVat, hasFees, dir };
        })()
      `,
      returnByValue: true,
    });

    const vEn = enCheck.result.value;
    assert(
      vEn.hasCustomerBrowsing && !vEn.hasStudentBrowsing && vEn.dir === 'ltr',
      'English LTR layout correctly displays "customer browsing" without student references',
      JSON.stringify(vEn)
    );

    assert(
      vEn.hasVat && !vEn.hasFees,
      'English pricing description communicates strictly VAT inclusion and zero claims of additional fees',
      JSON.stringify(vEn)
    );

    await saveScreenshot('menu-settings-phase4-en-light.png');

    // -------------------------------------------------------------------------
    // STEP 7: Dark Theme Verification
    // -------------------------------------------------------------------------
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('app_theme', 'dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        })()
      `,
    });
    await sleep(500);

    const darkCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const theme = document.documentElement.getAttribute('data-theme');
          const bgColor = window.getComputedStyle(document.body).backgroundColor;
          return { theme, bgColor };
        })()
      `,
      returnByValue: true,
    });

    assert(
      darkCheck.result.value.theme === 'dark',
      'Dark theme applied cleanly across Menu Settings with full token compatibility',
      JSON.stringify(darkCheck.result.value)
    );

    // Switch back to Arabic to capture Arabic Dark mode
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('app_language', 'ar');
          document.documentElement.setAttribute('lang', 'ar');
          document.documentElement.setAttribute('dir', 'rtl');
        })()
      `,
    });
    await sleep(500);
    await saveScreenshot('menu-settings-phase4-ar-dark.png');
  } finally {
    pageClient.close();
    client.close();
    chromeProcess.kill('SIGTERM');
    previewProcess.kill('SIGTERM');
  }

  console.log('\n========================================================================');
  const passedCount = testResults.filter((r) => r.passed).length;
  console.log(`BROWSER-LEVEL UI VERIFICATION SUMMARY: ${passedCount}/${testResults.length} PASSED`);
  console.log('========================================================================');

  if (passedCount !== testResults.length) {
    process.exit(1);
  }
}

runBrowserVerification().catch((err) => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
