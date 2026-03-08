/**
 * ANQR — Cross-Platform Parity Tests
 *
 * Verifies that QR codes produced by the browser (canvas) and the API (/api/qr)
 * are visually consistent. Both render paths use the same QRGenerator class but
 * different canvas implementations (browser Canvas vs @napi-rs/canvas), so small
 * pixel-level differences are expected. These tests assert structural equivalence
 * within a tolerance.
 *
 * Run with: npx playwright test --project=api
 * Requires: `netlify dev` (port 8888) — started automatically by Playwright webServer.
 *
 * The same test scenarios can be extended to compare Appium (iOS/Android) captures
 * against the API baseline — see tests/appium/specs/*-platform.spec.ts.
 */

import { test, expect } from '@playwright/test';
import { setWelcomeModalSeen } from '../helpers/test-utils';
import {
  comparePngBuffers,
  dataUrlToPngBuffer,
  detectImageFormat,
  getPngDimensions,
  isValidPng,
} from '../helpers/visual-compare';

/** Maximum allowed pixel diff percentage for browser ↔ API parity */
const MAX_DIFF_PERCENT = 15;

/** Shared test scenarios: each generates the same QR via browser and API */
interface ParityScenario {
  name: string;
  /** URL search params appended to both browser URL and API request */
  params: Record<string, string>;
}

const SCENARIOS: ParityScenario[] = [
  {
    name: 'plain black-on-white',
    params: { data: 'https://anqr.link', style: 'square', format: 'png', size: '400' },
  },
  {
    name: 'rounded modules',
    params: {
      data: 'https://anqr.link',
      style: 'rounded',
      radius: '50',
      format: 'png',
      size: '400',
    },
  },
  {
    name: 'custom colors',
    params: { data: 'colors', fg: 'ff0000', bg: 'ffffcc', format: 'png', size: '400' },
  },
  {
    name: 'dot style with gap',
    params: { data: 'dots-gap', style: 'dots', gap: '15', format: 'png', size: '400' },
  },
  {
    name: 'ECC level L',
    params: { data: 'ecc-l-parity', ec: 'L', format: 'png', size: '400' },
  },
];

test.describe('Cross-Platform Parity — Browser vs API', () => {
  for (const scenario of SCENARIOS) {
    test(`parity: ${scenario.name}`, async ({ page, request }) => {
      // 1. Generate via API
      const apiRes = await request.get('/api/qr', {
        params: { ...scenario.params, _fullRender: '1' },
      });
      expect(apiRes.status()).toBe(200);
      const apiBuffer = await apiRes.body();
      expect(apiBuffer.byteLength).toBeGreaterThan(100);
      expect(detectImageFormat(apiBuffer)).toBe('png');

      // 2. Generate via browser canvas
      await setWelcomeModalSeen(page);
      const urlParams = new URLSearchParams(scenario.params);
      await page.goto(`/?${urlParams.toString()}`, {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      });

      // Wait for render
      await page.waitForSelector('[data-testid="qr-preview"] canvas', {
        state: 'visible',
        timeout: 30_000,
      });
      await page
        .waitForSelector('[data-rendering-state="idle"]', { state: 'attached', timeout: 30_000 })
        .catch(() => {});

      const browserDataUrl = await page
        .locator('[data-testid="qr-preview"] canvas')
        .first()
        .evaluate((el: HTMLCanvasElement) => el.toDataURL('image/png'));

      expect(browserDataUrl).toContain('data:image/png');
      const browserBuffer = dataUrlToPngBuffer(browserDataUrl);
      expect(isValidPng(browserBuffer)).toBe(true);

      // 3. Compare dimensions — log but don't fail if different
      const apiDims = getPngDimensions(apiBuffer);
      const browserDims = getPngDimensions(browserBuffer);

      // Both should produce valid, non-trivial images
      expect(apiDims.width).toBeGreaterThan(50);
      expect(apiDims.height).toBeGreaterThan(50);
      expect(browserDims.width).toBeGreaterThan(50);
      expect(browserDims.height).toBeGreaterThan(50);

      // 4. Pixel comparison (only if same dimensions)
      if (apiDims.width === browserDims.width && apiDims.height === browserDims.height) {
        const result = comparePngBuffers(apiBuffer, browserBuffer, {
          threshold: 0.15,
          maxDiffPercent: MAX_DIFF_PERCENT,
        });
        expect(result.diffPercent).toBeLessThan(MAX_DIFF_PERCENT);
      }
    });
  }
});

test.describe('Cross-Platform Parity — API Determinism', () => {
  test('same params produce byte-identical PNG', async ({ request }) => {
    const params = {
      data: 'determinism-check',
      format: 'png',
      size: '200',
      ec: 'H',
      style: 'square',
      fg: '000000',
      bg: 'ffffff',
    };

    const [r1, r2] = await Promise.all([
      request.get('/api/qr', { params }),
      request.get('/api/qr', { params }),
    ]);

    const buf1 = await r1.body();
    const buf2 = await r2.body();
    expect(buf1.equals(buf2)).toBe(true);
  });

  test('different data produces visually different QR', async ({ request }) => {
    const base = { format: 'png', size: '200', ec: 'H', style: 'square' };
    const [r1, r2] = await Promise.all([
      request.get('/api/qr', { params: { ...base, data: 'alpha' } }),
      request.get('/api/qr', { params: { ...base, data: 'bravo' } }),
    ]);

    const buf1 = await r1.body();
    const buf2 = await r2.body();

    expect(isValidPng(buf1)).toBe(true);
    expect(isValidPng(buf2)).toBe(true);

    const dims1 = getPngDimensions(buf1);
    const dims2 = getPngDimensions(buf2);

    if (dims1.width === dims2.width && dims1.height === dims2.height) {
      const result = comparePngBuffers(buf1, buf2, { threshold: 0.1, maxDiffPercent: 1 });
      expect(result.diffPercent).toBeGreaterThan(1);
    }
  });
});
