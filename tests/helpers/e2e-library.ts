/**
 * E2E Testing Library for ANQR
 * 
 * Implements all 10 must-haves for reliable Playwright E2E tests:
 * 1. Deterministic event-driven waits (no sleeps)
 * 2. Stable selectors (data-testid first)
 * 3. Explicit UI scoping (region-first)
 * 4. Correct scrolling model (scroll the right container)
 * 5. Single source of truth for user actions
 * 6. Visual assertions tied to render completion
 * 7. Accessibility requirements baked into tests
 * 8. No cross-test state leakage
 * 9. Reduce flakiness from layout noise
 * 10. Logging/traceability (debug-first design)
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { waitForRenderComplete } from './test-utils';

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_TIMEOUT = 10_000;
const RENDER_IDLE_TIMEOUT = 15_000;
const SCROLL_SETTLE_MS = 50;

// Tier values matching the app's tier system
export type Tier = 'basic' | 'advanced' | 'professional';

// Accordion section names
export type SectionName =
  | 'Payload'
  | 'QR Encoding'
  | 'Render'
  | 'Overlay'
  | 'Watermark'
  | 'Animation'
  | 'Safety'
  | 'Output'
  | 'Metadata'
  | 'Share';

// Map section display names to their data-testid IDs
const SECTION_NAME_TO_ID: Record<SectionName, string> = {
  'Payload': 'payload',
  'QR Encoding': 'qr',
  'Render': 'render',
  'Overlay': 'overlay',
  'Watermark': 'watermark',
  'Animation': 'animation',
  'Safety': 'safety',
  'Output': 'output',
  'Metadata': 'metadata',
  'Share': 'share',
};

// =============================================================================
// 1. DETERMINISTIC EVENT-DRIVEN WAITS
// =============================================================================

/**
 * Wait for the app to signal rendering is complete.
 * The app sets data-rendering-state="idle" when:
 * - debounce has settled (isPending = false)
 * - rendering is complete (isRendering = false)
 */
export async function waitForRenderIdle(
  page: Page,
  timeout = RENDER_IDLE_TIMEOUT
): Promise<void> {
  await page.waitForSelector(
    '[data-rendering-state="idle"]',
    { state: 'attached', timeout }
  );
}

/**
 * Wait for a complete render cycle: change -> (debounce) -> render -> idle.
 * Call this AFTER making a change that should trigger re-render.
 */
export async function waitForRenderCycle(
  page: Page,
  timeout = RENDER_IDLE_TIMEOUT
): Promise<void> {
  // First, wait briefly for the app to notice the change (pending state)
  // Then wait for it to complete rendering
  try {
    // Wait for rendering state to change from idle (if it was idle)
    await page.waitForSelector(
      '[data-rendering-state="pending"], [data-rendering-state="rendering"]',
      { state: 'attached', timeout: 1000 }
    ).catch(() => {
      // Change might have been so fast we missed the transition, that's OK
    });
  } catch {
    // Ignore - we'll just wait for idle
  }
  
  // Now wait for idle
  await waitForRenderIdle(page, timeout);
}

/**
 * Wait for accordion to be in the expected state.
 */
export async function waitForAccordionState(
  trigger: Locator,
  state: 'open' | 'closed',
  timeout = DEFAULT_TIMEOUT
): Promise<void> {
  const expectedDataState = state === 'open' ? 'open' : 'closed';
  await trigger.waitFor({ state: 'visible', timeout });
  await expect(trigger).toHaveAttribute('data-state', expectedDataState, { timeout });
}

/**
 * Wait for a Radix select dropdown to open.
 */
export async function waitForSelectOpen(
  page: Page,
  timeout = DEFAULT_TIMEOUT
): Promise<Locator> {
  const content = page.locator('[data-radix-popper-content-wrapper]').first();
  await content.waitFor({ state: 'visible', timeout });
  return content;
}

/**
 * Wait for all Radix select dropdowns to close.
 */
export async function waitForSelectClosed(
  page: Page,
  timeout = DEFAULT_TIMEOUT
): Promise<void> {
  const content = page.locator('[data-radix-popper-content-wrapper]');
  // Wait for no dropdown to be visible
  await expect(content).toHaveCount(0, { timeout }).catch(async () => {
    // If count doesn't become 0, check if all are hidden
    const count = await content.count();
    for (let i = 0; i < count; i++) {
      await expect(content.nth(i)).not.toBeVisible({ timeout });
    }
  });
}

