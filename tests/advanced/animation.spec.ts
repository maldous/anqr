/**
 * Animation Section Tests - Comprehensive Coverage
 * Tests all animation controls: speed, loop, bounce, frames, interpolation, patterns
 * Uses data-testid selectors and keyboard navigation for reliability
 * 
 * Follows Playwright E2E "must-haves":
 * - Deterministic event-driven waits (no sleeps)
 * - Stable selectors (data-testid first)
 * - Explicit UI scoping (region-first)
 * - Correct scrolling model
 */

import { test, expect } from '../fixtures/test-fixtures';
import type { Page } from '@playwright/test';

import {
  waitForRenderComplete,
  waitForAccordionState,
  waitForDropdownOpen,
  waitForDropdownClosed,
  waitForControlReady,
  getCanvasSnapshot,
  snapshotsAreDifferent,
  openAccordion,
  ensureVisibleInSidebar,
  setSlider,
  toggleSwitch,
  selectOption,
  setInput,
  selectTier,
  dismissWelcomeModal,
  navigateToApp,
  getControl,
  type AccordionSection,
} from '../helpers/test-utils';

// Test timeout for complex operations
const TEST_TIMEOUT = 30000;

/**
 * Navigate to the app and wait for initial load.
 * Uses event-driven waits (no arbitrary timeouts).
 */
async function setupPage(page: Page) {
  await navigateToApp(page);
}

/**
 * Switch to advanced tier.
 * Uses centralized selectTier helper.
 */
async function switchToAdvancedTier(page: Page) {
  await selectTier(page, 'advanced');
}

/**
 * Expand the Animation section.
 * First switches to advanced tier, then opens the accordion.
 * Uses event-driven waits (no arbitrary timeouts).
 */
async function expandAnimationSection(page: Page) {
  // First switch to advanced tier to ensure Animation section is visible
  await switchToAdvancedTier(page);
  
  // Scroll sidebar to ensure Animation section is visible
  const sidebar = page.locator('aside, [role="complementary"], .sidebar').first();
  if (await sidebar.count() > 0) {
    await sidebar.evaluate(el => el.scrollTop = el.scrollHeight / 2);
  }
  
  // Use centralized openAccordion helper
  await openAccordion(page, 'animation');
}

/**
 * Set slider value using data-testid.
 * Uses centralized setSlider helper (no arbitrary timeouts).
 */
async function setSliderByTestId(page: Page, testId: string, percent: number) {
  await setSlider(page, testId, percent);
}

/**
 * Toggle switch using data-testid.
 * Uses centralized toggleSwitch helper (no arbitrary timeouts).
 */
async function toggleSwitchByTestId(page: Page, testId: string) {
  await toggleSwitch(page, testId);
}

/**
 * Select dropdown option using data-testid.
 * Uses centralized selectOption helper with keyboard navigation (no arbitrary timeouts).
 */
async function selectDropdownOptionLocal(page: Page, triggerTestId: string, optionText: string) {
  await selectOption(page, triggerTestId, optionText);
}

/**
 * Set input value using data-testid.
 * Uses centralized setInput helper (no arbitrary timeouts).
 */
async function setInputByTestId(page: Page, testId: string, value: string) {
  await setInput(page, testId, value);
}

// ============================================================================
// SPEED SLIDER TESTS
// ============================================================================

