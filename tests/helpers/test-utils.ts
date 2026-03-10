/**
 * Centralized Test Utilities for Playwright E2E Tests
 *
 * This module provides a comprehensive, centralized set of test utilities that implement
 * the Playwright E2E "must-haves" checklist:
 *
 * 1. Deterministic event-driven waits (no sleeps)
 * 2. Stable selectors (data-testid first)
 * 3. Explicit UI scoping (region-first)
 * 4. Correct scrolling model (scroll the right container)
 * 5. Single source of truth for user actions
 * 6. Visual assertions tied to render completion
 * 7. Accessibility requirements baked in
 * 8. No cross-test state leakage
 * 9. Reduce flakiness from layout noise
 * 10. Logging/traceability
 *
 * @module test-utils
 */

import type { Locator, Page } from '@playwright/test';

// =============================================================================
// TYPES
// =============================================================================

/** Application tier levels */
export type Tier = 'basic' | 'advanced' | 'professional';

/** Accordion section identifiers */
export type AccordionSection =
  | 'payload'
  | 'overlay'
  | 'qr'
  | 'render'
  | 'animation'
  | 'output'
  | 'watermark'
  | 'metadata'
  | 'share'
  | 'safety';

/** Accordion state */
export type AccordionState = 'open' | 'closed';

/** Render state as signaled by the application */
export type RenderState = 'pending' | 'rendering' | 'idle';

/** Switch state */
export type SwitchState = 'checked' | 'unchecked';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Default timeout for most operations */
export const DEFAULT_TIMEOUT = 30000;

/** Default timeout for render completion */
export const RENDER_TIMEOUT = 30000;

/** Section labels for accordion items */
export const SECTION_LABELS: Record<AccordionSection, string> = {
  payload: 'Payload',
  overlay: 'Overlay',
  qr: 'QR Encoding',
  render: 'Rendering',
  animation: 'Animation',
  output: 'Output',
  watermark: 'Watermark',
  metadata: 'Metadata',
  share: 'Share',
  safety: 'Safety',
};

/** Tier labels */
export const TIER_LABELS: Record<Tier, string[]> = {
  basic: ['Basic'],
  advanced: ['Advanced'],
  professional: ['Professional', 'Pro'],
};

// =============================================================================
// 1. DETERMINISTIC EVENT-DRIVEN WAITS
// =============================================================================

/**
 * Wait for render to complete using state-aware detection.
 *
 * Strategy:
 * - If state is already idle: wait past the debounce window, re-check idle, then canvas stability
 * - If state is non-idle: wait for idle transition, then canvas stability
 *
 * @param page - Playwright page instance
 * @param reason - Description of why we're waiting (for debugging)
 * @param timeout - Maximum time to wait
 */
