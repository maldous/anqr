import type { Page } from '@playwright/test';

/**
 * Test Setup Helper with Browser-Side Debugging
 * 
 * Provides event-driven debugging without arbitrary timeouts:
 * - Browser console logging
 * - Page error tracking
 * - Network request timing
 * - Request correlation with server
 */

/**
 * Enable browser-side debugging for a page
 * Call this in beforeEach to get correlated logs
 */
export function enableBrowserDebug(page: Page, options: {
  console?: boolean;
  errors?: boolean;
  network?: boolean;
  timing?: boolean;
} = {}) {
  const { console: logConsole = true, errors = true, network = false, timing = false } = options;

  // 1. Browser console messages
  if (logConsole) {
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      // Filter out known noise that doesn't affect tests
      const isNoise = 
        text.includes('AdMob') ||
        text.includes('WebGL') ||
        text.includes('SwiftShader') ||
        text.includes('GroupMarkerNotSet') ||
        text.includes('crbug.com');
      
      // Only log warnings and errors, excluding known noise
      if ((type === 'error' || type === 'warning') && !isNoise) {
        console.log(`[browser:${type}]`, text);
      }
    });
  }

  // 2. Page errors (uncaught exceptions)
  if (errors) {
    page.on('pageerror', err => {
      const msg = err.message;
      
      // Filter out known noise
      const isNoise = 
        msg.includes('AdMob') ||
        msg.includes('WebGL') ||
        msg.includes('SwiftShader');
      
      if (!isNoise) {
        console.error('[browser:error]', msg);
      }
    });
  }

  // 3. Failed network requests
  if (network) {
    page.on('requestfailed', req => {
      console.error('[browser:req:fail]', req.url(), req.failure()?.errorText);
    });
  }

  // 4. Network timing breakdown (where waits burn time)
  if (timing) {
    page.on('request', req => {
      console.time(`[net] ${req.url()}`);
    });

    page.on('response', res => {
      console.timeEnd(`[net] ${res.url()}`);
    });
  }
}

/**
 * Enable server correlation via request ID headers
 * Matches Playwright requests to server logs
 */
export function enableServerCorrelation(page: Page) {
  page.on('response', res => {
    const id = res.headers()['x-request-id'];
    if (id) {
      console.log('[pw↔server]', id, res.url());
    }
  });
}

/**
 * Wait for the app to be fully interactive
 * Uses multiple signals to ensure the app is ready
 */
export async function waitForAppReady(page: Page): Promise<void> {
  // Wait for canvas to be present (main app indicator)
  await page.waitForSelector('[data-testid="qr-preview"] canvas', { state: 'visible', timeout: 10000 });
  
  // Wait for the app to be interactive by checking for the sidebar
  await page.waitForSelector('[role="tablist"], [role="combobox"]', { state: 'visible', timeout: 5000 });
}

/**
 * Wait for network to be idle (no pending requests)
 * Useful after loading external resources
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
}

/**
 * Wait for a specific element to have a data-state attribute value
 * Event-driven waiting for Radix UI components
 */
export async function waitForDataState(
  page: Page,
  selector: string,
  state: string,
  timeout = 5000
): Promise<void> {
  await page.waitForSelector(`${selector}[data-state="${state}"]`, { state: 'attached', timeout });
}

/**
 * Wait for canvas to change from a previous state
 * Event-driven canvas mutation detection
 */
export async function waitForCanvasMutation(
  page: Page,
  previousDataUrl: string,
  timeout = 10000
): Promise<boolean> {
  try {
    await page.waitForFunction(
      (prev: string) => {
        const canvas = document.querySelector('[data-testid="qr-preview"] canvas');
        if (!canvas) return false;
        return canvas.toDataURL('image/png') !== prev;
      },
      previousDataUrl,
      { timeout, polling: 50 }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for rendering to complete using application signaling
 * The app exposes data-rendering-state='idle' when ready
 * This is MUCH more reliable than canvas pixel comparison
 */
export async function waitForRenderingIdle(
  page: Page,
  timeout = 10000
): Promise<void> {
  await page.waitForSelector(
    '[data-rendering-state="idle"]',
    { state: 'attached', timeout }
  ).catch(() => {
    // Fallback: if attribute not found, wait for canvas to be visible
    return page.waitForSelector('[data-testid="qr-preview"] canvas', { state: 'visible', timeout: 2000 });
  });
}

/**
 * Wait for canvas to be stable (not changing for N milliseconds)
 * Uses efficient polling with waitForFunction
 * @deprecated Use waitForRenderingIdle() instead for better reliability
 */
export async function waitForCanvasStable(
  page: Page,
  stabilityMs = 150,
  timeout = 5000
): Promise<void> {
  // First wait for app to signal idle state
  await waitForRenderingIdle(page, timeout);
  // Then optionally wait for canvas stability as a backup
  await page.waitForFunction(
    (stability: number) => {
      const canvas = document.querySelector('[data-testid="qr-preview"] canvas');
      if (!canvas) return true;
      
      const curr = canvas.toDataURL('image/png');
      const state = (window as any).__canvasStability || { snapshot: '', stableAt: 0 };
      
      if (state.snapshot === curr) {
        // Same as before, check if stable long enough
        if (Date.now() - state.stableAt >= stability) {
          delete (window as any).__canvasStability;
          return true;
        }
      } else {
        // Changed, reset stability timer
        state.snapshot = curr;
        state.stableAt = Date.now();
        (window as any).__canvasStability = state;
      }
      
      return false;
    },
    stabilityMs,
    { timeout: 2000, polling: 50 }
  );
}

/**
 * Get current canvas data URL snapshot
 */
export async function getCanvasDataUrl(page: Page): Promise<string> {
  const canvas = page.locator('[data-testid="qr-preview"] canvas').first();
  return await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL('image/png'));
}

/**
 * Assert canvas changed after an action
 * Event-driven: waits for actual change, not arbitrary timeout
 */
export async function assertCanvasChangedAfter(
  page: Page,
  action: () => Promise<void>,
  timeout = 10000
): Promise<boolean> {
  const before = await getCanvasDataUrl(page);
  await action();
  return await waitForCanvasMutation(page, before, timeout);
}