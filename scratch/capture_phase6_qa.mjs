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
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
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
    if (this.ws) this.ws.close();
  }
}

async function capture() {
  console.log('Launching Headless Chrome...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--window-size=390,844',
    '--no-sandbox',
    'about:blank',
  ]);

  let version = null;
  for (let i = 0; i < 20; i++) {
    await sleep(300);
    try {
      version = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (version?.webSocketDebuggerUrl) break;
    } catch (e) {}
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

  const setMobileViewport = async () => {
    await pageClient.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
  };

  const setDesktopViewport = async () => {
    await pageClient.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
  };

  const setupState = async (lang, theme) => {
    // Navigate to page first
    await pageClient.send('Page.navigate', { url: TARGET_URL });
    await sleep(1500);

    // Apply storage and dom attributes
    await pageClient.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('app_language', '${lang}');
        localStorage.setItem('app_theme', '${theme}');
        document.documentElement.setAttribute('data-theme', '${theme}');
        document.documentElement.setAttribute('dir', '${lang === 'ar' ? 'rtl' : 'ltr'}');
        document.documentElement.setAttribute('lang', '${lang}');
      `,
    });

    // Re-navigate cleanly
    await pageClient.send('Page.navigate', { url: TARGET_URL });
    await sleep(1500);

    // Click Analytics tab (nav button 2)
    for (let attempt = 0; attempt < 5; attempt++) {
      const clickRes = await pageClient.send('Runtime.evaluate', {
        expression: `
          (() => {
            const buttons = document.querySelectorAll('.nav-item');
            if (buttons && buttons[2]) {
              buttons[2].click();
              return true;
            }
            return false;
          })()
        `,
        returnByValue: true,
      });

      if (clickRes.result.value) break;
      await sleep(300);
    }
    await sleep(1000);

    // Verify analytics page mounted
    const verifyRes = await pageClient.send('Runtime.evaluate', {
      expression: `
        JSON.stringify({
          hasAnalytics: !!document.querySelector('.analytics-page'),
          hasScrollEl: !!document.querySelector('.analytics-scroll-content'),
          title: document.querySelector('.analytics-header-title')?.textContent,
          theme: document.documentElement.getAttribute('data-theme'),
          dir: document.documentElement.getAttribute('dir'),
        })
      `,
      returnByValue: true,
    });
    console.log(`[STATE] ${lang.toUpperCase()} ${theme.toUpperCase()} mounted:`, verifyRes.result.value);
  };

  const scrollToTop = async () => {
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('.analytics-scroll-content');
          if (el) el.scrollTop = 0;
        })()
      `,
    });
    await sleep(600);
  };

  const scrollToBottom = async () => {
    await pageClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('.analytics-scroll-content');
          if (el) el.scrollTop = 260;
        })()
      `,
    });
    await sleep(600);
  };

  const saveScreenshot = async (filename) => {
    const shot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(outDir, filename);
    fs.writeFileSync(fullPath, Buffer.from(shot.data, 'base64'));
    console.log(`[SAVED] ${filename} (${shot.data.length} bytes base64)`);
  };

  // =========================================================================
  // 1. Arabic RTL + Light Mode
  // =========================================================================
  await setMobileViewport();
  console.log('\n--- 1. Testing Arabic RTL + Light Mode ---');
  await setupState('ar', 'light');
  await scrollToTop();
  await saveScreenshot('analytics-phase6-ar-light-top.png');
  await scrollToBottom();
  await saveScreenshot('analytics-phase6-ar-light-scrolled.png');

  // =========================================================================
  // 2. Arabic RTL + Dark Mode
  // =========================================================================
  console.log('\n--- 2. Testing Arabic RTL + Dark Mode ---');
  await setupState('ar', 'dark');
  await scrollToTop();
  await saveScreenshot('analytics-phase6-ar-dark-top.png');
  await scrollToBottom();
  await saveScreenshot('analytics-phase6-ar-dark-scrolled.png');

  // =========================================================================
  // 3. English LTR + Light Mode
  // =========================================================================
  console.log('\n--- 3. Testing English LTR + Light Mode ---');
  await setupState('en', 'light');
  await scrollToTop();
  await saveScreenshot('analytics-phase6-en-light-top.png');
  await scrollToBottom();
  await saveScreenshot('analytics-phase6-en-light-scrolled.png');

  // =========================================================================
  // 4. English LTR + Dark Mode
  // =========================================================================
  console.log('\n--- 4. Testing English LTR + Dark Mode ---');
  await setupState('en', 'dark');
  await scrollToTop();
  await saveScreenshot('analytics-phase6-en-dark-top.png');
  await scrollToBottom();
  await saveScreenshot('analytics-phase6-en-dark-scrolled.png');

  // =========================================================================
  // 5. Custom Date Range Modal
  // =========================================================================
  console.log('\n--- 5. Testing Custom Date Range Modal ---');
  await setupState('en', 'light');
  await scrollToTop();
  await pageClient.send('Runtime.evaluate', {
    expression: `
      (() => {
        const customBtn = document.querySelector('.custom-calendar-btn');
        if (customBtn) customBtn.click();
      })()
    `,
  });
  await sleep(1000);
  await saveScreenshot('analytics-phase6-custom-modal.png');

  // Close modal
  await pageClient.send('Runtime.evaluate', {
    expression: `
      (() => {
        const cancel = document.querySelector('.custom-date-cancel-btn');
        if (cancel) cancel.click();
      })()
    `,
  });
  await sleep(400);

  // =========================================================================
  // 6. Desktop Centered Shell Viewport (1280x800)
  // =========================================================================
  console.log('\n--- 6. Testing Desktop Centered Shell Viewport ---');
  await setDesktopViewport();
  await setupState('en', 'light');
  await scrollToTop();
  await saveScreenshot('analytics-phase6-desktop-centered.png');

  // Cleanup
  pageClient.close();
  client.close();
  chromeProcess.kill();
  console.log('\n========================================================================');
  console.log('ALL PHASE 6 SCREENSHOTS CAPTURED SUCCESSFULLY!');
  console.log('========================================================================');
}

capture().catch((e) => {
  console.error('Capture failed:', e);
  process.exit(1);
});