export async function waitForRenderComplete(
  page: Page,
  _reason: string = 'render',
  timeout: number = RENDER_TIMEOUT
): Promise<void> {
  // Ensure the canvas exists and is visible.
  await page.waitForSelector('[data-testid="qr-preview"] canvas', {
    state: 'visible',
    timeout: Math.min(timeout, 30000),
  });

  const preview = page.locator('[data-testid="qr-preview"]');
  const currentState = await preview.getAttribute('data-rendering-state').catch(() => 'unknown');

  if (currentState === 'idle') {
    // Already idle — a debounced render may still be in flight.
    // Event-driven: register a one-shot listener for the app's 'anqr:render-complete'
    // custom event AND track rendering-state transitions (idle→non-idle→idle).
    // Whichever fires first resolves the wait. The 2s safety timeout covers the max
    // debounce (700ms) + React 18 scheduling + load margin without being a fixed sleep.
    await page.evaluate(() => {
      const w = window as any;
      w.__anqrRenderDone = false;
      w.__anqrStateLeftIdle = false;
      document.addEventListener(
        'anqr:render-complete',
        () => {
          w.__anqrRenderDone = true;
        },
        { once: true }
      );
    });

    await page
      .waitForFunction(
        () => {
          const w = window as any;
          if (w.__anqrRenderDone) return true;
          const el = document.querySelector('[data-testid="qr-preview"]');
          const state = el?.getAttribute('data-rendering-state');
          if (state !== 'idle') w.__anqrStateLeftIdle = true;
          if (w.__anqrStateLeftIdle && state === 'idle') return true;
          return false;
        },
        { timeout: Math.min(timeout, 2000), polling: 50 }
      )
      .catch(() => {
        // No render triggered — action may not have changed anything.
      });

    // If state is currently non-idle (render started but hasn't finished), wait for idle.
    const postState = await preview.getAttribute('data-rendering-state').catch(() => 'idle');
    if (postState !== 'idle') {
      await page
        .waitForSelector('[data-testid="qr-preview"][data-rendering-state="idle"]', {
          state: 'attached',
          timeout,
        })
        .catch(() => {});
    }

    // Clean up browser-side flags
    await page
      .evaluate(() => {
        const w = window as any;
        delete w.__anqrRenderDone;
        delete w.__anqrStateLeftIdle;
      })
      .catch(() => {});
  } else {
    // State is pending/rendering — wait for idle (render completion).
    await page
      .waitForSelector('[data-testid="qr-preview"][data-rendering-state="idle"]', {
        state: 'attached',
        timeout,
      })
      .catch(() => {});
  }

  // Canvas stability guard — best-effort; animated overlays never fully stabilize.
  await waitForCanvasStable(page, 250, Math.min(timeout, 15000)).catch(() => {});
}

/**
 * Wait for accordion to reach a specific state.
 * Uses data-state attribute for event-driven detection.
 *
 * @param page - Playwright page instance
 * @param section - Section identifier
 * @param state - Target state ('open' or 'closed')
 * @param timeout - Maximum time to wait
 */
export async function waitForAccordionState(
  page: Page,
  section: AccordionSection | string,
  state: AccordionState,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  if (state === 'open') {
    // Wait for the specific section region to be visible with data-state="open"
    await page.waitForSelector(
      `[data-testid="accordion-${section}"] [role="region"][data-state="open"]`,
      { state: 'visible', timeout }
    );
  } else {
    // Wait for trigger to have data-state="closed"
    await page.waitForFunction(
      (sectionId: string) => {
        const trigger = document.querySelector(
          `[data-testid="accordion-${sectionId}"] button[data-state]`
        );
        return trigger && trigger.getAttribute('data-state') === 'closed';
      },
      section,
      { timeout, polling: 50 }
    );
  }
}

/**
 * Wait for a dropdown to open.
 * Uses Radix UI popper wrapper visibility.
 *
 * @param page - Playwright page instance
 * @param timeout - Maximum time to wait
 */
export async function waitForDropdownOpen(
  page: Page,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await page.waitForFunction(
    () => {
      const isElementVisible = (el: Element): boolean => {
        const node = el as HTMLElement;
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }
        if (node.hidden || node.getAttribute('aria-hidden') === 'true') return false;
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && node.getClientRects().length > 0;
      };

      // Prefer option visibility because Radix wrappers can be fixed-position
      // and report offsetParent=null even when actually visible.
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      if (options.some(isElementVisible)) return true;

      const candidates = Array.from(
        document.querySelectorAll(
          '[data-radix-popper-content-wrapper], [data-radix-select-content], [role="listbox"]'
        )
      ) as HTMLElement[];

      return candidates.some(isElementVisible);
    },
    undefined,
    { timeout, polling: 50 }
  );
}

/**
 * Wait for a dropdown to close.
 * Uses Radix UI popper wrapper hidden state.
 *
 * @param page - Playwright page instance
 * @param timeout - Maximum time to wait
 */