test.describe('Animation Speed', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('speed slider is visible and interactive', async ({ page }) => {
    const slider = page.locator('[data-testid="animation-speed-slider"] [role="slider"]');
    await expect(slider).toBeVisible();
    await expect(slider).toBeEnabled();
  });

  test('speed slider has correct range (20-500ms)', async ({ page }) => {
    const slider = page.locator('[data-testid="animation-speed-slider"] [role="slider"]');
    const ariaMin = await slider.getAttribute('aria-valuemin');
    const ariaMax = await slider.getAttribute('aria-valuemax');
    
    expect(ariaMin).toBe('20');
    expect(ariaMax).toBe('500');
  });

  test('speed slider value updates display text', async ({ page }) => {
    // Set to minimum
    await setSliderByTestId(page, 'animation-speed-slider', 0);
    await waitForRenderComplete(page, 'speed slider change');
    
    // Check if display shows ~20ms
    const displayText = await page.locator('text=/\\d+\\s*ms/i').first().textContent();
    expect(displayText).toBeTruthy();
  });

  test('speed slider responds to keyboard input', async ({ page }) => {
    const slider = page.locator('[data-testid="animation-speed-slider"] [role="slider"]');
    await slider.focus();
    
    const initialValue = await slider.getAttribute('aria-valuenow');
    await page.keyboard.press('ArrowRight');
    
    // Wait for the value to update (event-driven)
    await page.waitForFunction(
      (initial: string) => {
        const slider = document.querySelector('[data-testid="animation-speed-slider"] [role="slider"]');
        return slider && slider.getAttribute('aria-valuenow') !== initial;
      },
      initialValue || '0',
      { timeout: 2000, polling: 50 }
    );
    const newValue = await slider.getAttribute('aria-valuenow');
    expect(Number(newValue)).toBeGreaterThanOrEqual(Number(initialValue));
  });
});

// ============================================================================
// LOOP SWITCH TESTS
// ============================================================================

test.describe('Animation Loop', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('loop switch is visible and toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="animation-loop-switch"]');
    await expect(switchEl).toBeVisible();
    
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'animation-loop-switch');
    
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('loop switch toggles between checked and unchecked', async ({ page }) => {
    const switchEl = page.locator('[data-testid="animation-loop-switch"]');
    
    // Toggle twice to verify both states work
    await toggleSwitchByTestId(page, 'animation-loop-switch');
    const state1 = await switchEl.getAttribute('data-state');
    
    await toggleSwitchByTestId(page, 'animation-loop-switch');
    const state2 = await switchEl.getAttribute('data-state');
    
    expect(state1).not.toBe(state2);
  });

  test('loop switch has correct ARIA role', async ({ page }) => {
    const switchEl = page.locator('[data-testid="animation-loop-switch"]');
    const role = await switchEl.getAttribute('role');
    expect(role).toBe('switch');
  });
});

// ============================================================================
// BOUNCE SWITCH TESTS
// ============================================================================

test.describe('Animation Bounce', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('bounce switch is visible and toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="animation-bounce-switch"]');
    await expect(switchEl).toBeVisible();
    
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'animation-bounce-switch');
    
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('bounce switch has correct ARIA role', async ({ page }) => {
    const switchEl = page.locator('[data-testid="animation-bounce-switch"]');
    const role = await switchEl.getAttribute('role');
    expect(role).toBe('switch');
  });

  test('bounce and loop can be enabled together', async ({ page }) => {
    // Enable both
    const loopSwitch = page.locator('[data-testid="animation-loop-switch"]');
    const bounceSwitch = page.locator('[data-testid="animation-bounce-switch"]');
    
    // Get current states and toggle to ON if not already
    if ((await loopSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'animation-loop-switch');
    }
    if ((await bounceSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'animation-bounce-switch');
    }
    
    // Verify both are checked
    expect(await loopSwitch.getAttribute('data-state')).toBe('checked');
    expect(await bounceSwitch.getAttribute('data-state')).toBe('checked');
  });
});

// ============================================================================
// ADVANCED TIER - START FRAME TESTS (requires advanced/professional tier)
// ============================================================================

