/**
 * App Setup Helpers for ANQR Appium Tests
 *
 * Handles splash screen waiting, welcome modal dismissal,
 * and initial app readiness checks.
 */

import { switchToWebView } from './context.js';

/** localStorage key matching src/components/WelcomeModal.tsx */
const WELCOME_MODAL_STORAGE_KEY = 'anqr-welcome-seen';
const WELCOME_MODAL_VERSION = '2026.02.01';

/**
 * Wait for the app to launch, switch to WebView, and dismiss the welcome modal.
 * Call this in a `before` or `beforeEach` hook.
 */
export async function setupApp(): Promise<void> {
  // Wait for splash screen to finish (Capacitor SplashScreen: 2000ms)
  await browser.pause(3000);

  // Switch to the WebView context
  await switchToWebView();

  // Dismiss the welcome modal by setting localStorage
  await browser.execute(
    (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
    WELCOME_MODAL_STORAGE_KEY,
    WELCOME_MODAL_VERSION
  );

  // Reload to apply the localStorage change (modal won't show)
  await browser.refresh();

  // Wait for the app to be interactive
  await waitForAppReady();
}

/**
 * Wait for the QR preview canvas to be visible, indicating the app is loaded.
 */
export async function waitForAppReady(): Promise<void> {
  const canvas = await $('[data-testid="qr-preview"] canvas');
  await canvas.waitForDisplayed({ timeout: 30_000 });
}

/**
 * Wait for the QR render to complete (idle state).
 */
export async function waitForRenderIdle(): Promise<void> {
  await browser.waitUntil(
    async () => {
      const el = await $('[data-testid="qr-preview"]');
      const state = await el.getAttribute('data-rendering-state');
      return state === 'idle';
    },
    { timeout: 30_000, interval: 200, timeoutMsg: 'Render did not reach idle state' }
  );
}

/**
 * Get the canvas data URL for snapshot comparison.
 */
export async function getCanvasSnapshot(): Promise<string> {
  await waitForRenderIdle();
  const dataUrl = await browser.execute(() => {
    const canvas = document.querySelector(
      '[data-testid="qr-preview"] canvas'
    ) as HTMLCanvasElement | null;
    return canvas ? canvas.toDataURL('image/png') : '';
  });
  return dataUrl;
}

/**
 * Select a tier (basic, advanced, professional) using data-testid selectors.
 */
export async function selectTier(tier: 'basic' | 'advanced' | 'professional'): Promise<void> {
  const tab = await $(`[data-testid="tier-tab-${tier}"]`);
  if (await tab.isDisplayed()) {
    await tab.click();
    await waitForRenderIdle();
  }
}

/**
 * Open an accordion section by its data-testid ID.
 */
export async function openAccordion(sectionId: string): Promise<void> {
  const trigger = await $(`[data-testid="accordion-${sectionId}"] button[data-state]`);
  await trigger.waitForDisplayed({ timeout: 10_000 });
  const state = await trigger.getAttribute('data-state');
  if (state !== 'open') {
    await trigger.scrollIntoView();
    await trigger.click();
    // Wait for the region to open
    const region = await $(
      `[data-testid="accordion-${sectionId}"] [role="region"][data-state="open"]`
    );
    await region.waitForDisplayed({ timeout: 10_000 });
  }
}