export async function waitForDropdownClosed(
  page: Page,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  // Radix select content may close by becoming hidden OR detaching entirely.
  await page.waitForFunction(
    () => {
      const isElementVisible = (el: Element): boolean => {
        const node = el as HTMLElement;
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }
        if (node.hidden || node.getAttribute('aria-hidden') === 'true') return false;
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && node.getClientRects().length > 0;
      };

      const options = Array.from(document.querySelectorAll('[role="option"]'));
      if (options.some(isElementVisible)) return false;

      const candidates = Array.from(
        document.querySelectorAll(
          '[data-radix-popper-content-wrapper], [data-radix-select-content], [role="listbox"]'
        )
      ) as HTMLElement[];

      if (candidates.length === 0) return true;

      return !candidates.some(isElementVisible);
    },
    undefined,
    { timeout, polling: 50 }
  );
}

/**
 * Wait for a control to be ready for interaction.
 * Checks visibility, enabled state, and scroll position.
 *
 * @param page - Playwright page instance
 * @param testId - data-testid value
 * @param timeout - Maximum time to wait
 */
export async function waitForControlReady(
  page: Page,
  testId: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<Locator> {
  const control = page.locator(`[data-testid="${testId}"]`);
  await control.waitFor({ state: 'visible', timeout });
  await control.waitFor({ state: 'attached', timeout });
  return control;
}

/**
 * Wait for canvas to be stable (not changing for N milliseconds).
 * Event-driven using waitForFunction.
 *
 * @param page - Playwright page instance
 * @param stabilityMs - How long canvas must be stable
 * @param timeout - Maximum time to wait
 */
export async function waitForCanvasStable(
  page: Page,
  stabilityMs: number = 200,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await page.waitForFunction(
    (stability: number) => {
      const canvas = document.querySelector(
        '[data-testid="qr-preview"] canvas'
      ) as HTMLCanvasElement;
      if (!canvas) return true;

      const curr = canvas.toDataURL('image/png');
      const state = (window as any).__canvasStability || { snapshot: '', stableAt: 0 };

      if (state.snapshot === curr) {
        if (Date.now() - state.stableAt >= stability) {
          delete (window as any).__canvasStability;
          return true;
        }
      } else {
        state.snapshot = curr;
        state.stableAt = Date.now();
        (window as any).__canvasStability = state;
      }

      return false;
    },
    stabilityMs,
    { timeout, polling: 50 }
  );
}

// =============================================================================
// 2. STABLE SELECTORS
// =============================================================================

/**
 * Get a control locator by data-testid.
 * This is the preferred way to locate controls.
 *
 * @param page - Playwright page instance
 * @param testId - data-testid value
 * @returns Locator for the control
 */
export function getControl(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * Get the canvas element.
 *
 * @param page - Playwright page instance
 * @returns Locator for the canvas
 */
export function getCanvas(page: Page): Locator {
  return page.locator('[data-testid="qr-preview"] canvas').first();
}

/**
 * Get the sidebar scroll container.
 *
 * @param page - Playwright page instance
 * @returns Locator for the sidebar scroll container
 */
export function getSidebarScroller(page: Page): Locator {
  return page.locator('[data-testid="sidebar-scroll"]');
}

/**
 * Get an accordion region by section ID.
 *
 * @param page - Playwright page instance
 * @param section - Section identifier
 * @returns Locator for the accordion region
 */
export function getAccordionRegion(page: Page, section: AccordionSection | string): Locator {
  return page.locator(`[data-testid="accordion-${section}"] [role="region"]`);
}

// =============================================================================
// 3. EXPLICIT UI SCOPING
// =============================================================================

/**
 * Open an accordion section and return its region locator.
 * Uses data-testid for stable selection and event-driven waits.
 *
 * @param page - Playwright page instance
 * @param section - Section identifier
 * @returns Locator for the opened region
 */
export async function openAccordion(
  page: Page,
  section: AccordionSection | string
): Promise<Locator> {
  // Use data-testid selector only - no text-based fallback for i18n compatibility
  const trigger = page.locator(`[data-testid="accordion-${section}"] button[data-state]`).first();

  // Wait for trigger to be visible
  await trigger.waitFor({ state: 'visible', timeout: 5000 });

  // Check if already open
  const currentState = await trigger.getAttribute('data-state').catch(() => null);
  if (currentState !== 'open') {
    // Scroll into view using JS evaluate to bypass Playwright's stability check
    // (accordion CSS animations can cause scrollIntoViewIfNeeded to loop forever)
    await trigger.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await trigger.click();

    // Wait for accordion to open
    await waitForAccordionState(page, section, 'open');
  }

  return getAccordionRegion(page, section);
}

// =============================================================================
// 4. CORRECT SCROLLING MODEL
// =============================================================================

/**
 * Ensure an element is visible within the sidebar scroll container.
 * This scrolls the sidebar, not the page.
 *
 * @param page - Playwright page instance
 * @param locator - Element to make visible
 */
export async function ensureVisibleInSidebar(page: Page, locator: Locator): Promise<void> {
  // First ensure the element exists
  await locator.waitFor({ state: 'attached', timeout: DEFAULT_TIMEOUT });

  // Use JavaScript scrollIntoView which handles nested scroll containers
  await locator.evaluate((el) => {
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  // Wait for scroll to settle using event-driven detection
  await page.waitForFunction(
    () => {
      const state = (window as any).__scrollStability || { top: -1, stableAt: 0 };
      const sidebar = document.querySelector('[data-testid="sidebar-scroll"]') as HTMLElement;
      if (!sidebar) return true;

      const currentTop = sidebar.scrollTop;
      if (state.top === currentTop) {
        if (Date.now() - state.stableAt >= 50) {
          delete (window as any).__scrollStability;
          return true;
        }
      } else {
        state.top = currentTop;
        state.stableAt = Date.now();
        (window as any).__scrollStability = state;
      }
      return false;
    },
    { timeout: DEFAULT_TIMEOUT, polling: 16 }
  );
}

// =============================================================================
// 5. SINGLE SOURCE OF TRUTH FOR USER ACTIONS
// =============================================================================

/**
 * Select an application tier.
 * Uses data-testid selectors for i18n compatibility.
 *
 * @param page - Playwright page instance
 * @param tier - Target tier
 */
export async function selectTier(page: Page, tier: Tier): Promise<void> {
  // Wait for page to be ready
  await page.waitForSelector('[data-testid="tier-tabs"], [data-testid="tier-select"]', {
    timeout: DEFAULT_TIMEOUT,
  });

  // Try tabs first (desktop) - use data-testid="tier-tab-{tier}"
  const tab = page.locator(`[data-testid="tier-tab-${tier}"]`);
  if (await tab.isVisible().catch(() => false)) {
    await tab.click();
    // Wait for tab to be selected using aria-selected
    await page.waitForFunction(
      (tierName: string) => {
        const tabEl = document.querySelector(`[data-testid="tier-tab-${tierName}"]`);
        return tabEl && tabEl.getAttribute('aria-selected') === 'true';
      },
      tier,
      { timeout: DEFAULT_TIMEOUT }
    );
    await dismissWelcomeModal(page);
    return;
  }

  // Fallback: try select dropdown (mobile) - use data-testid="tier-select"
  const selectTrigger = page.locator('[data-testid="tier-select"]');
  if (await selectTrigger.isVisible().catch(() => false)) {
    await selectTrigger.click();
    await waitForDropdownOpen(page);

    // Find option by data-testid
    const option = page.locator(`[data-testid="tier-option-${tier}"]`).first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
    } else {
      // Direct click fallback by index
      const tierIndex = tier === 'basic' ? 0 : tier === 'advanced' ? 1 : 2;
      const allOptions = page.locator('[data-radix-popper-content-wrapper] [role="option"]');
      await allOptions
        .nth(tierIndex)
        .evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'nearest' }));
      await allOptions.nth(tierIndex).click();
    }
    await waitForDropdownClosed(page);
  }

  // Dismiss welcome modal if it appears after tier switch
  await dismissWelcomeModal(page);
}