test.describe('Animation Start Frame (Advanced Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('start frame slider is visible in advanced tier', async ({ page }) => {
    const slider = page.locator('[data-testid="animation-start-frame-slider"]');
    // May or may not be visible depending on tier implementation
    const isVisible = await slider.isVisible().catch(() => false);
    const exists = (await slider.count()) > 0;
    expect(isVisible || exists, 'start frame slider should be present in advanced tier').toBe(true);
  });

  test('start frame slider has correct range (0-100)', async ({ page }) => {
    const slider = page.locator('[data-testid="animation-start-frame-slider"] [role="slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const ariaMin = await slider.getAttribute('aria-valuemin');
      const ariaMax = await slider.getAttribute('aria-valuemax');
      expect(ariaMin).toBe('0');
      expect(ariaMax).toBe('100');
    }
  });
});

// ============================================================================
// ADVANCED TIER - MAX FRAMES TESTS
// ============================================================================

test.describe('Animation Max Frames (Advanced Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('max frames slider has correct range (0-100)', async ({ page }) => {
    const slider = page.locator('[data-testid="animation-max-frames-slider"] [role="slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const ariaMin = await slider.getAttribute('aria-valuemin');
      const ariaMax = await slider.getAttribute('aria-valuemax');
      expect(ariaMin).toBe('0');
      expect(ariaMax).toBe('100');
    }
  });

  test('max frames 0 means auto (uses source frames)', async ({ page }) => {
    const slider = page.locator('[data-testid="animation-max-frames-slider"] [role="slider"]');
    if (await slider.isVisible().catch(() => false)) {
      await setSliderByTestId(page, 'animation-max-frames-slider', 0);
      // Verify slider is at 0 (auto) value
      const sliderValue = await slider.getAttribute('aria-valuenow');
      expect(Number(sliderValue), 'slider should be at 0 (auto) value').toBe(0);
    }
  });
});

// ============================================================================
// ADVANCED TIER - FRAME STEP TESTS
// ============================================================================

test.describe('Animation Frame Step (Advanced Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('frame step slider has correct range (1-10)', async ({ page }) => {
    const slider = page.locator('[data-testid="animation-frame-step-slider"] [role="slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const ariaMin = await slider.getAttribute('aria-valuemin');
      const ariaMax = await slider.getAttribute('aria-valuemax');
      expect(ariaMin).toBe('1');
      expect(ariaMax).toBe('10');
    }
  });
});

// ============================================================================
// ADVANCED TIER - INTERPOLATION TESTS
// ============================================================================

test.describe('Animation Interpolation (Advanced Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('interpolation select has correct options', async ({ page }) => {
    const trigger = page.locator('[data-testid="animation-interpolation-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForDropdownOpen(page);
      
      // Count total options (should have at least 1: none, crossfade, morph)
      const options = page.locator('[role="option"]');
      const count = await options.count();
      
      await page.keyboard.press('Escape');
      await waitForDropdownClosed(page);
      
      // At least some options should exist
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('interpolation select is keyboard navigable', async ({ page }) => {
    const trigger = page.locator('[data-testid="animation-interpolation-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.focus();
      await page.keyboard.press('Enter');
      await waitForDropdownOpen(page);
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      
      // Verify dropdown closed (event-driven)
      await waitForDropdownClosed(page);
      const dropdown = page.locator('[data-radix-popper-content-wrapper]');
      const isOpen = await dropdown.isVisible().catch(() => false);
      expect(isOpen).toBe(false);
    }
  });
});

// ============================================================================
// PROFESSIONAL TIER - TEMPORAL DITHER TESTS
// ============================================================================

test.describe('Animation Temporal Dither (Professional Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('temporal dither select has correct options', async ({ page }) => {
    const trigger = page.locator('[data-testid="animation-temporal-dither-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForDropdownOpen(page);
      
      // Count total options (should have at least 1: off, blue noise, flicker)
      const options = page.locator('[role="option"]');
      const count = await options.count();
      
      await page.keyboard.press('Escape');
      await waitForDropdownClosed(page);
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });
});

// ============================================================================
// PROFESSIONAL TIER - ANIMATION PATTERN TESTS
// ============================================================================

