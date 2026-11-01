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

  const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
  const targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const pageTarget = targets.find((t) => t.id === targetId) || targets[0];

  const pageClient = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await pageClient.connect();

  await pageClient.send('Page.enable');
  await pageClient.send('Runtime.enable');

  // Strict 390x844 mobile viewport baseline
  await pageClient.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  const outDir = path.resolve('./design/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // =========================================================================
  // 1. Arabic Light Mode - Full Top View
  // =========================================================================
  console.log('\nNavigating to App (Arabic Light)...');
  await pageClient.send('Page.navigate', { url: TARGET_URL });
  await sleep(1500);

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

  // Navigate to Analytics Tab
  await pageClient.send('Runtime.evaluate', {
    expression: `
      const navButtons = document.querySelectorAll('.nav-item');
      if (navButtons[2]) {
        navButtons[2].click();
      }
    `,
  });
  await sleep(1000);

  const arTopScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
  const arTopPath = path.join(outDir, 'analytics-phase5-full-ar-light-390x844.png');
  fs.writeFileSync(arTopPath, Buffer.from(arTopScreenshot.data, 'base64'));
  console.log(`Saved Arabic Light Full Top view: ${arTopPath}`);

  // =========================================================================
  // 2. Arabic Light Mode - Scrolled to Lower Business Performance & Insights
  // =========================================================================
  console.log('\nScrolling to Lower Performance & Insights (Arabic Light)...');
  await pageClient.send('Runtime.evaluate', {
    expression: `
      const scrollEl = document.querySelector('.analytics-scroll-content');
      if (scrollEl) {
        scrollEl.scrollTop = 280;
      }
    `,
  });
  await sleep(800);

  const arScrolledScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
  const arScrolledPath = path.join(outDir, 'analytics-phase5-scrolled-performance-ar-390x844.png');
  fs.writeFileSync(arScrolledPath, Buffer.from(arScrolledScreenshot.data, 'base64'));
  console.log(`Saved Arabic Light Scrolled Performance view: ${arScrolledPath}`);

  // =========================================================================
  // 3. English Light Mode - Scrolled to Lower Performance & Insights
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

  await pageClient.send('Runtime.evaluate', {
    expression: `
      const navButtons = document.querySelectorAll('.nav-item');
      if (navButtons[2]) {
        navButtons[2].click();
      }
    `,
  });
  await sleep(1000);

  // Scroll to show Top Selling, Orders by Status, and Insights
  await pageClient.send('Runtime.evaluate', {
    expression: `
      const scrollEl = document.querySelector('.analytics-scroll-content');
      if (scrollEl) {
        scrollEl.scrollTop = 280;
      }
    `,
  });
  await sleep(800);

  const enScrolledScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
  const enScrolledPath = path.join(outDir, 'analytics-phase5-scrolled-performance-en-390x844.png');
  fs.writeFileSync(enScrolledPath, Buffer.from(enScrolledScreenshot.data, 'base64'));
  console.log(`Saved English Light Scrolled Performance view: ${enScrolledPath}`);

  // =========================================================================
  // 4. Arabic Dark Mode - Scrolled Performance & Insights
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

  await pageClient.send('Runtime.evaluate', {
    expression: `
      const scrollEl = document.querySelector('.analytics-scroll-content');
      if (scrollEl) {
        scrollEl.scrollTop = 280;
      }
    `,
  });
  await sleep(800);

  const darkScreenshot = await pageClient.send('Page.captureScreenshot', { format: 'png' });
  const darkPath = path.join(outDir, 'analytics-phase5-ar-dark-390x844.png');
  fs.writeFileSync(darkPath, Buffer.from(darkScreenshot.data, 'base64'));
  console.log(`Saved Arabic Dark view: ${darkPath}`);

  // Cleanup
  pageClient.close();
  client.close();
  chromeProcess.kill();
  console.log('\nAll Phase 5 screenshots captured successfully!');
}

capture().catch((e) => {
  console.error('Capture failed:', e);
  process.exit(1);
});

