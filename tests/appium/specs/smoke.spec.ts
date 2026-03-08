/**
 * ANQR Appium Smoke Tests
 *
 * Verifies the app launches correctly on a real device/emulator,
 * the WebView loads, and basic QR generation works.
 *
 * Prerequisites:
 *   - Debug APK built: `make android:build`
 *   - Emulator running or device connected: `adb devices`
 *   - Appium server or managed by @wdio/appium-service
 */

import {
  setupApp,
  waitForRenderIdle,
  getCanvasSnapshot,
  selectTier,
} from '../helpers/app-setup.js';
import { switchToWebView, switchToNative, isInWebView } from '../helpers/context.js';

describe('ANQR — Smoke Tests', () => {
  before(async () => {
    await setupApp();
  });

  describe('App Launch', () => {
    it('should switch to WebView context', async () => {
      const inWebView = await isInWebView();
      expect(inWebView).toBe(true);
    });

    it('should display the QR preview canvas', async () => {
      const canvas = await $('[data-testid="qr-preview"] canvas');
      await expect(canvas).toBeDisplayed();
    });

    it('should show the tier tabs', async () => {
      const tabs = await $('[data-testid="tier-tabs"]');
      await expect(tabs).toBeDisplayed();
    });

    it('should show the sidebar with accordion sections', async () => {
      const sidebar = await $('aside');
      await expect(sidebar).toBeDisplayed();
    });
  });

  describe('QR Generation', () => {
    it('should render a QR code on initial load', async () => {
      await waitForRenderIdle();
      const snapshot = await getCanvasSnapshot();
      expect(snapshot).toContain('data:image/png');
      expect(snapshot.length).toBeGreaterThan(100);
    });

    it('should change QR when payload text is modified', async () => {
      const before = await getCanvasSnapshot();

      // Open the Payload section and find the URL input
      const payloadTrigger = await $('[data-testid="accordion-payload"] button[data-state]');
      const state = await payloadTrigger.getAttribute('data-state');
      if (state !== 'open') {
        await payloadTrigger.scrollIntoView();
        await payloadTrigger.click();
      }

      // Find the input and change the URL
      const urlInput = await $('[data-testid="payload-url-input"]');
      if (await urlInput.isDisplayed()) {
        await urlInput.clearValue();
        await urlInput.setValue('https://appium-test.example.com');
        await waitForRenderIdle();

        const after = await getCanvasSnapshot();
        expect(after).not.toEqual(before);
      }
    });
  });

  describe('Tier Navigation', () => {
    it('should switch to Advanced tier', async () => {
      await selectTier('advanced');
      const tab = await $('[data-testid="tier-tab-advanced"]');
      const selected = await tab.getAttribute('aria-selected');
      expect(selected).toBe('true');
    });

    it('should switch to Professional tier', async () => {
      await selectTier('professional');
      const tab = await $('[data-testid="tier-tab-professional"]');
      const selected = await tab.getAttribute('aria-selected');
      expect(selected).toBe('true');
    });

    it('should switch back to Basic tier', async () => {
      await selectTier('basic');
      const tab = await $('[data-testid="tier-tab-basic"]');
      const selected = await tab.getAttribute('aria-selected');
      expect(selected).toBe('true');
    });
  });

  describe('Context Switching', () => {
    it('should switch to native context and back', async () => {
      await switchToNative();
      const inWebView = await isInWebView();
      expect(inWebView).toBe(false);

      await switchToWebView();
      const backInWebView = await isInWebView();
      expect(backInWebView).toBe(true);
    });
  });
});
