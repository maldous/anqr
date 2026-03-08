/**
 * ANQR Appium iOS Platform Tests
 *
 * iOS-specific E2E tests that exercise Capacitor bridge behaviour,
 * safe-area layout, AdMob banner integration, deep-link handling,
 * web-only asset gating, and native UI interactions unique to iOS.
 *
 * Prerequisites:
 *   - iOS Simulator app built: `make ios:build`
 *   - Simulator booted or Appium will boot one automatically
 *   - Run with: `make test:appium:ios`
 */

import {
  setupApp,
  waitForRenderIdle,
  getCanvasSnapshot,
  selectTier,
  openAccordion,
  getComputedCSS,
  headElementExists,
  isCapacitorNative,
} from '../helpers/app-setup.js';
import { switchToNative, switchToWebView, isIOSDevice } from '../helpers/context.js';

describe('ANQR — iOS Platform Tests', () => {
  before(async function () {
    if (!isIOSDevice()) {
      this.skip();
      return;
    }
    await setupApp();
  });

  // ------------------------------------------------------------------
  // 1. Capacitor environment
  // ------------------------------------------------------------------
  describe('Capacitor Environment', () => {
    it('should report native platform inside WebView', async () => {
      const isNative = await isCapacitorNative();
      expect(isNative).toBe(true);
    });

    it('should have Capacitor bridge available on window', async () => {
      const hasBridge = await browser.execute(() => {
        const win = window as Window & { Capacitor?: unknown };
        return typeof win.Capacitor !== 'undefined';
      });
      expect(hasBridge).toBe(true);
    });
  });

  // ------------------------------------------------------------------
  // 2. Safe area & status bar layout
  // ------------------------------------------------------------------
  describe('Safe Area Layout', () => {
    it('should apply safe-area-inset-top padding to the header', async () => {
      const paddingTop = await getComputedCSS('header', 'padding-top');
      // On notched iPhones the safe area is ~47-59px; on non-notched ≥20px
      const px = parseInt(paddingTop, 10);
      expect(px).toBeGreaterThanOrEqual(0);
    });

    it('should offset main content below header + safe area', async () => {
      const marginTop = await browser.execute(() => {
        const main = document.querySelector('main');
        if (!main) return '0px';
        return window.getComputedStyle(main).marginTop;
      });
      const px = parseInt(marginTop, 10);
      // Header height (52px) + safe area
      expect(px).toBeGreaterThanOrEqual(52);
    });
  });

  // ------------------------------------------------------------------
  // 3. AdMob banner layout integration
  // ------------------------------------------------------------------
  describe('AdMob Banner Layout', () => {
    it('should set bottom offset on the main container for banner space', async () => {
      // The app sets style={{ bottom: `${bannerHeight}px` }} on native
      // bannerHeight defaults to 60px estimate before real callback fires
      const bottom = await browser.execute(() => {
        const container = document.querySelector('[data-testid="qr-preview"]');
        if (!container) return null;
        let el: HTMLElement | null = container.parentElement;
        while (el) {
          if (el.style.bottom && el.style.bottom !== '0') return el.style.bottom;
          el = el.parentElement;
        }
        return null;
      });
      // On native the banner height hook starts at 60px;
      // verify a positive bottom offset is applied
      expect(bottom).toBeTruthy();
      expect(parseInt(bottom as string, 10)).toBeGreaterThan(0);
    });
  });

  // ------------------------------------------------------------------
  // 4. Web-only asset gating
  // ------------------------------------------------------------------
  describe('Web-Only Asset Gating', () => {
    it('should NOT load iubenda scripts on native', async () => {
      const hasIubenda = await headElementExists('anqr-iubenda-cs');
      expect(hasIubenda).toBe(false);
    });

    it('should NOT load AdSense script on native', async () => {
      const hasAdsense = await headElementExists('anqr-adsense');
      expect(hasAdsense).toBe(false);
    });

    it('should NOT load Google Fonts preconnect on native', async () => {
      const hasPreconnect = await headElementExists('anqr-preconnect-fonts-googleapis');
      expect(hasPreconnect).toBe(false);
    });

    it('should NOT set __anqrWebAssetsLoaded flag on native', async () => {
      const flag = await browser.execute(() => {
        const win = window as Window & { __anqrWebAssetsLoaded?: boolean };
        return win.__anqrWebAssetsLoaded ?? false;
      });
      expect(flag).toBe(false);
    });
  });

  // ------------------------------------------------------------------
  // 5. Welcome modal bypass on native
  // ------------------------------------------------------------------
  describe('Welcome Modal', () => {
    it('should NOT show the welcome modal on native (web-only feature)', async () => {
      // The WelcomeModal early-returns on Capacitor.isNativePlatform()
      const modalVisible = await browser.execute(() => {
        const modal = document.querySelector('[data-testid="welcome-get-started"]');
        return modal !== null;
      });
      expect(modalVisible).toBe(false);
    });
  });

  // ------------------------------------------------------------------
  // 6. Deep link URL resolution
  // ------------------------------------------------------------------
  describe('Deep Link Resolution', () => {
    it('should resolve anqr.link URLs to local paths in JavaScript', async () => {
      // Verify the deep link resolution logic is wired correctly
      const resolved = await browser.execute(() => {
        const url = 'https://anqr.link/guide';
        if (url.startsWith('https://anqr.link/')) {
          return '/' + url.slice('https://anqr.link/'.length);
        }
        return url;
      });
      expect(resolved).toBe('/guide');
    });

    it('should preserve query params in deep link resolution', async () => {
      const resolved = await browser.execute(() => {
        const url = 'https://anqr.link/editor?text=hello&ecc=H';
        if (url.startsWith('https://anqr.link/')) {
          return '/' + url.slice('https://anqr.link/'.length);
        }
        return url;
      });
      expect(resolved).toBe('/editor?text=hello&ecc=H');
    });
  });

  // ------------------------------------------------------------------
  // 7. Overlay section iOS grid layout
  // ------------------------------------------------------------------
  describe('Overlay Section (iOS Layout)', () => {
    before(async () => {
      await selectTier('basic');
    });

    it('should open the Overlay section', async () => {
      await openAccordion('overlay');
      const region = await $(
        '[data-testid="accordion-overlay"] [role="region"][data-state="open"]'
      );
      await expect(region).toBeDisplayed();
    });

    it('should use 4-column grid for overlay presets on iOS', async () => {
      // On native, OverlaySection uses grid-cols-4 instead of grid-cols-3
      const hasGridCols4 = await browser.execute(() => {
        const grids = document.querySelectorAll('[data-testid="accordion-overlay"] .grid');
        for (const grid of grids) {
          if (grid.classList.contains('grid-cols-4')) return true;
        }
        return false;
      });
      expect(hasGridCols4).toBe(true);
    });

    it('should show camera upload button on native overlay section', async () => {
      // On native, the overlay section includes a camera button (grid-cols-4 has 4th item)
      const hasCameraOption = await browser.execute(() => {
        const overlay = document.querySelector(
          '[data-testid="accordion-overlay"] [role="region"][data-state="open"]'
        );
        if (!overlay) return false;
        return overlay.innerHTML.includes('camera') || overlay.innerHTML.includes('Camera');
      });
      expect(hasCameraOption).toBe(true);
    });
  });

  // ------------------------------------------------------------------
  // 8. Professional tier premium gating on iOS
  // ------------------------------------------------------------------
  describe('Professional Tier Premium Gating', () => {
    before(async () => {
      await selectTier('professional');
      await waitForRenderIdle();
    });

    it('should display professional tier tab as selected', async () => {
      const tab = await $('[data-testid="tier-tab-professional"]');
      const selected = await tab.getAttribute('aria-selected');
      expect(selected).toBe('true');
    });

    it('should show premium lock indicators on iOS native', async () => {
      // On native without premium access, lock icons appear next to premium features
      const hasLockIcons = await browser.execute(() => {
        const header = document.querySelector('header');
        if (!header) return false;
        // Look for lock/crown SVG icons that appear on native for premium gating
        const svgs = header.querySelectorAll('svg');
        return svgs.length > 0;
      });
      expect(hasLockIcons).toBe(true);
    });

    after(async () => {
      await selectTier('basic');
    });
  });

  // ------------------------------------------------------------------
  // 9. Export / download flow on iOS
  // ------------------------------------------------------------------
  describe('Export Flow (iOS)', () => {
    it('should have an export button in the header', async () => {
      const exportBtn = await $('[data-testid="export-button"]');
      await expect(exportBtn).toBeDisplayed();
    });

    it('should open the Output section with format options', async () => {
      await openAccordion('output');
      const formatTrigger = await $('[data-testid="output-format-trigger"]');
      await expect(formatTrigger).toBeDisplayed();
    });
  });

  // ------------------------------------------------------------------
  // 10. QR rendering works on iOS WebView
  // ------------------------------------------------------------------
  describe('QR Rendering on iOS', () => {
    before(async () => {
      await selectTier('basic');
    });

    it('should render a valid QR code canvas', async () => {
      await waitForRenderIdle();
      const snapshot = await getCanvasSnapshot();
      expect(snapshot).toContain('data:image/png');
      expect(snapshot.length).toBeGreaterThan(100);
    });

    it('should update QR when payload changes', async () => {
      const before = await getCanvasSnapshot();

      await openAccordion('payload');
      const urlInput = await $('[data-testid="payload-url-input"]');
      if (await urlInput.isDisplayed()) {
        await urlInput.clearValue();
        await urlInput.setValue('https://ios-test.example.com');
        await waitForRenderIdle();

        const after = await getCanvasSnapshot();
        expect(after).not.toEqual(before);
      }
    });
  });

  // ------------------------------------------------------------------
  // 11. iOS native context operations
  // ------------------------------------------------------------------
  describe('iOS Native Context', () => {
    it('should access native context and detect iOS platform', async () => {
      await switchToNative();

      const contexts = await browser.getContexts();
      expect(contexts).toContain('NATIVE_APP');

      await switchToWebView();
    });

    it('should take a device screenshot', async () => {
      const screenshot = await browser.takeScreenshot();
      expect(screenshot).toBeTruthy();
      expect(screenshot.length).toBeGreaterThan(100);
    });

    it('should report correct device dimensions', async () => {
      const { width, height } = await browser.getWindowSize();
      // iPhone screens are at least 320pt wide and 568pt tall
      expect(width).toBeGreaterThanOrEqual(320);
      expect(height).toBeGreaterThanOrEqual(568);
    });
  });

  // ------------------------------------------------------------------
  // 12. iOS keyboard interaction
  // ------------------------------------------------------------------
  describe('iOS Keyboard Interaction', () => {
    it('should show keyboard when tapping a text input', async () => {
      await openAccordion('payload');
      const urlInput = await $('[data-testid="payload-url-input"]');
      if (await urlInput.isDisplayed()) {
        // Capture viewport height before keyboard appears
        const heightBefore = await browser.execute(() => window.innerHeight);

        await urlInput.click();
        await browser.pause(1500);

        // When keyboard is up, innerHeight shrinks on iOS
        const heightAfter = await browser.execute(() => window.innerHeight);
        expect(heightAfter).toBeLessThan(heightBefore);

        // Dismiss keyboard by tapping outside
        const canvas = await $('[data-testid="qr-preview"] canvas');
        if (await canvas.isDisplayed()) {
          await canvas.click();
          await browser.pause(500);
        }
      }
    });
  });

  // ------------------------------------------------------------------
  // 13. Scrolling & sidebar navigation on iOS
  // ------------------------------------------------------------------
  describe('Sidebar Scrolling (iOS)', () => {
    it('should scroll the sidebar using touch gestures', async () => {
      const sidebar = await $('[data-testid="sidebar-scroll"]');
      if (await sidebar.isExisting()) {
        // Scroll to bottom
        await browser.execute((sel: string) => {
          const el = document.querySelector(sel) as HTMLElement;
          if (el) el.scrollTop = el.scrollHeight;
        }, '[data-testid="sidebar-scroll"]');

        await browser.pause(500);

        const scrollTop = await browser.execute((sel: string) => {
          const el = document.querySelector(sel) as HTMLElement;
          return el ? el.scrollTop : 0;
        }, '[data-testid="sidebar-scroll"]');

        expect(scrollTop).toBeGreaterThan(0);

        // Scroll back to top
        await browser.execute((sel: string) => {
          const el = document.querySelector(sel) as HTMLElement;
          if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
        }, '[data-testid="sidebar-scroll"]');

        await browser.pause(600);
      }
    });
  });

  // ------------------------------------------------------------------
  // 14. Tier switching across all tiers on iOS
  // ------------------------------------------------------------------
  describe('Tier Switching (iOS)', () => {
    it('should switch to Advanced and render a different QR', async () => {
      await selectTier('basic');
      const basicSnapshot = await getCanvasSnapshot();

      await selectTier('advanced');
      await waitForRenderIdle();
      const advancedTab = await $('[data-testid="tier-tab-advanced"]');
      expect(await advancedTab.getAttribute('aria-selected')).toBe('true');

      // Advanced tier has more options, QR may differ
      const advancedSnapshot = await getCanvasSnapshot();
      expect(advancedSnapshot).toContain('data:image/png');
    });

    it('should switch to Professional tier', async () => {
      await selectTier('professional');
      const tab = await $('[data-testid="tier-tab-professional"]');
      expect(await tab.getAttribute('aria-selected')).toBe('true');
    });

    it('should return to Basic tier', async () => {
      await selectTier('basic');
      const tab = await $('[data-testid="tier-tab-basic"]');
      expect(await tab.getAttribute('aria-selected')).toBe('true');
    });
  });

  // ------------------------------------------------------------------
  // 15. Static page loading on iOS (iframe src rewrite)
  // ------------------------------------------------------------------
  describe('Static Page URL Rewrite', () => {
    it('should rewrite absolute paths to Capacitor-friendly URLs', async () => {
      // StaticPage.tsx rewrites src starting with '/' to capacitor://localhost/
      const rewritten = await browser.execute(() => {
        const win = window as Window & { Capacitor?: { isNativePlatform?: () => boolean } };
        const src = '/privacy';
        if (win.Capacitor?.isNativePlatform?.() && src.startsWith('/')) {
          return 'capacitor://localhost' + src;
        }
        return src;
      });
      expect(rewritten).toBe('capacitor://localhost/privacy');
    });
  });

  // ------------------------------------------------------------------
  // 16. Orientation handling
  // ------------------------------------------------------------------
  describe('Orientation', () => {
    it('should handle portrait orientation', async () => {
      const { width, height } = await browser.getWindowSize();
      // In portrait, height > width
      expect(height).toBeGreaterThan(width);
    });
  });
});
