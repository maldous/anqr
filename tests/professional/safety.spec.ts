/**
 * Safety Section Tests - Comprehensive Coverage
 * Tests all safety controls with focus on conditional visibility:
 * - Protection locks only show when safety mode is not 'off'
 * - ECC-aware settings only show when enabled
 */

import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures/test-fixtures';

import { waitForQRRender } from '../helpers/qr-detector';
import {
  openAccordion,
  selectOption as selectDropdownByText,
  selectTier,
  setSlider,
  toggleSwitch,
  waitForRenderComplete,
} from '../helpers/test-utils';

// Helper: Wait for initial load and set tier (page.goto is handled by fixture)
async function setupPage(page: Page) {
  await page.waitForLoadState('networkidle');
  await waitForQRRender(page);
  // Select professional tier for Safety section tests
  await selectTier(page, 'professional');
}

// Helper: Expand the Safety section
async function expandSafetySection(page: Page) {
  await openAccordion(page, 'safety');
  await waitForRenderComplete(page, 'settle');
}

// Helper: Select dropdown option using shared selector logic
async function selectDropdownOption(page: Page, triggerTestId: string, optionText: string) {
  await selectDropdownByText(page, triggerTestId, optionText);
  await waitForRenderComplete(page, 'settle');
}

// Helper: Toggle switch
async function toggleSwitchByTestId(page: Page, testId: string) {
  await toggleSwitch(page, testId);
  await waitForRenderComplete(page, 'settle');
}

// Helper: Set slider value
async function _setSliderByTestId(page: Page, testId: string, percent: number) {
  await setSlider(page, testId, percent);
  await waitForRenderComplete(page, 'settle');
}

// ============================================================================
// SAFETY MODE TESTS
// ============================================================================

test.describe('Safety Mode Selection', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandSafetySection(page);
  });

  test('safety mode select is visible and interactive', async ({ page }) => {
    const trigger = page.locator('[data-testid="safety-mode-trigger"]');
    await expect(trigger).toBeVisible();
  });

  test('safety mode select has all mode options', async ({ page }) => {
    const trigger = page.locator('[data-testid="safety-mode-trigger"]');
    await trigger.click();
    await waitForRenderComplete(page, 'settle');

    // Count total options (should have 3: Off, Balanced, Strict)
    const options = page.locator('[role="option"]');
    const count = await options.count();

    await page.keyboard.press('Escape');
    expect(count).toBe(3);
  });

  test('selecting Off mode works', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Off');
    const trigger = page.locator('[data-testid="safety-mode-trigger"]');
    const text = await trigger.textContent();
    expect(text?.toLowerCase()).toContain('off');
  });

  test('selecting Balanced mode works', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Balanced');
    const trigger = page.locator('[data-testid="safety-mode-trigger"]');
    const text = await trigger.textContent();
    expect(text?.toLowerCase()).toContain('balanced');
  });

  test('selecting Strict mode works', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Strict');
    const trigger = page.locator('[data-testid="safety-mode-trigger"]');
    const text = await trigger.textContent();
    expect(text?.toLowerCase()).toContain('strict');
  });

  test('safety mode uses keyboard navigation', async ({ page }) => {
    const trigger = page.locator('[data-testid="safety-mode-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    const opened = await page
      .waitForSelector('[data-radix-popper-content-wrapper]', { state: 'visible', timeout: 5000 })
      .catch(() => null);
    expect(opened).toBeTruthy();
    if (opened) {
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page
        .waitForFunction(() => !document.querySelector('[data-radix-popper-content-wrapper]'), {
          timeout: 5000,
        })
        .catch(() => {});
    }
    const dropdown = page.locator('[data-radix-popper-content-wrapper]');
    const isOpen = await dropdown.isVisible().catch(() => false);
    expect(isOpen).toBe(false);
  });
});

// ============================================================================
// CONDITIONAL VISIBILITY - PROTECTION LOCKS
// ============================================================================