/**
 * Wait for scroll position to stabilize (no change for N ms).
 * Event-driven alternative to waitForTimeout.
 */
export async function waitForScrollSettled(
  page: Page,
  selector: string,
  stabilityMs = SCROLL_SETTLE_MS,
  timeout = 2000
): Promise<void> {
  await page.waitForFunction(
    (args: { sel: string; stability: number }) => {
      const el = document.querySelector(args.sel) as HTMLElement;
      if (!el) return true;
      
      interface ScrollState {
        top: number;
        left: number;
        stableAt: number;
      }
      
      const win = window as Window & { __scrollStability?: ScrollState };
      const state: ScrollState = win.__scrollStability || { top: -1, left: -1, stableAt: 0 };
      const currentTop = el.scrollTop;
      const currentLeft = el.scrollLeft;
      
      if (state.top === currentTop && state.left === currentLeft) {
        if (Date.now() - state.stableAt >= args.stability) {
          delete win.__scrollStability;
          return true;
        }
      } else {
        state.top = currentTop;
        state.left = currentLeft;
        state.stableAt = Date.now();
        win.__scrollStability = state;
      }
      return false;
    },
    { sel: selector, stability: stabilityMs },
    { timeout, polling: 16 }
  ).catch(() => {
    // Timeout is OK - element might not be scrollable
  });
}

// =============================================================================
// 2. STABLE SELECTORS
// =============================================================================

/**
 * Get element by data-testid.
 */