// Backwards-compatible aliases (older suites used these names)
export const setTier = selectTier;
export const waitForSelectOpen = waitForDropdownOpen;
export const waitForSelectClosed = waitForDropdownClosed;

/**
 * Set a slider value by clicking at a percentage position.
 * Uses data-testid for stable selection.
 *
 * @param page - Playwright page instance
 * @param testId - data-testid value
 * @param percent - Target value as percentage (0-100)
 */
export async function setSlider(page: Page, testId: string, percent: number): Promise<void> {
  const clampedPercent = Math.max(0, Math.min(100, percent));

  // Slider root (track container) is the canonical click target.
  const container = page.locator(`[data-testid="${testId}"]`).first();
  await container.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
  await container.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

  // Thumb carries aria-valuenow/min/max.
  const thumb = container.locator('[role="slider"]').first();
  await thumb.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });

  const initialValue = await thumb.getAttribute('aria-valuenow');
  const min = Number.parseFloat((await thumb.getAttribute('aria-valuemin')) ?? '0');
  const max = Number.parseFloat((await thumb.getAttribute('aria-valuemax')) ?? '100');
  const targetValue =
    Number.isFinite(min) && Number.isFinite(max) ? min + ((max - min) * clampedPercent) / 100 : NaN;

  // Extremes are most reliable via keyboard Home/End.
  if (clampedPercent <= 0) {
    await thumb.focus();
    await page.keyboard.press('Home');
  } else if (clampedPercent >= 100) {
    await thumb.focus();
    await page.keyboard.press('End');
  } else {
    const box = await container.boundingBox();
    if (box) {
      const x = box.x + (box.width * clampedPercent) / 100;
      const y = box.y + box.height / 2;
      await page.mouse.click(x, y);
    }
  }

  // If we're still far from target and +/- controls exist, nudge deterministically.
  const inc = page.locator(`[data-testid="${testId}-increment"]`);
  const dec = page.locator(`[data-testid="${testId}-decrement"]`);
  for (let i = 0; i < 40; i++) {
    const now = Number.parseFloat((await thumb.getAttribute('aria-valuenow')) ?? 'NaN');
    if (!(Number.isFinite(now) && Number.isFinite(targetValue))) break;
    if (Math.abs(now - targetValue) < 0.6) break;

    if (now < targetValue) {
      if (!(await inc.isVisible().catch(() => false))) break;
      if ((await inc.isEnabled().catch(() => false)) === false) break;
      await inc.click();
    } else {
      if (!(await dec.isVisible().catch(() => false))) break;
      if ((await dec.isEnabled().catch(() => false)) === false) break;
      await dec.click();
    }
  }

  // Best-effort wait for value change; do not fail hard if unchanged.
  if (initialValue !== null) {
    await page
      .waitForFunction(
        (args: { testId: string; initial: string }) => {
          const slider = document.querySelector(
            `[data-testid="${args.testId}"] [role="slider"], [data-testid="${args.testId}"][role="slider"]`
          );
          return slider && slider.getAttribute('aria-valuenow') !== args.initial;
        },
        { testId, initial: initialValue },
        { timeout: DEFAULT_TIMEOUT, polling: 50 }
      )
      .catch(() => {});
  }
}