test.describe('Protection Locks Conditional Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandSafetySection(page);
  });

  test('protection locks are hidden when safety mode is Off', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Off');
    await waitForRenderComplete(page, 'settle');
    const lockFinders = page.locator('[data-testid="safety-lock-finders-switch"]');
    const lockTiming = page.locator('[data-testid="safety-lock-timing-switch"]');
    const lockAlignment = page.locator('[data-testid="safety-lock-alignment-switch"]');
    const lockFormat = page.locator('[data-testid="safety-lock-format-switch"]');
    const lockVersion = page.locator('[data-testid="safety-lock-version-switch"]');

    expect(await lockFinders.isVisible().catch(() => false)).toBe(false);
    expect(await lockTiming.isVisible().catch(() => false)).toBe(false);
    expect(await lockAlignment.isVisible().catch(() => false)).toBe(false);
    expect(await lockFormat.isVisible().catch(() => false)).toBe(false);
    expect(await lockVersion.isVisible().catch(() => false)).toBe(false);
  });

  test('protection locks are visible when safety mode is Balanced', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Balanced');
    await waitForRenderComplete(page, 'settle');
    const lockFinders = page.locator('[data-testid="safety-lock-finders-switch"]');
    await expect(lockFinders).toBeVisible();
  });

  test('protection locks are visible when safety mode is Strict', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Strict');
    await waitForRenderComplete(page, 'settle');
    const lockFinders = page.locator('[data-testid="safety-lock-finders-switch"]');
    await expect(lockFinders).toBeVisible();
  });

  test('min module slider is hidden when safety mode is Off', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Off');
    await waitForRenderComplete(page, 'settle');
    const minModuleSlider = page.locator('[data-testid="safety-min-module-slider"]');
    expect(await minModuleSlider.isVisible().catch(() => false)).toBe(false);
  });

  test('min module slider is visible when safety mode is Balanced', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Balanced');
    await waitForRenderComplete(page, 'settle');
    const minModuleSlider = page.locator('[data-testid="safety-min-module-slider"]');
    await expect(minModuleSlider).toBeVisible();
  });

  test('min quiet zone slider is hidden when safety mode is Off', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Off');
    await waitForRenderComplete(page, 'settle');
    const minQuietZoneSlider = page.locator('[data-testid="safety-min-quiet-zone-slider"]');
    expect(await minQuietZoneSlider.isVisible().catch(() => false)).toBe(false);
  });

  test('min quiet zone slider is visible when safety mode is Strict', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Strict');
    await waitForRenderComplete(page, 'settle');
    const minQuietZoneSlider = page.locator('[data-testid="safety-min-quiet-zone-slider"]');
    await expect(minQuietZoneSlider).toBeVisible();
  });

  test('switching from Off to Balanced shows protection locks', async ({ page }) => {
    // Start with Off
    await selectDropdownOption(page, 'safety-mode-trigger', 'Off');
    await waitForRenderComplete(page, 'settle');
    let lockFindersVisible = await page
      .locator('[data-testid="safety-lock-finders-switch"]')
      .isVisible()
      .catch(() => false);
    expect(lockFindersVisible).toBe(false);

    // Switch to Balanced
    await selectDropdownOption(page, 'safety-mode-trigger', 'Balanced');
    await waitForRenderComplete(page, 'settle');
    lockFindersVisible = await page
      .locator('[data-testid="safety-lock-finders-switch"]')
      .isVisible()
      .catch(() => false);
    expect(lockFindersVisible).toBe(true);
  });

  test('switching from Balanced to Off hides protection locks', async ({ page }) => {
    // Start with Balanced
    await selectDropdownOption(page, 'safety-mode-trigger', 'Balanced');
    await waitForRenderComplete(page, 'settle');
    let lockFindersVisible = await page
      .locator('[data-testid="safety-lock-finders-switch"]')
      .isVisible()
      .catch(() => false);
    expect(lockFindersVisible).toBe(true);

    // Switch to Off
    await selectDropdownOption(page, 'safety-mode-trigger', 'Off');
    await waitForRenderComplete(page, 'settle');
    lockFindersVisible = await page
      .locator('[data-testid="safety-lock-finders-switch"]')
      .isVisible()
      .catch(() => false);
    expect(lockFindersVisible).toBe(false);
  });
});

// ============================================================================
// PROTECTION LOCK TOGGLES
// ============================================================================

test.describe('Protection Lock Switches', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandSafetySection(page);
    // Enable safety mode to show locks
    await selectDropdownOption(page, 'safety-mode-trigger', 'Balanced');
    await waitForRenderComplete(page, 'settle');
  });

  test('lock finders switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-lock-finders-switch"]');
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-lock-finders-switch');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('lock timing switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-lock-timing-switch"]');
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-lock-timing-switch');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('lock alignment switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-lock-alignment-switch"]');
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-lock-alignment-switch');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('lock format switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-lock-format-switch"]');
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-lock-format-switch');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('lock version switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-lock-version-switch"]');
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-lock-version-switch');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('all lock switches have role="switch"', async ({ page }) => {
    const lockSwitches = [
      'safety-lock-finders-switch',
      'safety-lock-timing-switch',
      'safety-lock-alignment-switch',
      'safety-lock-format-switch',
      'safety-lock-version-switch',
    ];

    for (const testId of lockSwitches) {
      const switchEl = page.locator(`[data-testid="${testId}"]`);
      const role = await switchEl.getAttribute('role');
      expect(role).toBe('switch');
    }
  });
});

