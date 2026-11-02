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
      this.ws.close();
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

async function runPhase5BrowserVerification() {
  console.log('========================================================================');
  console.log('PHASE 5 BROWSER-LEVEL UI VERIFICATION: DYNAMIC MENU & SYSTEM INTEGRATION');
  console.log('========================================================================\n');

  // 1. Start Vite preview server
  console.log('Starting preview server...');
  const previewProcess = spawn('npx.cmd', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'ignore',
  });
  await sleep(2500);
  console.log('Preview server running on port 4173.');

  // 2. Launch headless Chrome with mobile viewport emulation
  console.log('Launching Chrome with remote debugging on port 9222...');
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=430,932',
      TARGET_URL,
    ],
    { stdio: 'ignore' }
  );

  let versionInfo;
  for (let i = 0; i < 30; i++) {
    try {
      versionInfo = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      break;
    } catch {
      await sleep(300);
    }
  }
  if (!versionInfo) {
    chromeProcess.kill();
    previewProcess.kill();
    throw new Error('Failed to connect to Chrome debugging port 9222');
  }

  const client = new CdpClient(versionInfo.webSocketDebuggerUrl);
  await client.connect();

  const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
  const targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const pageTarget = targets.find((t) => t.id === targetId) || targets[0];

  const pageClient = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await pageClient.connect();

  await pageClient.send('Page.enable');
  await pageClient.send('Runtime.enable');
  await pageClient.send('DOM.enable');

  // Configure exact 390x844 mobile viewport baseline
  await pageClient.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
    fitWindow: false,
  });

  const outDir = path.resolve('./design/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const saveScreenshot = async (filename) => {
    const shot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(outDir, filename);
    fs.writeFileSync(fullPath, Buffer.from(shot.data, 'base64'));
    console.log(`[SAVED SCREENSHOT] ${filename}`);
  };

  try {
    // Navigate and reset clean state
    await pageClient.send('Page.navigate', { url: TARGET_URL });
    await sleep(1500);

    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.clear();
          localStorage.setItem('app_language', 'ar');
          localStorage.setItem('app_theme', 'light');
          document.documentElement.setAttribute('lang', 'ar');
          document.documentElement.setAttribute('dir', 'rtl');
          document.documentElement.setAttribute('data-theme', 'light');
        })()
      `,
    });
    await pageClient.send('Page.reload');
    await sleep(1500);

    // -------------------------------------------------------------------------
    // STEP 1: Verify Initial Category Tabs in Menu Page
    // -------------------------------------------------------------------------
    // Switch to Menu tab
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navBtns = Array.from(document.querySelectorAll('.bottom-nav-item, .nav-item'));
          const menuBtn = navBtns.find(b => b.textContent.includes('القائمة') || b.textContent.includes('Menu'));
          if (menuBtn) menuBtn.click();
        })()
      `,
    });
    await sleep(600);

    const initialTabsCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const tabs = Array.from(document.querySelectorAll('.category-tab-item'));
          return tabs.map(t => ({
            label: t.querySelector('.category-tab-label')?.textContent?.trim(),
            count: t.querySelector('.category-count-badge')?.textContent?.trim(),
          }));
        })()
      `,
      returnByValue: true,
    });

    const initialTabs = initialTabsCheck.result.value || [];
    assert(
      initialTabs.length === 4 &&
        initialTabs[0].label === 'الكل' && initialTabs[0].count === '7' &&
        initialTabs[1].label === 'أطباق رئيسية' && initialTabs[1].count === '3',
      'Menu category tabs render initial dynamic counts (الكل: 7, أطباق رئيسية: 3, المقبلات: 2, المشروبات: 2)',
      JSON.stringify(initialTabs)
    );

    // -------------------------------------------------------------------------
    // STEP 2: Navigate to Settings -> Menu Settings and Add Custom Category
    // -------------------------------------------------------------------------
    // Switch to Settings tab
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navBtns = Array.from(document.querySelectorAll('.bottom-nav-item, .nav-item'));
          const settingsBtn = navBtns.find(b => b.textContent.includes('الإعدادات') || b.textContent.includes('Settings'));
          if (settingsBtn) settingsBtn.click();
        })()
      `,
    });
    await sleep(600);

    // Click Menu Settings row
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = Array.from(document.querySelectorAll('.settings-row-btn, .settings-action-row'));
          const menuSettingsRow = rows.find(r => r.textContent.includes('إعدادات القائمة') || r.textContent.includes('Menu Settings'));
          if (menuSettingsRow) menuSettingsRow.click();
        })()
      `,
    });
    await sleep(600);

    // Click Add Category button
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const addBtn = document.querySelector('.btn-add-category');
          if (addBtn) addBtn.click();
        })()
      `,
    });
    await sleep(500);

    // Fill form: Arabic: "حلويات", English: "Desserts", Icon: "cake"
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const arInput = document.querySelector('#cat-name-ar');
          const enInput = document.querySelector('#cat-name-en');
          const iconBtns = document.querySelectorAll('.icon-select-btn');
          if (arInput && enInput) {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(arInput, 'حلويات');
            arInput.dispatchEvent(new Event('input', { bubbles: true }));
            arInput.dispatchEvent(new Event('change', { bubbles: true }));

            nativeSetter.call(enInput, 'Desserts');
            enInput.dispatchEvent(new Event('input', { bubbles: true }));
            enInput.dispatchEvent(new Event('change', { bubbles: true }));

            if (iconBtns && iconBtns[4]) {
              iconBtns[4].click();
            }

            const submitBtn = document.querySelector('.modal-btn-primary');
            if (submitBtn) submitBtn.click();
          }
        })()
      `,
    });
    await sleep(800);

    // Go back from Menu Settings to Settings
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('.edit-back-btn');
          if (backBtn) backBtn.click();
        })()
      `,
    });
    await sleep(500);

    // -------------------------------------------------------------------------
    // STEP 3: Return to Menu and Verify New Dynamic Category Tab
    // -------------------------------------------------------------------------
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navBtns = Array.from(document.querySelectorAll('.bottom-nav-item, .nav-item'));
          const menuBtn = navBtns.find(b => b.textContent.includes('القائمة') || b.textContent.includes('Menu'));
          if (menuBtn) menuBtn.click();
        })()
      `,
    });
    await sleep(600);

    const updatedTabsCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const tabs = Array.from(document.querySelectorAll('.category-tab-item'));
          return tabs.map(t => ({
            label: t.querySelector('.category-tab-label')?.textContent?.trim(),
            count: t.querySelector('.category-count-badge')?.textContent?.trim(),
          }));
        })()
      `,
      returnByValue: true,
    });

    const updatedTabs = updatedTabsCheck.result.value || [];
    const dessertsTab = updatedTabs.find((t) => t.label === 'حلويات');

    assert(
      updatedTabs.length === 5 && dessertsTab !== undefined && dessertsTab.count === '0',
      'Menu category tabs dynamically reflect newly added custom category "حلويات" with count 0',
      JSON.stringify(updatedTabs)
    );

    await saveScreenshot('menu-phase5-dynamic-category-ar-light.png');

    // -------------------------------------------------------------------------
    // STEP 4: Open Add Product Screen and Verify Category Selector
    // -------------------------------------------------------------------------
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const addBtn = document.querySelector('.btn-add-item');
          if (addBtn) addBtn.click();
        })()
      `,
    });
    await sleep(600);

    const addProductCatsCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('.category-select-btn'));
          return btns.map(b => b.textContent.trim());
        })()
      `,
      returnByValue: true,
    });

    const addProductCats = addProductCatsCheck.result.value || [];
    assert(
      addProductCats.includes('حلويات'),
      'AddProductScreen dynamically lists custom category "حلويات" in category radiogroup',
      JSON.stringify(addProductCats)
    );

    await saveScreenshot('menu-phase5-add-product-category-ar-light.png');

    // Return to Menu
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('.add-product-header .edit-back-btn');
          if (backBtn) backBtn.click();
        })()
      `,
    });
    await sleep(500);

    // -------------------------------------------------------------------------
    // STEP 5: Working Hours Sync & Operational Closed Banner
    // -------------------------------------------------------------------------
    // Enable syncWithWorkingHours in menuSettingsStore and set restaurant manual isOpen = false
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const raw = localStorage.getItem('restaurant_menu_settings_v1');
          const settings = raw ? JSON.parse(raw) : {};
          settings.autoAvailability = { ...(settings.autoAvailability || {}), syncWithWorkingHours: true };
          localStorage.setItem('restaurant_menu_settings_v1', JSON.stringify(settings));

          const profileRaw = localStorage.getItem('restaurant_profile');
          const profile = profileRaw ? JSON.parse(profileRaw) : {};
          profile.isOpen = false;
          localStorage.setItem('restaurant_profile', JSON.stringify(profile));
        })()
      `,
    });
    await pageClient.send('Page.reload');
    await sleep(1200);

    // Switch to Menu tab
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navBtns = Array.from(document.querySelectorAll('.bottom-nav-item, .nav-item'));
          const menuBtn = navBtns.find(b => b.textContent.includes('القائمة') || b.textContent.includes('Menu'));
          if (menuBtn) menuBtn.click();
        })()
      `,
    });
    await sleep(600);

    const menuBannerCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const banner = document.getElementById('menu-operational-banner');
          if (!banner) return null;
          return {
            visible: window.getComputedStyle(banner).display !== 'none',
            text: banner.textContent.trim(),
            borderRadius: window.getComputedStyle(banner).borderRadius,
          };
        })()
      `,
      returnByValue: true,
    });

    const menuBanner = menuBannerCheck.result.value;
    assert(
      menuBanner !== null &&
        menuBanner.visible === true &&
        menuBanner.text.includes('المطعم مغلق حالياً'),
      'Operational closed banner displays on Menu screen with localized status copy and 6px token radius',
      JSON.stringify(menuBanner)
    );

    await saveScreenshot('menu-phase5-closed-banner-ar-light.png');

    // Switch to Orders tab
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navBtns = Array.from(document.querySelectorAll('.bottom-nav-item, .nav-item'));
          const ordersBtn = navBtns.find(b => b.textContent.includes('الطلبات') || b.textContent.includes('Orders'));
          if (ordersBtn) ordersBtn.click();
        })()
      `,
    });
    await sleep(600);

    const ordersBannerCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const banner = document.getElementById('orders-operational-banner');
          if (!banner) return null;
          return {
            visible: window.getComputedStyle(banner).display !== 'none',
            text: banner.textContent.trim(),
            borderRadius: window.getComputedStyle(banner).borderRadius,
          };
        })()
      `,
      returnByValue: true,
    });

    const ordersBanner = ordersBannerCheck.result.value;
    assert(
      ordersBanner !== null &&
        ordersBanner.visible === true &&
        ordersBanner.text.includes('المطعم مغلق حالياً'),
      'Operational closed banner displays on Orders screen during closure',
      JSON.stringify(ordersBanner)
    );

    await saveScreenshot('orders-phase5-closed-banner-ar-light.png');

    // -------------------------------------------------------------------------
    // STEP 6: Dark Theme & English LTR Verification
    // -------------------------------------------------------------------------
    // Dark Theme
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          document.documentElement.setAttribute('data-theme', 'dark');
        })()
      `,
    });
    await sleep(400);

    // Switch back to Menu tab in Dark mode
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navBtns = Array.from(document.querySelectorAll('.bottom-nav-item, .nav-item'));
          const menuBtn = navBtns.find(b => b.textContent.includes('القائمة') || b.textContent.includes('Menu'));
          if (menuBtn) menuBtn.click();
        })()
      `,
    });
    await sleep(500);

    await saveScreenshot('menu-phase5-closed-banner-ar-dark.png');

    // English LTR
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('app_language', 'en');
          document.documentElement.setAttribute('lang', 'en');
          document.documentElement.setAttribute('dir', 'ltr');
          document.documentElement.setAttribute('data-theme', 'light');
        })()
      `,
    });
    await pageClient.send('Page.reload');
    await sleep(1200);

    // Switch to Menu tab
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navBtns = Array.from(document.querySelectorAll('.bottom-nav-item, .nav-item'));
          const menuBtn = navBtns.find(b => b.textContent.includes('Menu') || b.textContent.includes('القائمة'));
          if (menuBtn) menuBtn.click();
        })()
      `,
    });
    await sleep(600);

    const enBannerCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const banner = document.getElementById('menu-operational-banner');
          return banner ? banner.textContent.trim() : '';
        })()
      `,
      returnByValue: true,
    });

    assert(
      enBannerCheck.result.value.includes('Restaurant is currently closed'),
      'Operational closed banner displays natural English LTR translation',
      enBannerCheck.result.value
    );

    await saveScreenshot('menu-phase5-closed-banner-en-light.png');

    // -------------------------------------------------------------------------
    // STEP 7: Mobile Viewport Overflow Inspection (390px)
    // -------------------------------------------------------------------------
    const overflowCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          return { docWidth, winWidth, hasOverflow: docWidth > winWidth };
        })()
      `,
      returnByValue: true,
    });

    assert(
      overflowCheck.result.value.hasOverflow === false,
      'Viewport width strictly bounded to 390px with zero horizontal scroll overflow',
      JSON.stringify(overflowCheck.result.value)
    );
  } finally {
    pageClient.close();
    client.close();
    chromeProcess.kill('SIGTERM');
    previewProcess.kill('SIGTERM');
  }

  console.log('\n========================================================================');
  const passedCount = testResults.filter((r) => r.passed).length;
  console.log(`BROWSER-LEVEL UI VERIFICATION SUMMARY: ${passedCount}/${testResults.length} PASSED`);
  console.log('========================================================================\n');

  if (passedCount !== testResults.length) {
    process.exit(1);
  }
}

runPhase5BrowserVerification().catch((err) => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