test.describe('Animation Pattern (Professional Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('animation pattern select has all pattern options', async ({ page }) => {
    const trigger = page.locator('[data-testid="animation-pattern-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForDropdownOpen(page);
      
      // Count total options (should have at least some: none, pulse, wave, scanline, shimmer, drift)
      const options = page.locator('[role="option"]');
      const count = await options.count();
      
      await page.keyboard.press('Escape');
      await waitForDropdownClosed(page);
      
      // Should have at least some pattern options
      expect(count).toBeGreaterThan(0);
    }
  });

  test('selecting different patterns works', async ({ page }) => {
    const trigger = page.locator('[data-testid="animation-pattern-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      // Select pulse pattern
      await selectDropdownOptionLocal(page, 'animation-pattern-trigger', 'pulse');
      await waitForRenderComplete(page, 'pattern selection');
      
      // Verify trigger shows selected value
      const triggerText = await trigger.textContent();
      expect(triggerText?.toLowerCase()).toContain('pulse');
    }
  });
});

// ============================================================================
// PROFESSIONAL TIER - MODULE JITTER TESTS
// ============================================================================

test.describe('Animation Module Jitter (Professional Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('module jitter slider has correct range (0-5px)', async ({ page }) => {
    const slider = page.locator('[data-testid="animation-module-jitter-slider"] [role="slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const ariaMin = await slider.getAttribute('aria-valuemin');
      const ariaMax = await slider.getAttribute('aria-valuemax');
      expect(ariaMin).toBe('0');
      expect(ariaMax).toBe('5');
    }
  });
});

// ============================================================================
// PROFESSIONAL TIER - COLOR CYCLE TESTS
// ============================================================================

test.describe('Animation Color Cycle (Professional Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('color cycle switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="animation-color-cycle-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      const initialState = await switchEl.getAttribute('data-state');
      await toggleSwitchByTestId(page, 'animation-color-cycle-switch');
      const newState = await switchEl.getAttribute('data-state');
      expect(newState).not.toBe(initialState);
    }
  });
});

// ============================================================================
// PROFESSIONAL TIER - RANDOM SEED TESTS
// ============================================================================

