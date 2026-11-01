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
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
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
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function capture() {
  console.log('Launching Headless Chrome...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--window-size=390,844',
    '--hide-scrollbars',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank',
  ]);

  // Wait for remote debugging to be ready
  let version = null;
  for (let i = 0; i < 20; i++) {
    await sleep(300);
    try {
      version = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (version?.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!version?.webSocketDebuggerUrl) {
    throw new Error('Failed to connect to Chrome debugging port');
  }

  console.log('Connected to Chrome!');
  const client = new CdpClient(version.webSocketDebuggerUrl);
  await client.connect();

  // Create new target / page
  const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
  const targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const pageTarget = targets.find((t) => t.id === targetId) || targets[0];

  const pageClient = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await pageClient.connect();

  await pageClient.send('Page.enable');
  await pageClient.send('Runtime.enable');

  // Set device emulation for exact 390x844 phone canvas
  await pageClient.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  // Ensure output directory exists
  const outDir = path.resolve('./design/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // =========================================================================
  // 1. Arabic Light Mode Screenshot
  // =========================================================================
  console.log('\nNavigating to App (Arabic Light)...');
  await pageClient.send('Page.navigate', { url: TARGET_URL });
  await sleep(1500);

  // Set Arabic and Light theme in localStorage and reload
  await pageClient.send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('app_language', 'ar');
      localStorage.setItem('app_theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      location.reload();
    `,
  });
  await sleep(1500);

  // Click on Analytics Tab (3rd item in bottom nav)
  console.log('Switching to Analytics Tab...');
  await pageClient.send('Runtime.evaluate', {
    expression: `
      const navButtons = document.querySelectorAll('.nav-item');
      if (navButtons[2]) {
        navButtons[2].click();
      }
    `,
  });
  await sleep(1000);

  const arScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
  const arPath = path.join(outDir, 'analytics-dashboard-ar-light-390x844.png');
  fs.writeFileSync(arPath, Buffer.from(arScreenshot.data, 'base64'));
  console.log(`Saved Arabic Light screenshot: ${arPath}`);

  // =========================================================================
  // 2. English Light Mode Screenshot
  // =========================================================================
  console.log('\nSwitching to English Light Mode...');
  await pageClient.send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('app_language', 'en');
      localStorage.setItem('app_theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
      location.reload();
    `,
  });
  await sleep(1500);

  // Click on Analytics Tab
  await pageClient.send('Runtime.evaluate', {
    expression: `
      const navButtons = document.querySelectorAll('.nav-item');
      if (navButtons[2]) {
        navButtons[2].click();
      }
    `,
  });
  await sleep(1000);

  const enScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
  const enPath = path.join(outDir, 'analytics-dashboard-en-light-390x844.png');
  fs.writeFileSync(enPath, Buffer.from(enScreenshot.data, 'base64'));
  console.log(`Saved English Light screenshot: ${enPath}`);

  // =========================================================================
  // 3. Custom Date Range Modal Screenshot
  // =========================================================================
  console.log('\nOpening Custom Date Range Modal...');
  await pageClient.send('Runtime.evaluate', {
    expression: `
      const calBtn = document.querySelector('[data-testid="preset-custom-btn"]');
      if (calBtn) calBtn.click();
    `,
  });
  await sleep(500);

  const modalScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
  const modalPath = path.join(outDir, 'analytics-custom-modal-390x844.png');
  fs.writeFileSync(modalPath, Buffer.from(modalScreenshot.data, 'base64'));
  console.log(`Saved Custom Modal screenshot: ${modalPath}`);

  // Close modal
  await pageClient.send('Runtime.evaluate', {
    expression: `
      const closeBtn = document.querySelector('[data-testid="custom-range-close"]');
      if (closeBtn) closeBtn.click();
    `,
  });
  await sleep(300);

  // =========================================================================
  // 4. Arabic Dark Mode Screenshot
  // =========================================================================
  console.log('\nSwitching to Arabic Dark Mode...');
  await pageClient.send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('app_language', 'ar');
      localStorage.setItem('app_theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      location.reload();
    `,
  });
  await sleep(1500);

  await pageClient.send('Runtime.evaluate', {
    expression: `
      const navButtons = document.querySelectorAll('.nav-item');
      if (navButtons[2]) {
        navButtons[2].click();
      }
    `,
  });
  await sleep(1000);

  const darkScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
  const darkPath = path.join(outDir, 'analytics-dashboard-ar-dark-390x844.png');
  fs.writeFileSync(darkPath, Buffer.from(darkScreenshot.data, 'base64'));
  console.log(`Saved Arabic Dark screenshot: ${darkPath}`);

  // Clean up
  pageClient.close();
  client.close();
  chromeProcess.kill();
  console.log('\nScreenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