/**
 * Select an option from a dropdown.
 * Uses keyboard navigation for reliable scrolling within dropdowns.
 *
 * @param page - Playwright page instance
 * @param testId - data-testid value of the trigger
 * @param optionText - Text of the option to select
 * @returns true if option was selected, false if option not found
 */
export async function selectOption(
  page: Page,
  testId: string,
  optionText: string
): Promise<boolean> {
  const trigger = page.locator(`[data-testid="${testId}"]`);
  await trigger.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
  await trigger.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

  // Click the trigger — fall back to JS-dispatched pointer events when the
  // element is technically outside the viewport (nested scroll containers).
  const clickedNatively = await trigger
    .click({ force: true })
    .then(() => true)
    .catch(() => false);

  if (!clickedNatively) {
    await trigger.evaluate((el) => {
      el.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 })
      );
      el.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1 })
      );
    });
  }

  // Wait for dropdown to open
  const opened = await waitForDropdownOpen(page, 5000)
    .then(() => true)
    .catch(() => false);
  if (!opened) {
    await trigger.evaluate((el) => {
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      el.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 })
      );
      el.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1 })
      );
    });
    await waitForDropdownOpen(page, 5000);
  }

  // Get all visible options in the active dropdown/listbox.
  const allOptions = page.locator('[role="option"]:visible');
  const count = await allOptions.count();

  let targetIndex = -1;

  // Prefer stable value matching first (i18n-safe).
  const normalized = optionText.trim().toLowerCase();
  for (let i = 0; i < count; i++) {
    const value = await allOptions.nth(i).getAttribute('data-value');
    if (value && value.trim().toLowerCase() === normalized) {
      targetIndex = i;
      break;
    }
  }

  // Fallback to text matching.
  if (targetIndex === -1) {
    for (let i = 0; i < count; i++) {
      const text = await allOptions.nth(i).textContent();
      if (text && new RegExp(optionText, 'i').test(text.trim())) {
        targetIndex = i;
        break;
      }
    }
  }

  if (targetIndex === -1) {
    // Option not found, close dropdown and return false
    // Note: This returns false silently. Tests should check the return value!
    await page.keyboard.press('Escape');
    await waitForDropdownClosed(page);
    return false;
  }

  // Click the target option directly. Radix Select handles pointer events
  // reliably; keyboard navigation (Home/ArrowDown/Enter) is fragile.
  await allOptions
    .nth(targetIndex)
    .evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await allOptions.nth(targetIndex).click();

  // Wait for dropdown to close
  await waitForDropdownClosed(page);

  return true;
}