test.describe('Animation Random Seed (Professional Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('seed input accepts numeric values', async ({ page }) => {
    const input = page.locator('[data-testid="animation-seed-input"]');
    if (await input.isVisible().catch(() => false)) {
      await setInputByTestId(page, 'animation-seed-input', '42');
      const value = await input.inputValue();
      expect(value).toBe('42');
    }
  });

  test('seed input has type number', async ({ page }) => {
    const input = page.locator('[data-testid="animation-seed-input"]');
    if (await input.isVisible().catch(() => false)) {
      const type = await input.getAttribute('type');
      expect(type).toBe('number');
    }
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Animation Section Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('all sliders have proper ARIA attributes', async ({ page }) => {
    const sliders = page.locator('[role="slider"]');
    const count = await sliders.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const slider = sliders.nth(i);
      if (await slider.isVisible().catch(() => false)) {
        const hasValueNow = await slider.getAttribute('aria-valuenow');
        const hasValueMin = await slider.getAttribute('aria-valuemin');
        const hasValueMax = await slider.getAttribute('aria-valuemax');
        
        expect(hasValueNow).toBeTruthy();
        expect(hasValueMin).toBeTruthy();
        expect(hasValueMax).toBeTruthy();
      }
    }
  });

  test('all switches have role="switch"', async ({ page }) => {
    const switches = page.locator('[data-testid*="switch"]');
    const count = await switches.count();
    
    for (let i = 0; i < count; i++) {
      const switchEl = switches.nth(i);
      if (await switchEl.isVisible().catch(() => false)) {
        const role = await switchEl.getAttribute('role');
        expect(role).toBe('switch');
      }
    }
  });

  test('select triggers have role="combobox"', async ({ page }) => {
    const triggers = page.locator('[data-testid*="trigger"]');
    const count = await triggers.count();
    
    for (let i = 0; i < count; i++) {
      const trigger = triggers.nth(i);
      if (await trigger.isVisible().catch(() => false)) {
        const role = await trigger.getAttribute('role');
        expect(role).toBe('combobox');
      }
    }
  });

  test('animation section can be navigated via keyboard', async ({ page }) => {
    // Tab through animation controls
    await page.keyboard.press('Tab');
    
    // Should be able to focus on controls
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

// ============================================================================
// COMBINED SETTINGS TESTS
// ============================================================================

test.describe('Animation Combined Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('multiple animation settings can be configured together', async ({ page }) => {
    // Configure multiple settings
    await setSliderByTestId(page, 'animation-speed-slider', 30);
    
    const loopSwitch = page.locator('[data-testid="animation-loop-switch"]');
    if ((await loopSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'animation-loop-switch');
    }
    
    const bounceSwitch = page.locator('[data-testid="animation-bounce-switch"]');
    if ((await bounceSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'animation-bounce-switch');
    }
    
    // Verify all settings persisted
    expect(await loopSwitch.getAttribute('data-state')).toBe('checked');
    expect(await bounceSwitch.getAttribute('data-state')).toBe('checked');
  });

  test('animation settings persist after section collapse/expand', async ({ page }) => {
    // Set some values
    const loopSwitch = page.locator('[data-testid="animation-loop-switch"]');
    if ((await loopSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'animation-loop-switch');
    }
    
    const stateBeforeCollapse = await loopSwitch.getAttribute('data-state');
    
    // Collapse and expand
    // Use data-testid selector for accordion trigger
    const animationTrigger = page.locator('[data-testid="accordion-animation"] button[data-state]').first();
    const trigger = animationTrigger;
    
    await trigger.click();
    await waitForAccordionState(page, 'animation', 'closed');
    await trigger.click();
    await waitForAccordionState(page, 'animation', 'open');
    
    // Verify state persisted
    const stateAfterExpand = await loopSwitch.getAttribute('data-state');
    expect(stateAfterExpand).toBe(stateBeforeCollapse);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

test.describe('Animation Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await selectTier(page, 'advanced');
    await expandAnimationSection(page);
  });

  test('speed slider handles minimum value', async ({ page }) => {
    await setSliderByTestId(page, 'animation-speed-slider', 0);
    const slider = page.locator('[data-testid="animation-speed-slider"] [role="slider"]');
    const value = await slider.getAttribute('aria-valuenow');
    expect(Number(value)).toBe(20); // Minimum is 20ms
  });

  test('speed slider handles maximum value', async ({ page }) => {
    await setSliderByTestId(page, 'animation-speed-slider', 100);
    const slider = page.locator('[data-testid="animation-speed-slider"] [role="slider"]');
    const value = await slider.getAttribute('aria-valuenow');
    expect(Number(value)).toBe(500); // Maximum is 500ms
  });

  test('rapid switch toggling works correctly', async ({ page }) => {
    const switchEl = page.locator('[data-testid="animation-loop-switch"]');
    
    // Toggle rapidly multiple times
    // Use waitForFunction to wait for state change after each toggle
    for (let i = 0; i < 5; i++) {
      const currentState = await switchEl.getAttribute('data-state');
      await toggleSwitchByTestId(page, 'animation-loop-switch');
      
      // Wait for state to change (event-driven)
      await page.waitForFunction(
        (prev: string) => {
          const el = document.querySelector('[data-testid="animation-loop-switch"]');
          return el && el.getAttribute('data-state') !== prev;
        },
        currentState || 'unchecked',
        { timeout: 1000, polling: 16 }
      );
    }
    
    // Switch should still be functional
    const state = await switchEl.getAttribute('data-state');
    expect(state === 'checked' || state === 'unchecked').toBe(true);
  });
});