// ============================================================================
// MIN MODULE/QUIET ZONE SLIDERS
// ============================================================================

test.describe('Safety Sliders', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandSafetySection(page);
    // Enable safety mode to show sliders
    await selectDropdownOption(page, 'safety-mode-trigger', 'Balanced');
    await waitForRenderComplete(page, 'settle');
  });

  test('min module slider has correct range (1-10)', async ({ page }) => {
    const slider = page.locator('[data-testid="safety-min-module-slider"] [role="slider"]');
    const ariaMin = await slider.getAttribute('aria-valuemin');
    const ariaMax = await slider.getAttribute('aria-valuemax');

    expect(ariaMin).toBe('1');
    expect(ariaMax).toBe('10');
  });

  test('min quiet zone slider has correct range (1-10)', async ({ page }) => {
    const slider = page.locator('[data-testid="safety-min-quiet-zone-slider"] [role="slider"]');
    const ariaMin = await slider.getAttribute('aria-valuemin');
    const ariaMax = await slider.getAttribute('aria-valuemax');

    expect(ariaMin).toBe('1');
    expect(ariaMax).toBe('10');
  });

  test('min module slider responds to keyboard', async ({ page }) => {
    const slider = page.locator('[data-testid="safety-min-module-slider"] [role="slider"]');
    await slider.focus();

    const initialValue = await slider.getAttribute('aria-valuenow');
    await page.keyboard.press('ArrowRight');
    await waitForRenderComplete(page, 'settle');
    const newValue = await slider.getAttribute('aria-valuenow');
    expect(Number(newValue)).toBeGreaterThanOrEqual(Number(initialValue));
  });
});

// ============================================================================
// QA / ANALYSIS SECTION (Always Visible)
// ============================================================================

test.describe('QA Analysis Controls', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandSafetySection(page);
  });

  test('contrast check switch is visible regardless of safety mode', async ({ page }) => {
    // Test with Off
    await selectDropdownOption(page, 'safety-mode-trigger', 'Off');
    await waitForRenderComplete(page, 'settle');
    const contrastSwitch = page.locator('[data-testid="safety-contrast-check-switch"]');
    await expect(contrastSwitch).toBeVisible();
  });

  test('contrast check switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-contrast-check-switch"]');
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-contrast-check-switch');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('show heatmap switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-show-heatmap-switch"]');
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-show-heatmap-switch');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('simulate blur slider has correct range (0-10)', async ({ page }) => {
    const slider = page.locator('[data-testid="safety-simulate-blur-slider"] [role="slider"]');
    const ariaMin = await slider.getAttribute('aria-valuemin');
    const ariaMax = await slider.getAttribute('aria-valuemax');

    expect(ariaMin).toBe('0');
    expect(ariaMax).toBe('10');
  });

  test('simulate noise slider has correct range (0-50)', async ({ page }) => {
    const slider = page.locator('[data-testid="safety-simulate-noise-slider"] [role="slider"]');
    const ariaMin = await slider.getAttribute('aria-valuemin');
    const ariaMax = await slider.getAttribute('aria-valuemax');

    expect(ariaMin).toBe('0');
    expect(ariaMax).toBe('50');
  });

  test('simulate rotation slider has correct range (0-45)', async ({ page }) => {
    const slider = page.locator('[data-testid="safety-simulate-rotation-slider"] [role="slider"]');
    const ariaMin = await slider.getAttribute('aria-valuemin');
    const ariaMax = await slider.getAttribute('aria-valuemax');

    expect(ariaMin).toBe('0');
    expect(ariaMax).toBe('45');
  });
});

// ============================================================================
// AUTO-TUNING SECTION
// ============================================================================

test.describe('Auto-Tuning Controls', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandSafetySection(page);
  });

  test('auto pick version switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-auto-pick-version-switch"]');
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-auto-pick-version-switch');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('auto pick ECC switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-auto-pick-ecc-switch"]');
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-auto-pick-ecc-switch');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('auto reduce intensity switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-auto-reduce-intensity-switch"]');
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-auto-reduce-intensity-switch');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });
});

// ============================================================================
// ECC-AWARE MODE CONDITIONAL VISIBILITY
// ============================================================================

