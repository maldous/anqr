#!/usr/bin/env node

/**
 * App Store Screenshot Generator
 *
 * Generates iOS App Store screenshots using Playwright at the exact device
 * dimensions required by Apple. Captures multiple screens showing key features.
 *
 * Run with: node scripts/generate-appstore-screenshots.mjs
 *
 * Prerequisites:
 * - npx playwright install chromium
 * - Dev server running on :5173 (or set SCREENSHOT_PORT)
 */

import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const SCREENSHOTS_DIR = join(projectRoot, 'ios', 'App', 'fastlane', 'screenshots', 'en-US');

const PORT = process.env.SCREENSHOT_PORT || '5173';
const BASE_URL = `http://localhost:${PORT}`;

const WELCOME_STORAGE_KEY = 'anqr-welcome-seen';
const WELCOME_VERSION = '2026.02.01';

/**
 * iOS device definitions — viewport (CSS px) + deviceScaleFactor to produce
 * the exact pixel dimensions Apple requires.
 */
const DEVICES = [
  {
    id: '6.9',
    label: '6.9" iPhone',
    viewport: { width: 440, height: 956 },
    dpr: 3,
    pixels: '1320x2868',
  },
  {
    id: '6.7',
    label: '6.7" iPhone',
    viewport: { width: 430, height: 932 },
    dpr: 3,
    pixels: '1290x2796',
  },
  {
    id: '6.5',
    label: '6.5" iPhone',
    viewport: { width: 414, height: 896 },
    dpr: 3,
    pixels: '1242x2688',
  },
  {
    id: '5.5',
    label: '5.5" iPhone',
    viewport: { width: 414, height: 736 },
    dpr: 3,
    pixels: '1242x2208',
  },
  {
    id: 'ipad',
    label: '12.9" iPad',
    viewport: { width: 1024, height: 1366 },
    dpr: 2,
    pixels: '2048x2732',
  },
];

/**
 * Scenes to capture — each shows a different feature of the app.
 * The `setup` function configures the page state before capture.
 */
const SCENES = [
  {
    name: '01_qr_generator',
    title: 'QR Code Generator',
    setup: async (page) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
      await waitForCanvasReady(page);
      await page.waitForTimeout(1500);
    },
  },
  {
    name: '02_url_payload',
    title: 'URL QR Code',
    setup: async (page) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
      await waitForCanvasReady(page);
      const input = page.locator('input[type="url"], input[type="text"], textarea').first();
      if (await input.isVisible()) {
        await input.fill('https://anqr.link');
        await page.waitForTimeout(2000);
      }
    },
  },
  {
    name: '03_wifi_payload',
    title: 'WiFi QR Code',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/?type=wifi`, { waitUntil: 'networkidle', timeout: 60_000 });
      await waitForCanvasReady(page);
      await page.waitForTimeout(1500);
    },
  },
  {
    name: '04_gallery',
    title: 'Gallery',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/gallery`, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(2000);
    },
  },
  {
    name: '05_styling',
    title: 'Styling Options',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/?fg=%23e11d48&bg=%23fdf2f8&eye=rounded&module=rounded`, {
        waitUntil: 'networkidle',
        timeout: 60_000,
      });
      await waitForCanvasReady(page);
      await page.waitForTimeout(1500);
    },
  },
  {
    name: '06_analyze',
    title: 'Scan Safety',
    setup: async (page) => {
      await page.goto(`${BASE_URL}/analyze`, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(2000);
    },
  },
  {
    name: '07_gradient',
    title: 'Gradient QR Code',
    setup: async (page) => {
      await page.goto(
        `${BASE_URL}/?fg=%232563eb&bg=%23f8fafc&eye=rounded&module=dots&grad=linear&gs=0%3A%232563eb%2C1%3A%239333ea&ga=135`,
        { waitUntil: 'networkidle', timeout: 60_000 }
      );
      await waitForCanvasReady(page);
      await page.waitForTimeout(1500);
    },
  },
];

async function waitForCanvasReady(page, timeout = 30_000) {
  try {
    await page.waitForSelector('canvas', { timeout });
    await page.waitForFunction(
      () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 0) return true;
        }
        return false;
      },
      { timeout }
    );
  } catch (err) {
    console.log(`    ⚠️  Canvas not ready (${err.name}), capturing as-is`);
  }
}

async function captureScene(browser, device, scene) {
  const context = await browser.newContext({
    viewport: device.viewport,
    deviceScaleFactor: device.dpr,
    isMobile: device.id !== 'ipad',
    hasTouch: true,
    colorScheme: 'light',
  });

  await context.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    { key: WELCOME_STORAGE_KEY, value: WELCOME_VERSION }
  );

  const page = await context.newPage();

  try {
    await scene.setup(page);
  } catch (err) {
    console.log(`    ⚠️  Scene setup error: ${err.message}`);
  }

  const filename = `${device.id}_${scene.name}.png`;
  const filepath = join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, type: 'png' });

  await context.close();
  return filename;
}

async function main() {
  console.log('\n=== ANQR App Store Screenshot Generator ===\n');
  console.log(`Server: ${BASE_URL}`);
  console.log(`Output: ${SCREENSHOTS_DIR}\n`);

  await mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let total = 0;

  try {
    for (const device of DEVICES) {
      console.log(`📱 ${device.label} (${device.pixels}):`);
      for (const scene of SCENES) {
        const filename = await captureScene(browser, device, scene);
        console.log(`  ✅ ${scene.title} → ${filename}`);
        total++;
      }
      console.log('');
    }
  } finally {
    await browser.close();
  }

  console.log(`🎉 Generated ${total} App Store screenshots!\n`);
  console.log('Upload to App Store Connect via:');
  console.log('  fastlane deliver --skip_binary_upload --skip_metadata\n');
}

main().catch((err) => {
  console.error('❌ Error generating screenshots:', err);
  process.exit(1);
});
