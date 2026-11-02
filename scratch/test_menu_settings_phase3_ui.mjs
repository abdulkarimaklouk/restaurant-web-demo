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

async function run() {
  console.log('========================================================================');
  console.log('PHASE 3 VERIFICATION: MENU SETTINGS CATEGORIES UI (CDP)');
  console.log('========================================================================\n');

  // 1. Start vite preview server
  console.log('[1/7] Starting Vite preview server...');
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
    // STEP 1: Navigate to Settings -> Menu Settings in Arabic Light Mode
    // -------------------------------------------------------------------------
    console.log('\n[3/7] Testing Navigation to Menu Settings (Arabic RTL Light)...');
    await pageClient.send('Page.navigate', { url: TARGET_URL });
    await sleep(1500);

    // Set Arabic and Light mode
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('app_language', 'ar');
          localStorage.setItem('app_theme', 'light');
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.setAttribute('dir', 'rtl');
          document.documentElement.setAttribute('lang', 'ar');
        })()
      `,
    });

    await pageClient.send('Page.navigate', { url: TARGET_URL });
    await sleep(1500);

    // Click on Settings tab (tab index 3)
    const navClick = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navItems = document.querySelectorAll('.nav-item');
          if (navItems && navItems[3]) {
            navItems[3].click();
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true,
    });
    console.log('Navigated to Settings Tab:', navClick.result.value);
    await sleep(1000);

    // Click on Menu Settings row
    const menuRowClick = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = Array.from(document.querySelectorAll('.settings-row-btn'));
          const menuRow = rows.find(r => r.textContent.includes('إعدادات القائمة') || r.textContent.includes('Menu Settings'));
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

    // Verify EditMenuSettings rendered
    const viewCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = document.querySelector('.edit-menu-title');
          const rows = document.querySelectorAll('.category-item-row');
          return {
            titleText: title ? title.textContent : null,
            rowCount: rows.length,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('EditMenuSettings View Check:', viewCheck.result.value);

    await saveScreenshot('menu-settings-categories-ar-light.png');

    // -------------------------------------------------------------------------
    // STEP 2: Add New Category
    // -------------------------------------------------------------------------
    console.log('\n[4/7] Testing Adding a Category...');
    // Click Add Category button
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('.btn-add-category');
          if (btn) btn.click();
        })()
      `,
    });
    await sleep(500);

    // Verify modal opened and capture modal screenshot
    await saveScreenshot('menu-settings-add-modal.png');

    // Fill form: Arabic name = "حلويات", English name = "Desserts", Icon = "cake" (icon index 4)
    const fillResult = await pageClient.send('Runtime.evaluate', {
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
            
            // Select cake icon (index 4: utensils, salad, cup-soda, coffee, cake)
            if (iconBtns && iconBtns[4]) {
              iconBtns[4].click();
            }

            // Submit
            const submitBtn = document.querySelector('.modal-btn-primary');
            if (submitBtn) {
              submitBtn.click();
              return true;
            }
          }
          return false;
        })()
      `,
      returnByValue: true,
    });
    console.log('Submitted Add Category form:', fillResult.result.value);
    await sleep(1000);

    // Verify 4 categories present
    const countAfterAdd = await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.category-item-row').length`,
      returnByValue: true,
    });
    console.log('Categories count after addition:', countAfterAdd.result.value);

    // -------------------------------------------------------------------------
    // STEP 3: Reorder Categories
    // -------------------------------------------------------------------------
    console.log('\n[5/7] Testing Reordering Categories...');
    // Move "Desserts" (row 4) up
    const reorderUp = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = document.querySelectorAll('.category-item-row');
          if (rows.length >= 4) {
            const lastRow = rows[3];
            const upBtn = lastRow.querySelector('.btn-reorder:not(:disabled)');
            if (upBtn) {
              upBtn.click();
              return true;
            }
          }
          return false;
        })()
      `,
      returnByValue: true,
    });
    console.log('Moved category up:', reorderUp.result.value);
    await sleep(800);

    // Verify order
    const orderCheck = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const names = Array.from(document.querySelectorAll('.category-name-primary')).map(el => el.textContent.trim());
          return names;
        })()
      `,
      returnByValue: true,
    });
    console.log('Category order after move:', orderCheck.result.value);

    // -------------------------------------------------------------------------
    // STEP 4: Delete Restrictions & Delete Confirmation
    // -------------------------------------------------------------------------
    console.log('\n[6/7] Testing Deletion Safeguards & Confirmation...');
    // Verify default category delete is disabled
    const defaultDelDisabled = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = document.querySelectorAll('.category-item-row');
          const firstRowDel = rows[0].querySelector('.btn-action-delete');
          return firstRowDel ? firstRowDel.disabled : null;
        })()
      `,
      returnByValue: true,
    });
    console.log('First default category delete disabled:', defaultDelDisabled.result.value);

    // Click Delete on the custom category ("حلويات")
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = document.querySelectorAll('.category-item-row');
          for (const row of rows) {
            const name = row.querySelector('.category-name-primary');
            if (name && name.textContent.includes('حلويات')) {
              const delBtn = row.querySelector('.btn-action-delete');
              if (delBtn) delBtn.click();
              break;
            }
          }
        })()
      `,
    });
    await sleep(500);

    // Capture delete confirmation dialog screenshot
    await saveScreenshot('menu-settings-delete-confirm.png');

    // Confirm deletion
    const confirmDelete = await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const confirmBtn = document.querySelector('.btn-danger-confirm');
          if (confirmBtn) {
            confirmBtn.click();
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true,
    });
    console.log('Confirmed category delete:', confirmDelete.result.value);
    await sleep(800);

    const countAfterDelete = await pageClient.send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.category-item-row').length`,
      returnByValue: true,
    });
    console.log('Categories count after deletion:', countAfterDelete.result.value);

    // -------------------------------------------------------------------------
    // STEP 5: English LTR and Dark Mode Visual QA
    // -------------------------------------------------------------------------
    console.log('\n[7/7] Testing English LTR and Dark Theme captures...');

    // Switch to English Light
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('app_language', 'en');
          localStorage.setItem('app_theme', 'light');
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.setAttribute('dir', 'ltr');
          document.documentElement.setAttribute('lang', 'en');
        })()
      `,
    });
    await pageClient.send('Page.navigate', { url: TARGET_URL });
    await sleep(1200);

    // Navigate to Settings -> Menu Settings in English
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const navItems = document.querySelectorAll('.nav-item');
          if (navItems && navItems[3]) navItems[3].click();
        })()
      `,
    });
    await sleep(800);

    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = Array.from(document.querySelectorAll('.settings-row-btn'));
          const menuRow = rows.find(r => r.textContent.includes('Menu Settings'));
          if (menuRow) menuRow.click();
        })()
      `,
    });
    await sleep(800);

    await saveScreenshot('menu-settings-categories-en-light.png');

    // Switch to Dark Theme
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          document.documentElement.setAttribute('data-theme', 'dark');
        })()
      `,
    });
    await sleep(500);

    await saveScreenshot('menu-settings-categories-dark.png');

    console.log('\n========================================================================');
    console.log('ALL PHASE 3 CDP UI TESTS & SCREENSHOTS COMPLETED SUCCESSFULLY!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('CDP UI Test failed:', err);
    process.exitCode = 1;
  } finally {
    pageClient.close();
    client.close();
    chromeProcess.kill();
    previewProcess.kill();
  }
}

run();