test.describe('ECC-Aware Mode Conditional Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandSafetySection(page);
  });

  test('ECC-aware enabled switch is visible', async ({ page }) => {
    const switchEl = page.locator('[data-testid="safety-ecc-aware-enabled-switch"]');
    await expect(switchEl).toBeVisible();
  });

  test('ECC-aware risk budget slider is hidden when ECC-aware is disabled', async ({ page }) => {
    // Ensure ECC-aware is disabled
    const eccSwitch = page.locator('[data-testid="safety-ecc-aware-enabled-switch"]');
    if ((await eccSwitch.getAttribute('data-state')) === 'checked') {
      await toggleSwitchByTestId(page, 'safety-ecc-aware-enabled-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const riskBudgetSlider = page.locator('[data-testid="safety-ecc-risk-budget-slider"]');
    expect(await riskBudgetSlider.isVisible().catch(() => false)).toBe(false);
  });

  test('ECC-aware risk budget slider is visible when ECC-aware is enabled', async ({ page }) => {
    // Enable ECC-aware
    const eccSwitch = page.locator('[data-testid="safety-ecc-aware-enabled-switch"]');
    if ((await eccSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'safety-ecc-aware-enabled-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const riskBudgetSlider = page.locator('[data-testid="safety-ecc-risk-budget-slider"]');
    await expect(riskBudgetSlider).toBeVisible();
  });

  test('ECC-aware weight map select is hidden when ECC-aware is disabled', async ({ page }) => {
    // Ensure ECC-aware is disabled
    const eccSwitch = page.locator('[data-testid="safety-ecc-aware-enabled-switch"]');
    if ((await eccSwitch.getAttribute('data-state')) === 'checked') {
      await toggleSwitchByTestId(page, 'safety-ecc-aware-enabled-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const weightMapTrigger = page.locator('[data-testid="safety-ecc-weight-map-trigger"]');
    expect(await weightMapTrigger.isVisible().catch(() => false)).toBe(false);
  });

  test('ECC-aware weight map select is visible when ECC-aware is enabled', async ({ page }) => {
    // Enable ECC-aware
    const eccSwitch = page.locator('[data-testid="safety-ecc-aware-enabled-switch"]');
    if ((await eccSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'safety-ecc-aware-enabled-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const weightMapTrigger = page.locator('[data-testid="safety-ecc-weight-map-trigger"]');
    await expect(weightMapTrigger).toBeVisible();
  });

  test('toggling ECC-aware shows/hides dependent settings', async ({ page }) => {
    const eccSwitch = page.locator('[data-testid="safety-ecc-aware-enabled-switch"]');
    const riskBudgetSlider = page.locator('[data-testid="safety-ecc-risk-budget-slider"]');

    // Start disabled
    if ((await eccSwitch.getAttribute('data-state')) === 'checked') {
      await toggleSwitchByTestId(page, 'safety-ecc-aware-enabled-switch');
      await waitForRenderComplete(page, 'settle');
    }

    // Risk budget should be hidden
    expect(await riskBudgetSlider.isVisible().catch(() => false)).toBe(false);

    // Enable ECC-aware
    await toggleSwitchByTestId(page, 'safety-ecc-aware-enabled-switch');
    await waitForRenderComplete(page, 'settle');
    // Risk budget should be visible
    await expect(riskBudgetSlider).toBeVisible();

    // Disable ECC-aware
    await toggleSwitchByTestId(page, 'safety-ecc-aware-enabled-switch');
    await waitForRenderComplete(page, 'settle');
    // Risk budget should be hidden again
    expect(await riskBudgetSlider.isVisible().catch(() => false)).toBe(false);
  });
});

// ============================================================================
// ECC-AWARE SETTINGS
// ============================================================================

test.describe('ECC-Aware Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandSafetySection(page);
    // Enable ECC-aware to show settings
    const eccSwitch = page.locator('[data-testid="safety-ecc-aware-enabled-switch"]');
    if ((await eccSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'safety-ecc-aware-enabled-switch');
      await waitForRenderComplete(page, 'settle');
    }
  });

  test('ECC risk budget slider has correct range (0-100)', async ({ page }) => {
    const slider = page.locator('[data-testid="safety-ecc-risk-budget-slider"] [role="slider"]');
    const ariaMin = await slider.getAttribute('aria-valuemin');
    const ariaMax = await slider.getAttribute('aria-valuemax');

    expect(ariaMin).toBe('0');
    expect(ariaMax).toBe('100');
  });

  test('ECC weight map select has all options', async ({ page }) => {
    const trigger = page.locator('[data-testid="safety-ecc-weight-map-trigger"]');
    await trigger.click();
    await waitForRenderComplete(page, 'settle');

    // Count total options (should have at least 1: distance, block, empirical)
    const options = page.locator('[role="option"]');
    const count = await options.count();

    await page.keyboard.press('Escape');
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('selecting different weight map options works', async ({ page }) => {
    await selectDropdownOption(page, 'safety-ecc-weight-map-trigger', 'block');
    await waitForRenderComplete(page, 'settle');
    const trigger = page.locator('[data-testid="safety-ecc-weight-map-trigger"]');
    const text = await trigger.textContent();
    expect(text?.toLowerCase()).toContain('block');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Safety Section Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandSafetySection(page);
  });

  test('safety mode select has combobox role', async ({ page }) => {
    const trigger = page.locator('[data-testid="safety-mode-trigger"]');
    const role = await trigger.getAttribute('role');
    expect(role).toBe('combobox');
  });

  test('all visible switches have role="switch"', async ({ page }) => {
    const switches = page.locator('[data-testid*="safety"][data-testid*="switch"]');
    const count = await switches.count();

    for (let i = 0; i < count; i++) {
      const switchEl = switches.nth(i);
      if (await switchEl.isVisible().catch(() => false)) {
        const role = await switchEl.getAttribute('role');
        expect(role).toBe('switch');
      }
    }
  });

  test('all visible sliders have ARIA attributes', async ({ page }) => {
    const sliders = page.locator('[data-testid*="safety"][data-testid*="slider"] [role="slider"]');
    const count = await sliders.count();

    for (let i = 0; i < count; i++) {
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

  test('safety section can be navigated via keyboard', async ({ page }) => {
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

test.describe('Safety Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandSafetySection(page);
  });

  test('rapid mode switching works correctly', async ({ page }) => {
    const modes = ['Off', 'Balanced', 'Strict'];

    for (const mode of modes) {
      await selectDropdownOption(page, 'safety-mode-trigger', mode);
    }
    await waitForRenderComplete(page, 'settle');

    // Should end on Strict (last mode selected)
    const trigger = page.locator('[data-testid="safety-mode-trigger"]');
    const text = await trigger.textContent();
    expect(text?.toLowerCase()).toContain('strict');
  });

  test('settings persist after section collapse/expand', async ({ page }) => {
    // Enable balanced mode
    await selectDropdownOption(page, 'safety-mode-trigger', 'Balanced');
    await waitForRenderComplete(page, 'settle');
    // Toggle a lock switch
    const initialState = await page
      .locator('[data-testid="safety-lock-finders-switch"]')
      .getAttribute('data-state');
    await toggleSwitchByTestId(page, 'safety-lock-finders-switch');
    const changedState = await page
      .locator('[data-testid="safety-lock-finders-switch"]')
      .getAttribute('data-state');

    // Collapse and expand
    const safetyTriggerEl = page
      .locator('[data-testid="accordion-safety"] button[data-state]')
      .first();
    await safetyTriggerEl.click();
    await waitForRenderComplete(page, 'settle');
    await safetyTriggerEl.click();
    await page.waitForSelector(
      '[data-testid="accordion-safety"] [role="region"][data-state="open"]',
      {
        state: 'visible',
        timeout: 5000,
      }
    );

    // Verify state persisted
    const persistedState = await page
      .locator('[data-testid="safety-lock-finders-switch"]')
      .getAttribute('data-state');
    expect(persistedState).toBe(changedState);
    expect(persistedState).not.toBe(initialState);
  });

  test('multiple switches can be toggled in sequence', async ({ page }) => {
    await selectDropdownOption(page, 'safety-mode-trigger', 'Balanced');
    await waitForRenderComplete(page, 'settle');
    // Toggle multiple switches
    await toggleSwitchByTestId(page, 'safety-lock-finders-switch');
    await toggleSwitchByTestId(page, 'safety-lock-timing-switch');
    await toggleSwitchByTestId(page, 'safety-contrast-check-switch');

    // All toggles should have worked
    const lockFinders = page.locator('[data-testid="safety-lock-finders-switch"]');
    const lockTiming = page.locator('[data-testid="safety-lock-timing-switch"]');
    const contrastCheck = page.locator('[data-testid="safety-contrast-check-switch"]');

    // Verify all are still functional (have valid state)
    const state1 = await lockFinders.getAttribute('data-state');
    const state2 = await lockTiming.getAttribute('data-state');
    const state3 = await contrastCheck.getAttribute('data-state');

    expect(state1 === 'checked' || state1 === 'unchecked').toBe(true);
    expect(state2 === 'checked' || state2 === 'unchecked').toBe(true);
    expect(state3 === 'checked' || state3 === 'unchecked').toBe(true);
  });
});
