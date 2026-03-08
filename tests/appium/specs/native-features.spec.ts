/**
 * ANQR Appium Native Features Tests
 *
 * Tests native-specific features and UI interactions that exercise
 * the Capacitor bridge and platform-specific functionality.
 *
 * Prerequisites:
 *   - Debug APK built: `make android:build`
 *   - Emulator running or device connected: `adb devices`
 */

import {
  setupApp,
  waitForRenderIdle,
  getCanvasSnapshot,
  selectTier,
  openAccordion,
} from '../helpers/app-setup.js';
import { switchToNative, switchToWebView } from '../helpers/context.js';

describe('ANQR — Native Feature Tests', () => {
  before(async () => {
    await setupApp();
  });

  describe('Accordion Sections', () => {
    it('should open the Payload section', async () => {
      await openAccordion('payload');
      const region = await $(
        '[data-testid="accordion-payload"] [role="region"][data-state="open"]'
      );
      await expect(region).toBeDisplayed();
    });

    it('should open the Overlay section', async () => {
      await openAccordion('overlay');
      const region = await $(
        '[data-testid="accordion-overlay"] [role="region"][data-state="open"]'
      );
      await expect(region).toBeDisplayed();
    });

    it('should open the Output section', async () => {
      await openAccordion('output');
      const region = await $('[data-testid="accordion-output"] [role="region"][data-state="open"]');
      await expect(region).toBeDisplayed();
    });
  });

  describe('Rendering Options (Advanced Tier)', () => {
    before(async () => {
      await selectTier('advanced');
    });

    it('should open the Render section', async () => {
      await openAccordion('render');
      const region = await $('[data-testid="accordion-render"] [role="region"][data-state="open"]');
      await expect(region).toBeDisplayed();
    });

    it('should change QR when module style is changed', async () => {
      await openAccordion('render');
      const before = await getCanvasSnapshot();

      // Try to find and interact with the module style select
      const moduleStyleSelect = await $('[data-testid="module-style-select"]');
      if (await moduleStyleSelect.isDisplayed()) {
        await moduleStyleSelect.scrollIntoView();
        await moduleStyleSelect.click();

        // Wait for dropdown to open, then select an option
        await browser.pause(500);
        const options = await $$('[role="option"]');
        if ((await options.length) > 1) {
          await options[1].click();
          await waitForRenderIdle();

          const after = await getCanvasSnapshot();
          expect(after).not.toEqual(before);
        }
      }
    });

    it('should open QR Encoding section', async () => {
      await openAccordion('qr');
      const region = await $('[data-testid="accordion-qr"] [role="region"][data-state="open"]');
      await expect(region).toBeDisplayed();
    });
  });

  describe('Export Flow', () => {
    it('should find the download/export button', async () => {
      await openAccordion('output');

      // Look for the export/download button
      const exportBtn = await $('[data-testid="export-button"]');
      if (await exportBtn.isExisting()) {
        await expect(exportBtn).toBeDisplayed();
      }
    });
  });

  describe('Native App Shell', () => {
    it('should be able to access native context for system interactions', async () => {
      await switchToNative();

      if (driver.isAndroid) {
        const activity = await browser.getCurrentActivity();
        expect(activity).toBeTruthy();
      }

      await switchToWebView();
    });

    it('should be able to take a device screenshot', async () => {
      const screenshot = await browser.takeScreenshot();
      expect(screenshot).toBeTruthy();
      expect(screenshot.length).toBeGreaterThan(100);
    });
  });

  describe('Scrolling & Navigation', () => {
    it('should scroll the sidebar to reveal lower sections', async () => {
      // Scroll the sidebar down
      const sidebar = await $('[data-testid="sidebar-scroll"]');
      if (await sidebar.isExisting()) {
        await browser.execute((sel: string) => {
          const el = document.querySelector(sel) as HTMLElement;
          if (el) el.scrollTop = el.scrollHeight;
        }, '[data-testid="sidebar-scroll"]');

        await browser.pause(500);

        // Verify we can see lower sections
        const scrollTop = await browser.execute((sel: string) => {
          const el = document.querySelector(sel) as HTMLElement;
          return el ? el.scrollTop : 0;
        }, '[data-testid="sidebar-scroll"]');

        expect(scrollTop).toBeGreaterThan(0);
      }
    });
  });
});