export function getByTestId(page: Page, testId: string): Locator {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * Get the sidebar element.
 */
export function getSidebar(page: Page): Locator {
  // The sidebar is an <aside> element with the settings
  return page.locator('aside').first();
}

/**
 * Get the QR preview container.
 */
export function getQRPreview(page: Page): Locator {
  return page.locator('[data-testid="qr-preview"]');
}

/**
 * Get the QR canvas element.
 */
export function getCanvas(page: Page): Locator {
  return page.locator('[data-testid="qr-preview"] canvas').first();
}

// =============================================================================
// 3. EXPLICIT UI SCOPING - SidebarSection Class
// =============================================================================

/**
 * Helper class for interacting with accordion sections in the sidebar.
 * Ensures all interactions are properly scoped to the correct region.
 */
export class SidebarSection {
  private page: Page;
  private name: SectionName;
  private sectionId: string;
  private trigger: Locator;
  
  constructor(page: Page, name: SectionName) {
    this.page = page;
    this.name = name;
    this.sectionId = SECTION_NAME_TO_ID[name];
    // Find trigger using data-testid for reliable selection
    // The accordion item has data-testid="accordion-{id}" and the trigger is a button with data-state inside
    this.trigger = page.locator(`[data-testid="accordion-${this.sectionId}"] button[data-state]`).first();
  }
  
  /**
   * Open this accordion section.
   */
  async open(): Promise<void> {
    const state = await this.trigger.getAttribute('data-state');
    if (state === 'open') return;
    
    await this.trigger.scrollIntoViewIfNeeded();
    await this.trigger.click();
    await waitForAccordionState(this.trigger, 'open');
  }
  
  /**
   * Close this accordion section.
   */
  async close(): Promise<void> {
    const state = await this.trigger.getAttribute('data-state');
    if (state === 'closed') return;
    
    await this.trigger.click();
    await waitForAccordionState(this.trigger, 'closed');
  }
  
  /**
   * Check if this section is open.
   */
  async isOpen(): Promise<boolean> {
    const state = await this.trigger.getAttribute('data-state');
    return state === 'open';
  }
  
  /**
   * Get the region (content) of this accordion section.
   * Assumes section is open.
   */
  getRegion(): Locator {
    // The region follows the trigger - it's the [role="region"] associated with this trigger
    // In Radix accordion, the content has role="region" and is controlled by the trigger
    return this.page.locator('[role="region"][data-state="open"]').first();
  }
  
  /**
   * Get a control within this section by data-testid.
   */
  getControl(testId: string): Locator {
    return this.getRegion().locator(`[data-testid="${testId}"]`);
  }
  
  /**
   * Get the trigger element.
   */
  getTrigger(): Locator {
    return this.trigger;
  }
}

// =============================================================================
// 4. CORRECT SCROLLING MODEL
// =============================================================================

/**
 * Scroll an element into view within the sidebar's scroll container.
 * This scrolls the sidebar, not the page.
 */
export async function scrollIntoViewInSidebar(
  page: Page,
  locator: Locator
): Promise<void> {
  // First scroll the element into view
  await locator.scrollIntoViewIfNeeded();
  
  // Wait for scroll to settle
  await waitForScrollSettled(page, 'aside');
}

// =============================================================================
// 5. SINGLE SOURCE OF TRUTH - Helper Classes
// =============================================================================

/**
 * Helper class for Radix Select components.
 * Uses keyboard navigation for reliable option selection.
 */
export class SelectHelper {
  private locator: Locator;
  private page: Page;
  
  constructor(locator: Locator) {
    this.locator = locator;
    this.page = locator.page();
  }
  
  /**
   * Open the select dropdown.
   */
  async open(): Promise<Locator> {
    await scrollIntoViewInSidebar(this.page, this.locator);
    await this.locator.click();
    return await waitForSelectOpen(this.page);
  }
  
  /**
   * Choose an option by data-value or index using keyboard navigation.
   * This is more reliable than clicking options in scrollable dropdowns.
   * 
   * @param optionValue - The data-value attribute value, or a numeric index
   */
  async choose(optionValue: string | number): Promise<void> {
    const dropdown = await this.open();
    
    // Get all options
    const options = dropdown.locator('[role="option"]');
    const count = await options.count();
    
    let targetIndex = -1;
    
    if (typeof optionValue === 'number') {
      // Use index directly
      targetIndex = optionValue;
    } else {
      // Find the target option index by data-value
      for (let i = 0; i < count; i++) {
        const value = await options.nth(i).getAttribute('data-value');
        if (value && value.toLowerCase() === optionValue.toLowerCase()) {
          targetIndex = i;
          break;
        }
      }
      
      // Fallback: try text content as last resort
      if (targetIndex === -1) {
        for (let i = 0; i < count; i++) {
          const text = await options.nth(i).textContent();
          if (text && new RegExp(optionValue, 'i').test(text.trim())) {
            targetIndex = i;
            break;
          }
        }
      }
    }
    
    if (targetIndex === -1 || targetIndex >= count) {
      // Option not found - close dropdown and throw
      await this.page.keyboard.press('Escape');
      throw new Error(`Option "${optionValue}" not found in select`);
    }
    
    // Navigate to option using keyboard
    await this.page.keyboard.press('Home');
    for (let i = 0; i < targetIndex; i++) {
      await this.page.keyboard.press('ArrowDown');
    }
    
    // Wait for scroll to settle (in case dropdown scrolled)
    await waitForScrollSettled(this.page, '[data-radix-popper-content-wrapper]');
    
    // Select the option
    await this.page.keyboard.press('Enter');
    
    // Wait for dropdown to close
    await waitForSelectClosed(this.page);
  }
  
  /**
   * Close the select dropdown without making a selection.
   */
  async close(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await waitForSelectClosed(this.page);
  }
  
  /**
   * Get the current value text.
   */
  async getValue(): Promise<string> {
    return await this.locator.textContent() || '';
  }
}

/**
 * Helper class for Radix Slider components.
 */
export class SliderHelper {
  private locator: Locator;
  private page: Page;
  
  constructor(locator: Locator) {
    this.locator = locator;
    this.page = locator.page();
  }
  
  /**
   * Set slider value by clicking at the appropriate position.
   */
  async setValue(value: number): Promise<void> {
    await scrollIntoViewInSidebar(this.page, this.locator);
    
    const min = await this.getMin();
    const max = await this.getMax();
    
    // Clamp value to valid range
    const clampedValue = Math.max(min, Math.min(max, value));
    
    // Calculate click position
    const box = await this.locator.boundingBox();
    if (!box) throw new Error('Slider not visible');
    
    const percent = (clampedValue - min) / (max - min);
    const x = box.x + box.width * percent;
    const y = box.y + box.height / 2;
    
    await this.page.mouse.click(x, y);
  }
  
  /**
   * Set slider value using keyboard (more precise for integer values).
   */
  async setValueByKeyboard(targetValue: number): Promise<void> {
    await scrollIntoViewInSidebar(this.page, this.locator);
    
    // Focus the slider thumb
    const thumb = this.locator.locator('[role="slider"]');
    await thumb.focus();
    
    const currentValue = await this.getValue();
    const diff = targetValue - currentValue;
    
    if (diff === 0) return;
    
    const key = diff > 0 ? 'ArrowRight' : 'ArrowLeft';
    const steps = Math.abs(diff);
    
    for (let i = 0; i < steps; i++) {
      await this.page.keyboard.press(key);
    }
  }
  
  /**
   * Get current slider value.
   */
  async getValue(): Promise<number> {
    const thumb = this.locator.locator('[role="slider"]');
    const value = await thumb.getAttribute('aria-valuenow');
    return Number(value) || 0;
  }
  
  /**
   * Get minimum slider value.
   */
  async getMin(): Promise<number> {
    const thumb = this.locator.locator('[role="slider"]');
    const value = await thumb.getAttribute('aria-valuemin');
    return Number(value) || 0;
  }
  
  /**
   * Get maximum slider value.
   */
  async getMax(): Promise<number> {
    const thumb = this.locator.locator('[role="slider"]');
    const value = await thumb.getAttribute('aria-valuemax');
    return Number(value) || 100;
  }
}

/**
 * Helper class for Radix Switch components.
 */
export class SwitchHelper {
  private locator: Locator;
  private page: Page;
  
  constructor(locator: Locator) {
    this.locator = locator;
    this.page = locator.page();
  }
  
  /**
   * Toggle the switch state.
   */
  async toggle(): Promise<void> {
    await scrollIntoViewInSidebar(this.page, this.locator);
    await this.locator.click();
  }
  
  /**
   * Set switch to a specific state.
   */
  async setState(checked: boolean): Promise<void> {
    const currentState = await this.isChecked();
    if (currentState !== checked) {
      await this.toggle();
    }
  }
  
  /**
   * Check if switch is currently checked.
   */
  async isChecked(): Promise<boolean> {
    const state = await this.locator.getAttribute('data-state');
    return state === 'checked';
  }
  
  /**
   * Toggle using keyboard (Space key).
   */
  async toggleByKeyboard(): Promise<void> {
    await scrollIntoViewInSidebar(this.page, this.locator);
    await this.locator.focus();
    await this.page.keyboard.press('Space');
  }
}

/**
 * Helper class for text input components.
 */
export class InputHelper {
  private locator: Locator;
  private page: Page;
  
  constructor(locator: Locator) {
    this.locator = locator;
    this.page = locator.page();
  }
  
  /**
   * Clear and fill the input with new value.
   */
  async setValue(value: string): Promise<void> {
    await scrollIntoViewInSidebar(this.page, this.locator);
    await this.locator.fill(value);
  }
  
  /**
   * Get current input value.
   */
  async getValue(): Promise<string> {
    return await this.locator.inputValue();
  }
  
  /**
   * Clear the input.
   */
  async clear(): Promise<void> {
    await this.locator.fill('');
  }
  
  /**
   * Type into the input (keystroke by keystroke).
   */
  async type(value: string): Promise<void> {
    await scrollIntoViewInSidebar(this.page, this.locator);
    await this.locator.focus();
    await this.page.keyboard.type(value);
  }
}

// =============================================================================
// 6. VISUAL ASSERTIONS
// =============================================================================

/**
 * Get a snapshot of the QR canvas for comparison.
 */
export async function getCanvasSnapshot(page: Page): Promise<string> {
  const canvas = getCanvas(page);
  await canvas.waitFor({ state: 'visible' });
  
  // Get canvas data URL
  const dataUrl = await canvas.evaluate((el: HTMLCanvasElement) => {
    return el.toDataURL('image/png');
  });
  
  return dataUrl;
}

/**
 * Compare two canvas snapshots.
 * Returns true if they are different.
 */
export function snapshotsAreDifferent(snapshot1: string, snapshot2: string): boolean {
  return snapshot1 !== snapshot2;
}

/**
 * Take a screenshot tied to render completion.
 * Only captures AFTER render is idle.
 */
export async function takeRenderCompleteScreenshot(
  page: Page,
  name: string
): Promise<Buffer> {
  await waitForRenderIdle(page);
  const preview = getQRPreview(page);
  return await preview.screenshot({ type: 'png' });
}

// =============================================================================
// 7. ACCESSIBILITY ASSERTIONS
// =============================================================================

/**
 * Assert that an element has the expected ARIA role.
 */
export async function assertAriaRole(
  locator: Locator,
  expectedRole: string
): Promise<void> {
  await expect(locator).toHaveAttribute('role', expectedRole);
}

/**
 * Assert that a switch has correct ARIA attributes.
 */
export async function assertSwitchAccessibility(locator: Locator): Promise<void> {
  await expect(locator).toHaveAttribute('role', 'switch');
  // data-state should be 'checked' or 'unchecked'
  const state = await locator.getAttribute('data-state');
  expect(['checked', 'unchecked']).toContain(state);
}

/**
 * Assert that a slider has correct ARIA attributes.
 */
export async function assertSliderAccessibility(locator: Locator): Promise<void> {
  const thumb = locator.locator('[role="slider"]');
  await expect(thumb).toHaveAttribute('role', 'slider');
  await expect(thumb).toHaveAttribute('aria-valuenow', /.+/);
  await expect(thumb).toHaveAttribute('aria-valuemin', /.+/);
  await expect(thumb).toHaveAttribute('aria-valuemax', /.+/);
}

/**
 * Assert that a select has correct ARIA attributes.
 */
export async function assertSelectAccessibility(locator: Locator): Promise<void> {
  await expect(locator).toHaveAttribute('role', 'combobox');
  await expect(locator).toHaveAttribute('aria-expanded', /.+/);
}

/**
 * Assert that an element is keyboard focusable.
 */
export async function assertKeyboardFocusable(locator: Locator): Promise<void> {
  await locator.focus();
  await expect(locator).toBeFocused();
}

/**
 * Assert keyboard operability of a switch (Space toggles).
 */
export async function assertSwitchKeyboardOperable(
  locator: Locator,
  page: Page
): Promise<void> {
  const helper = new SwitchHelper(locator);
  const before = await helper.isChecked();
  
  await locator.focus();
  await page.keyboard.press('Space');
  
  const after = await helper.isChecked();
  expect(after).not.toBe(before);
  
  // Restore original state
  await page.keyboard.press('Space');
}

// =============================================================================
// 8. TEST SETUP & STATE MANAGEMENT
// =============================================================================

export interface SetupOptions {
  tier?: Tier;
  waitForIdle?: boolean;
  dismissModal?: boolean;
}

/**
 * Setup test with clean state.
 * Navigates fresh to avoid cross-test state leakage.
 * 
 * IMPORTANT: This function sets localStorage BEFORE navigation to prevent
 * the welcome modal from appearing. This is more reliable than dismissing it.
 */
export async function setupTest(
  page: Page,
  options: SetupOptions = {}
): Promise<void> {
  const { tier = 'basic', waitForIdle = true, dismissModal = true } = options;
  
  // Set localStorage to skip welcome modal BEFORE navigating
  // This prevents the modal from appearing at all
  await setWelcomeModalSeen(page);
  
  // Navigate fresh
  await page.goto('/');
  
  // Double-check: dismiss welcome modal if it still appears (shouldn't happen but defensive)
  if (dismissModal) {
    await dismissWelcomeModal(page);
  }
  
  // Select tier
  await selectTier(page, tier);
  
  // Wait for initial render
  if (waitForIdle) {
    await waitForRenderIdle(page);
  }
}

// =============================================================================
// WELCOME MODAL CONSTANTS
// =============================================================================

/** LocalStorage key used by WelcomeModal to track if user has seen it */
export const WELCOME_MODAL_STORAGE_KEY = 'anqr-welcome-seen';

/** Current version value that marks the modal as "seen" */
/** IMPORTANT: This MUST match WELCOME_VERSION in src/components/WelcomeModal.tsx */
export const WELCOME_MODAL_VERSION = '2026.02.01';

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
 * Dismiss the welcome modal if present.
 * Uses data-testid and ARIA selectors for i18n compatibility.
 * 
 * IMPORTANT: Prefer setWelcomeModalSeen() BEFORE navigation instead.
 */
export async function dismissWelcomeModal(page: Page): Promise<void> {
  try {
    // Check for the dialog element (WelcomeModal uses <dialog open>)
    const dialog = page.locator('dialog[open]').first();
    const isVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (!isVisible) return;
    
    // Strategy 1: Click "Get Started" button using data-testid
    const getStartedBtn = page.locator('[data-testid="welcome-get-started"]').first();
    if (await getStartedBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await getStartedBtn.click();
      await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 2000 });
      return;
    }
    
    // Strategy 2: Find first button in dialog (usually the CTA)
    const dialogBtn = dialog.locator('button').first();
    if (await dialogBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await dialogBtn.click();
      await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 2000 }).catch(() => {});
      return;
    }
    
    // Strategy 3: Click close button using aria-label
    const closeBtn = page.locator('button[aria-label*="close" i], button[aria-label="Close modal"]').first();
    if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 2000 }).catch(() => {});
      return;
    }
    
    // Strategy 4: Click the backdrop
    const backdrop = page.locator('button.absolute.inset-0').first();
    if (await backdrop.isVisible({ timeout: 500 }).catch(() => false)) {
      await backdrop.click({ force: true });
      await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 2000 }).catch(() => {});
      return;
    }
    
    // Strategy 5: Press Escape key
    await page.keyboard.press('Escape');
    await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 2000 }).catch(() => {});
  } catch {
    // Modal might not exist, that's OK
  }
}

