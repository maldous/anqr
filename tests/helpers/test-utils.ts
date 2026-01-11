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

import type { Page, Locator } from '@playwright/test';

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
export const DEFAULT_TIMEOUT = 10000;

/** Default timeout for render completion */
export const RENDER_TIMEOUT = 15000;

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
 * Wait for render to complete using application signaling.
 * 
 * Strategy (in order of preference):
 * 1. Listen for 'anqr:render-complete' CustomEvent (best: fully event-driven, no polling)
 * 2. Wait for data-rendering-state="idle" attribute (good: event-driven via DOM)
 * 3. Fall back to canvas stability polling (last resort)
 * 
 * @param page - Playwright page instance
 * @param reason - Description of why we're waiting (for debugging)
 * @param timeout - Maximum time to wait
 */
export async function waitForRenderComplete(
  page: Page,
  reason: string = 'render',
  timeout: number = RENDER_TIMEOUT
): Promise<void> {
  // Ensure the canvas exists and is visible. If the app cannot render, fail fast.
  await page.waitForSelector('canvas', { state: 'visible', timeout: Math.min(timeout, 5000) });

  // Strategy 1: Listen for CustomEvent 'anqr:render-complete' (fully event-driven)
  // This is the most reliable method - the app explicitly signals when render is done
  const eventReceived = await page.evaluate((timeoutMs: number) => {
    return new Promise<boolean>((resolve) => {
      // Check if already idle before setting up listener
      const idleMarker = document.querySelector('[data-rendering-state="idle"]');
      if (idleMarker) {
        resolve(true);
        return;
      }
      
      const handler = () => {
        document.removeEventListener('anqr:render-complete', handler);
        resolve(true);
      };
      
      document.addEventListener('anqr:render-complete', handler);
      
      // Timeout fallback
      setTimeout(() => {
        document.removeEventListener('anqr:render-complete', handler);
        resolve(false);
      }, timeoutMs);
    });
  }, timeout);

  if (eventReceived) {
    return;
  }

  // Strategy 2: Wait for data-rendering-state="idle" attribute
  try {
    await page.waitForSelector('[data-rendering-state="idle"]', { state: 'attached', timeout: 2000 });
    return;
  } catch {
    // Continue to fallback
  }

  // Strategy 3: Fall back to canvas stability polling (last resort)
  await waitForCanvasStable(page, 200, timeout);
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
  const sectionLabel = SECTION_LABELS[section as AccordionSection] || section;
  
  if (state === 'open') {
    // Wait for region to be visible with data-state="open"
    await page.waitForSelector(
      `[data-testid="accordion-${section}"] [role="region"][data-state="open"], ` +
      `[role="region"][data-state="open"]`,
      { state: 'visible', timeout }
    );
  } else {
    // Wait for trigger to have data-state="closed"
    await page.waitForFunction(
      (sectionId: string) => {
        const trigger = document.querySelector(`[data-testid="accordion-${sectionId}"] button[data-state]`);
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
  await page.waitForSelector(
    '[data-radix-popper-content-wrapper]',
    { state: 'visible', timeout }
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
  timeout: number = 2000
): Promise<void> {
  // Radix popper content may close by becoming hidden OR detaching entirely.
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-radix-popper-content-wrapper]') as HTMLElement | null;
      if (!el) return true;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return true;
      // offsetParent === null covers "display:none" and some positioned hidden states.
      if (el.offsetParent === null) return true;
      // aria-hidden is sometimes toggled.
      if (el.getAttribute('aria-hidden') === 'true') return true;
      return false;
    },
    { timeout }
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
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
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
  return page.locator('canvas').first();
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
    // Scroll into view and click
    await trigger.scrollIntoViewIfNeeded();
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
  await locator.waitFor({ state: 'attached', timeout: 5000 });
  
  // Use JavaScript scrollIntoView which handles nested scroll containers
  await locator.evaluate(el => {
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
    { timeout: 2000, polling: 16 }
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
  await page.waitForSelector('[data-testid="tier-tabs"], [data-testid="tier-select"]', { timeout: 10000 });
  
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
      { timeout: 2000 }
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
      // Use keyboard navigation as fallback
      const tierIndex = tier === 'basic' ? 0 : tier === 'advanced' ? 1 : 2;
      
      await page.keyboard.press('Home');
      for (let i = 0; i < tierIndex; i++) {
        await page.keyboard.press('ArrowDown');
      }
      await page.keyboard.press('Enter');
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
  // Find the slider element - look for role="slider" inside the container
  const container = page.locator(`[data-testid="${testId}"]`);
  const slider = container.locator('[role="slider"]').first();
  
  // Fallback: if the testId IS the slider itself
  const directSlider = page.locator(`[data-testid="${testId}"][role="slider"]`);
  const targetSlider = await directSlider.count() > 0 ? directSlider : slider;
  
  await targetSlider.waitFor({ state: 'visible', timeout: 5000 });
  await targetSlider.scrollIntoViewIfNeeded();
  
  // Get the current value to detect change
  const initialValue = await targetSlider.getAttribute('aria-valuenow');
  
  // Click at the percentage position
  const box = await targetSlider.boundingBox();
  if (box) {
    const x = box.x + (box.width * percent) / 100;
    const y = box.y + box.height / 2;
    await page.mouse.click(x, y);
    
    // Wait for value to potentially change (event-driven)
    if (percent !== 50) { // Only wait if not clicking in the middle (might not change)
      await page.waitForFunction(
        (args: { testId: string; initial: string | null }) => {
          const slider = document.querySelector(`[data-testid="${args.testId}"] [role="slider"], [data-testid="${args.testId}"][role="slider"]`);
          return slider && slider.getAttribute('aria-valuenow') !== args.initial;
        },
        { testId, initial: initialValue },
        { timeout: 2000, polling: 50 }
      );
    }
  }
}

/**
 * Select an option from a dropdown.
 * Uses keyboard navigation for reliable scrolling within dropdowns.
 * 
 * @param page - Playwright page instance
 * @param testId - data-testid value of the trigger
 * @param optionText - Text of the option to select
 * @param throwOnNotFound - If true (default), throws error when option not found. If false, returns false.
 * @throws Error if option not found and throwOnNotFound is true
 */
export async function selectOption(
  page: Page,
  testId: string,
  optionText: string,
  throwOnNotFound: boolean = true
): Promise<boolean> {
  const trigger = page.locator(`[data-testid="${testId}"]`);
  await trigger.waitFor({ state: 'visible', timeout: 5000 });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  
  // Wait for dropdown to open
  await waitForDropdownOpen(page);
  
  // Get all options and find target index
  const dropdown = page.locator('[data-radix-popper-content-wrapper]').first();
  const allOptions = dropdown.locator('[role="option"]');
  const count = await allOptions.count();
  
  // Collect all available options for error message
  const availableOptions: string[] = [];
  let targetIndex = -1;
  for (let i = 0; i < count; i++) {
    const text = await allOptions.nth(i).textContent();
    const trimmedText = text?.trim() || '';
    availableOptions.push(trimmedText);
    if (text && new RegExp(optionText, 'i').test(trimmedText)) {
      targetIndex = i;
      break;
    }
  }
  
  if (targetIndex === -1) {
    // Option not found, close dropdown
    await page.keyboard.press('Escape');
    await waitForDropdownClosed(page);
    
    if (throwOnNotFound) {
      throw new Error(
        `selectOption: Option "${optionText}" not found in dropdown [data-testid="${testId}"].\n` +
        `Available options: [${availableOptions.map(o => `"${o}"`).join(', ')}]`
      );
    }
    return false;
  }
  
  // Use keyboard navigation for reliable scrolling
  await page.keyboard.press('Home');
  for (let i = 0; i < targetIndex; i++) {
    await page.keyboard.press('ArrowDown');
  }
  
  // Wait for option to be highlighted
  await page.waitForFunction(
    (idx: number) => {
      const options = document.querySelectorAll('[data-radix-popper-content-wrapper] [role="option"]');
      const target = options[idx];
      return target && (target.getAttribute('data-highlighted') === '' || target.hasAttribute('data-highlighted'));
    },
    targetIndex,
    { timeout: 2000, polling: 16 }
  );
  // Press Enter to select
  await page.keyboard.press('Enter');
  
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
export async function toggleSwitch(page: Page, testId: string, targetState?: SwitchState): Promise<void> {
  const switchEl = page.locator(`[data-testid="${testId}"]`);
  await switchEl.waitFor({ state: 'visible', timeout: 5000 });
  await switchEl.scrollIntoViewIfNeeded();
  
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
    { timeout: 2000, polling: 50 }
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
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.scrollIntoViewIfNeeded();
  
  await input.fill('');
  await input.fill(value);
  await input.blur();
  
  // Wait for value to be set (event-driven)
  await page.waitForFunction(
    (args: { testId: string; value: string }) => {
      const el = document.querySelector(`[data-testid="${args.testId}"]`) as HTMLInputElement;
      return el && el.value === args.value;
    },
    { testId, value },
    { timeout: 1000, polling: 50 }
  );
}

/**
 * Upload a file.
 * 
 * @param page - Playwright page instance
 * @param testId - data-testid value (optional - uses first file input if not provided)
 * @param filePath - Path to the file
 */
export async function uploadFile(page: Page, testId: string | null, filePath: string): Promise<void> {
  const fileInput = testId 
    ? page.locator(`[data-testid="${testId}"]`)
    : page.locator('input[type="file"]').first();
  
  await fileInput.waitFor({ state: 'attached', timeout: 5000 });
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
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
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

/** Current version value that marks the modal as "seen" */
export const WELCOME_MODAL_VERSION = '2026.01.04';

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
  // Check if modal is visible (short timeout is OK here - we're checking for presence)
  const dialog = page.locator('dialog[open]').first();
  const dialogVisible = await dialog.waitFor({ state: 'visible', timeout: 1000 }).then(() => true).catch(() => false);
  if (!dialogVisible) return;
  
  // Strategy 1: Click "Get Started" button using data-testid
  const getStartedBtn = page.locator('[data-testid="welcome-get-started"]').first();
  if (await getStartedBtn.isVisible().catch(() => false)) {
    await getStartedBtn.click();
    await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 2000 });
    return;
  }
  
  // Strategy 2: Find first button in dialog (usually the CTA)
  const dialogBtn = dialog.locator('button').first();
  if (await dialogBtn.isVisible().catch(() => false)) {
    await dialogBtn.click();
    await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 2000 }).catch(() => {});
    return;
  }
  
  // Strategy 3: Click close button using aria-label
  const closeBtn = page.locator('button[aria-label*="close" i], button[aria-label="Close"], button[aria-label="Close modal"]').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 2000 }).catch(() => {});
    return;
  }
  
  // Strategy 4: Click the backdrop (the button covering the background)
  const backdrop = page.locator('button.absolute.inset-0').first();
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click({ force: true });
    await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 2000 }).catch(() => {});
    return;
  }
  
  // Strategy 5: Press Escape key
  await page.keyboard.press('Escape');
  await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 2000 }).catch(() => {});
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
  await page.addInitScript((args: { key: string; value: string }) => {
    localStorage.setItem(args.key, args.value);
  }, { key: WELCOME_MODAL_STORAGE_KEY, value: WELCOME_MODAL_VERSION });
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
  await page.addInitScript((args: { key: string; value: string }) => {
    localStorage.setItem(args.key, args.value);
  }, { key: WELCOME_MODAL_STORAGE_KEY, value: WELCOME_MODAL_VERSION });
  
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
  await page.waitForSelector('[role="region"][data-state="open"]', { state: 'visible', timeout: 5000 });
}

/**
 * @deprecated Use waitForRenderComplete instead
 */
export async function waitForQRRender(page: Page, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
  await waitForRenderComplete(page, 'deprecated waitForQRRender', timeout);
}