/**
 * Toggle a switch.
 * Uses data-testid for stable selection and waits for state change.
 *
 * @param page - Playwright page instance
 * @param testId - data-testid value
 * @param targetState - Optional target state. If not provided, just toggles.
 */
export async function toggleSwitch(
  page: Page,
  testId: string,
  targetState?: SwitchState
): Promise<void> {
  const switchEl = page.locator(`[data-testid="${testId}"]`);
  await switchEl.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
  await switchEl.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

  const currentState = await switchEl.getAttribute('data-state');

  // If target state specified, only click if needed
  if (targetState && currentState === targetState) {
    return;
  }

  // Click to toggle
  await switchEl.click({ force: true });

  // Wait for state to change
  const expectedState = targetState || (currentState === 'checked' ? 'unchecked' : 'checked');
  await page.waitForFunction(
    (args: { testId: string; expected: string }) => {
      const el = document.querySelector(`[data-testid="${args.testId}"]`);
      return el && el.getAttribute('data-state') === args.expected;
    },
    { testId, expected: expectedState },
    { timeout: DEFAULT_TIMEOUT, polling: 50 }
  );
}

/**
 * Set an input value.
 * Uses data-testid for stable selection.
 *
 * @param page - Playwright page instance
 * @param testId - data-testid value
 * @param value - Value to set
 */
export async function setInput(page: Page, testId: string, value: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  await input.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
  await input.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'nearest' }));

  await input.fill('');
  await input.fill(value);
  await input.blur();

  // Numeric inputs can normalize/clamp values; wait for a stable committed value.
  await page
    .waitForFunction(
      (args: { testId: string; requested: string }) => {
        const el = document.querySelector(
          `[data-testid="${args.testId}"]`
        ) as HTMLInputElement | null;
        if (!el) return false;
        if (document.activeElement === el) return false;
        if (args.requested === '') return true;
        return el.value.length > 0;
      },
      { testId, requested: value },
      { timeout: DEFAULT_TIMEOUT, polling: 50 }
    )
    .catch(() => {});
}