/**
 * Select a tier (Basic/Advanced/Professional).
 * Uses data-testid selectors for i18n compatibility.
 */
export async function selectTier(page: Page, tier: Tier): Promise<void> {
  // Map tier to value attribute
  const tierValue = tier; // 'basic', 'advanced', 'professional'
  
  // Try tabs first (desktop) - use data-testid="tier-tabs"
  const tabsList = page.locator('[data-testid="tier-tabs"]');
  if (await tabsList.isVisible({ timeout: 2000 }).catch(() => false)) {
    // Find tab by data-testid attribute (i18n-safe)
    const tab = page.locator(`[data-testid="tier-tab-${tierValue}"]`).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await waitForRenderComplete(page, 'settle');
      return;
    }
  }
  
  // Fallback: try select dropdown (mobile) - use data-testid="tier-select"
  const selectTrigger = page.locator('[data-testid="tier-select"]');
  if (await selectTrigger.isVisible({ timeout: 1000 }).catch(() => false)) {
    await selectTrigger.click();
    await waitForSelectOpen(page);
    
    // Find option by data-testid attribute (i18n-safe)
    const option = page.locator(`[data-testid="tier-option-${tierValue}"]`).first();
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
    await waitForSelectClosed(page).catch(() => {});
    await waitForRenderComplete(page, 'settle');
  }
}