/**
 * Upload a file.
 *
 * @param page - Playwright page instance
 * @param testId - data-testid value (optional - uses first file input if not provided)
 * @param filePath - Path to the file
 */
export async function uploadFile(
  page: Page,
  testId: string | null,
  filePath: string
): Promise<void> {
  const fileInput = testId
    ? page.locator(`[data-testid="${testId}"]`)
    : page.locator('input[type="file"]').first();

  await fileInput.waitFor({ state: 'attached', timeout: DEFAULT_TIMEOUT });
  await fileInput.setInputFiles(filePath);

  // Wait for render to complete after file upload
  await waitForRenderComplete(page, 'file upload');
}

// =============================================================================
// 6. VISUAL ASSERTIONS TIED TO RENDER COMPLETION
// =============================================================================

/**
 * Get a canvas snapshot (data URL).
 * Only captures after render is complete.
 *
 * @param page - Playwright page instance
 * @returns Canvas data URL
 */
export async function getCanvasSnapshot(page: Page): Promise<string> {
  const canvas = getCanvas(page);
  await canvas.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });

  // Wait for render to complete before capturing
  await waitForRenderComplete(page, 'canvas snapshot');

  const dataUrl = await canvas.evaluate((el: HTMLCanvasElement) => {
    return el.toDataURL('image/png');
  });

  return dataUrl;
}

/**
 * Check if two canvas snapshots are different.
 *
 * @param before - First snapshot
 * @param after - Second snapshot
 * @returns true if different
 */
export function snapshotsAreDifferent(before: string, after: string): boolean {
  return before !== after;
}

/**
 * Wait for canvas to change from a previous snapshot.
 *
 * @param page - Playwright page instance
 * @param previousSnapshot - Previous canvas data URL
 * @param timeout - Maximum time to wait
 * @returns true if canvas changed
 */
export async function waitForCanvasChange(
  page: Page,
  previousSnapshot: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<boolean> {
  try {
    await page.waitForFunction(
      (prevSnapshot: string) => {
        const canvas = document.querySelector(
          '[data-testid="qr-preview"] canvas'
        ) as HTMLCanvasElement;
        if (!canvas) return false;
        const currentSnapshot = canvas.toDataURL('image/png');
        return currentSnapshot !== prevSnapshot;
      },
      previousSnapshot,
      { timeout, polling: 50 }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute an action and verify it changes the canvas.
 *
 * @param page - Playwright page instance
 * @param action - Action to execute
 * @param timeout - Maximum time to wait for change
 * @returns true if canvas changed
 */
export async function expectCanvasChanged(
  page: Page,
  action: () => Promise<void>,
  timeout: number = DEFAULT_TIMEOUT
): Promise<boolean> {
  const before = await getCanvasSnapshot(page);
  await action();
  return await waitForCanvasChange(page, before, timeout);
}

// =============================================================================
// 8. NO CROSS-TEST STATE LEAKAGE
// =============================================================================

// =============================================================================
// WELCOME MODAL CONSTANTS
// =============================================================================

/** LocalStorage key used by WelcomeModal to track if user has seen it */
export const WELCOME_MODAL_STORAGE_KEY = 'anqr-welcome-seen';

/** Current version value that marks the modal as "seen"
 * IMPORTANT: This MUST match WELCOME_VERSION in src/components/WelcomeModal.tsx
 */
export const WELCOME_MODAL_VERSION = '2026.03.10';

/**
 * Dismiss the welcome modal if it's visible.
 * Uses data-testid and ARIA selectors for i18n compatibility.
 *
 * IMPORTANT: Call this after every page navigation or use setWelcomeModalSeen()
 * before navigation to prevent the modal from appearing at all.
 *
 * @param page - Playwright page instance
 */
export async function dismissWelcomeModal(page: Page): Promise<void> {
  // Check if modal is visible (short timeout — modal appears instantly or not at all)
  const dialog = page.locator('dialog[open]').first();
  const dialogVisible = await dialog
    .waitFor({ state: 'visible', timeout: 2000 })
    .then(() => true)
    .catch(() => false);
  if (!dialogVisible) return;

  // Strategy 1: Click "Get Started" button using data-testid
  const getStartedBtn = page.locator('[data-testid="welcome-get-started"]').first();
  if (await getStartedBtn.isVisible().catch(() => false)) {
    await getStartedBtn.click();
    await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 5000 });
    return;
  }

  // Strategy 2: Find first button in dialog (usually the CTA)
  const dialogBtn = dialog.locator('button').first();
  if (await dialogBtn.isVisible().catch(() => false)) {
    await dialogBtn.click();
    await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 5000 }).catch(() => {});
    return;
  }

  // Strategy 3: Click close button using aria-label
  const closeBtn = page
    .locator(
      'button[aria-label*="close" i], button[aria-label="Close"], button[aria-label="Close modal"]'
    )
    .first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 5000 }).catch(() => {});
    return;
  }

  // Strategy 4: Click the backdrop (the button covering the background)
  const backdrop = page.locator('button.absolute.inset-0').first();
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click({ force: true });
    await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 5000 }).catch(() => {});
    return;
  }

  // Strategy 5: Press Escape key
  await page.keyboard.press('Escape');
  await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 5000 }).catch(() => {});
}

/**
 * Set localStorage to mark welcome modal as seen BEFORE navigation.
 * This prevents the modal from appearing at all - more reliable than dismissing.
 *
 * Usage:
 * ```ts
 * await setWelcomeModalSeen(page);
 * await page.goto('/');
 * ```
 *
 * @param page - Playwright page instance
 */
export async function setWelcomeModalSeen(page: Page): Promise<void> {
  await page.addInitScript(
    (args: { key: string; value: string }) => {
      localStorage.setItem(args.key, args.value);
    },
    { key: WELCOME_MODAL_STORAGE_KEY, value: WELCOME_MODAL_VERSION }
  );
}

/**
 * Navigate to the app and wait for it to be ready.
 * Sets localStorage to skip welcome modal before navigation.
 *
 * IMPORTANT: This is the recommended way to start tests - it ensures
 * the welcome modal is bypassed and the app is ready for interaction.
 *
 * @param page - Playwright page instance
 */
export async function navigateToApp(page: Page): Promise<void> {
  // Set localStorage to skip welcome modal BEFORE navigating
  // This is more reliable than dismissing the modal after it appears
  await page.addInitScript(
    (args: { key: string; value: string }) => {
      localStorage.setItem(args.key, args.value);
    },
    { key: WELCOME_MODAL_STORAGE_KEY, value: WELCOME_MODAL_VERSION }
  );

  await page.goto('/');
  // Double-check: dismiss welcome modal if it still appears (shouldn't happen but defensive)
  await dismissWelcomeModal(page);

  // Wait for initial render
  await waitForRenderComplete(page, 'initial navigation');
}

/**
 * Reset app state to baseline.
 * Navigates fresh and dismisses any modals.
 *
 * @param page - Playwright page instance
 */
export async function resetAppState(page: Page): Promise<void> {
  await navigateToApp(page);
}

// =============================================================================
// DEPRECATED - BACKWARD COMPATIBILITY
// =============================================================================

/**
 * @deprecated Use waitForAccordionState instead
 */
export async function waitForAccordionOpen(page: Page, sectionId?: string): Promise<void> {
  if (sectionId) {
    await waitForAccordionState(page, sectionId, 'open');
    return;
  }
  // Wait for any accordion region to be visible
  await page.waitForSelector('[role="region"][data-state="open"]', {
    state: 'visible',
    timeout: DEFAULT_TIMEOUT,
  });
}

/**
 * @deprecated Use waitForRenderComplete instead
 */
export async function waitForQRRender(
  page: Page,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await waitForRenderComplete(page, 'deprecated waitForQRRender', timeout);
}