/**
 * Clear all settings to default state.
 */
export async function resetToDefaults(page: Page): Promise<void> {
  // Clear URL params and reload
  await page.goto('/');
  await dismissWelcomeModal(page);
  await waitForRenderIdle(page);
}

// =============================================================================
// 9. FLAKINESS REDUCTION
// =============================================================================

/**
 * Check if E2E mode is enabled (app should disable ads, animations).
 */
export async function isE2EMode(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return !!(window as Window & { __E2E_MODE__?: boolean }).__E2E_MODE__;
  });
}

/**
 * Enable E2E mode in the app to reduce flakiness.
 */
export async function enableE2EMode(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as Window & { __E2E_MODE__?: boolean }).__E2E_MODE__ = true;
  });
}

// =============================================================================
// 10. LOGGING & TRACEABILITY
// =============================================================================

/**
 * Debug helper: log current test state.
 */
export async function logTestState(page: Page, label: string): Promise<void> {
  const state = await page.evaluate(() => {
    const preview = document.querySelector('[data-testid="qr-preview"]');
    const renderState = preview?.getAttribute('data-rendering-state') || 'unknown';
    
    const openSections = Array.from(document.querySelectorAll('[data-state="open"]'))
      .map(el => el.textContent?.trim().split('\n')[0])
      .filter(Boolean);
    
    return {
      url: window.location.href,
      renderState,
      openSections,
    };
  });
  
  console.log(`[${label}]`, JSON.stringify(state, null, 2));
}

/**
 * Create test context with convenient access to common elements.
 */
export function createTestContext(page: Page) {
  return {
    page,
    // Sections
    payload: new SidebarSection(page, 'Payload'),
    qrEncoding: new SidebarSection(page, 'QR Encoding'),
    render: new SidebarSection(page, 'Render'),
    overlay: new SidebarSection(page, 'Overlay'),
    watermark: new SidebarSection(page, 'Watermark'),
    animation: new SidebarSection(page, 'Animation'),
    safety: new SidebarSection(page, 'Safety'),
    output: new SidebarSection(page, 'Output'),
    metadata: new SidebarSection(page, 'Metadata'),
    share: new SidebarSection(page, 'Share'),
    // Common operations
    getSnapshot: () => getCanvasSnapshot(page),
    waitForRender: () => waitForRenderCycle(page),
    waitForIdle: () => waitForRenderIdle(page),
  };
}

// =============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// =============================================================================

// Export waitForQRRender as an alias for waitForRenderIdle for backward compatibility
export const waitForQRRender = waitForRenderIdle;

// Export waitForQRStable as an alias
export const waitForQRStable = waitForRenderIdle;
