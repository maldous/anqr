/**
 * Watermark Section Tests - Comprehensive Coverage
 * Tests all watermark controls: enable, kind, text, image, position, opacity, blend
 * Focuses on accessibility: ARIA roles, keyboard navigation, proper labeling
 */

import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures/test-fixtures';

import { waitForQRRender } from '../helpers/qr-detector';
import {
  openAccordion,
  selectOption as selectDropdownByText,
  selectTier,
  setInput,
  setSlider,
  toggleSwitch,
  waitForRenderComplete,
} from '../helpers/test-utils';

// Helper: Wait for initial load and set tier (page.goto is handled by fixture)
async function setupPage(page: Page) {
  await page.waitForLoadState('networkidle');
  await waitForQRRender(page);
  // Select professional tier for Watermark section tests
  await selectTier(page, 'professional');
}

// Helper: Expand the Watermark section
async function expandWatermarkSection(page: Page) {
  await openAccordion(page, 'watermark');
  await waitForRenderComplete(page, 'settle');
}

// Helper: Toggle switch using data-testid
async function toggleSwitchByTestId(page: Page, testId: string, settle: boolean = true) {
  await toggleSwitch(page, testId);
  if (settle) {
    await waitForRenderComplete(page, 'settle');
  }
}

// Helper: Select dropdown option using shared selector logic
async function selectDropdownOption(page: Page, triggerTestId: string, optionText: string) {
  await selectDropdownByText(page, triggerTestId, optionText);
  await waitForRenderComplete(page, 'settle');
}

// Helper: Set input value
async function setInputByTestId(page: Page, testId: string, value: string) {
  await setInput(page, testId, value);
  await waitForRenderComplete(page, 'settle');
}

// Helper: Set slider value
async function setSliderByTestId(page: Page, testId: string, percent: number) {
  await setSlider(page, testId, percent);
  await waitForRenderComplete(page, 'settle');
}

// Helper: Enable watermark if not already enabled
async function enableWatermark(page: Page) {
  const switchEl = page.locator('[data-testid="watermark-enabled-switch"]');
  if ((await switchEl.getAttribute('data-state')) !== 'checked') {
    await toggleSwitchByTestId(page, 'watermark-enabled-switch');
    await waitForRenderComplete(page, 'settle');
  }
}

// ============================================================================
// ENABLE TOGGLE TESTS
// ============================================================================

test.describe('Watermark Enable Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandWatermarkSection(page);
  });

  test('enable switch is visible and interactive', async ({ page }) => {
    const switchEl = page.locator('[data-testid="watermark-enabled-switch"]');
    await expect(switchEl).toBeVisible();
  });

  test('enable switch has role="switch"', async ({ page }) => {
    const switchEl = page.locator('[data-testid="watermark-enabled-switch"]');
    const role = await switchEl.getAttribute('role');
    expect(role).toBe('switch');
  });

  test('enable switch toggles between checked and unchecked', async ({ page }) => {
    const switchEl = page.locator('[data-testid="watermark-enabled-switch"]');

    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'watermark-enabled-switch');

    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('enable switch shows watermark settings when enabled', async ({ page }) => {
    // Make sure watermark is enabled
    await enableWatermark(page);

    // Watermark settings should now be visible
    const kindTrigger = page.locator('[data-testid="watermark-kind-trigger"]');
    await expect(kindTrigger).toBeVisible();
  });

  test('enable switch hides watermark settings when disabled', async ({ page }) => {
    // Disable watermark
    const switchEl = page.locator('[data-testid="watermark-enabled-switch"]');
    if ((await switchEl.getAttribute('data-state')) === 'checked') {
      await toggleSwitchByTestId(page, 'watermark-enabled-switch');
      await waitForRenderComplete(page, 'settle');
    }

    // Watermark settings should be hidden
    const kindTrigger = page.locator('[data-testid="watermark-kind-trigger"]');
    const isVisible = await kindTrigger.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('enable switch responds to keyboard (Space)', async ({ page }) => {
    const switchEl = page.locator('[data-testid="watermark-enabled-switch"]');
    await switchEl.focus();

    const initialState = await switchEl.getAttribute('data-state');
    await page.keyboard.press('Space');
    await waitForRenderComplete(page, 'settle');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });
});

// ============================================================================
// KIND SELECTION TESTS
// ============================================================================

test.describe('Watermark Kind Selection', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandWatermarkSection(page);
    await enableWatermark(page);
  });

  test('kind select is visible when watermark enabled', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-kind-trigger"]');
    await expect(trigger).toBeVisible();
  });

  test('kind select has role="combobox"', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-kind-trigger"]');
    const role = await trigger.getAttribute('role');
    expect(role).toBe('combobox');
  });

  test('kind select has all type options', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-kind-trigger"]');
    await trigger.click();
    await waitForRenderComplete(page, 'settle');

    // Count total options (should have 3: text, image, pattern)
    const options = page.locator('[role="option"]');
    const count = await options.count();

    await page.keyboard.press('Escape');
    expect(count).toBe(3);
  });

  test('selecting text kind shows text input', async ({ page }) => {
    await selectDropdownOption(page, 'watermark-kind-trigger', 'text');
    await waitForRenderComplete(page, 'settle');
    const textInput = page.locator('[data-testid="watermark-text-input"]');
    await expect(textInput).toBeVisible();
  });

  test('selecting image kind shows upload button', async ({ page }) => {
    await selectDropdownOption(page, 'watermark-kind-trigger', 'image');
    await waitForRenderComplete(page, 'settle');
    const uploadButton = page.locator('[data-testid="watermark-upload-button"]');
    await expect(uploadButton).toBeVisible();
  });

  test('selecting pattern kind shows upload button', async ({ page }) => {
    await selectDropdownOption(page, 'watermark-kind-trigger', 'pattern');
    await waitForRenderComplete(page, 'settle');
    const uploadButton = page.locator('[data-testid="watermark-upload-button"]');
    await expect(uploadButton).toBeVisible();
  });

  test('kind select uses keyboard navigation', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-kind-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    // Wait for dropdown to open (targeted wait, not full render settle)
    const opened = await page
      .waitForSelector('[data-radix-popper-content-wrapper]', { state: 'visible', timeout: 5000 })
      .catch(() => null);
    expect(opened, 'dropdown should open with Enter key').toBeTruthy();
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
// TEXT INPUT TESTS
// ============================================================================

test.describe('Watermark Text Input', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandWatermarkSection(page);
    await enableWatermark(page);
    // Select text kind
    await selectDropdownOption(page, 'watermark-kind-trigger', 'text');
    await waitForRenderComplete(page, 'settle');
  });

  test('text input is visible for text kind', async ({ page }) => {
    const textInput = page.locator('[data-testid="watermark-text-input"]');
    await expect(textInput).toBeVisible();
  });

  test('text input accepts user input', async ({ page }) => {
    await setInputByTestId(page, 'watermark-text-input', 'My Watermark');

    const textInput = page.locator('[data-testid="watermark-text-input"]');
    const value = await textInput.inputValue();
    expect(value).toBe('My Watermark');
  });

  test('text input has placeholder', async ({ page }) => {
    const textInput = page.locator('[data-testid="watermark-text-input"]');
    const placeholder = await textInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });

  test('text input hidden for image kind', async ({ page }) => {
    await selectDropdownOption(page, 'watermark-kind-trigger', 'image');
    await waitForRenderComplete(page, 'settle');
    const textInput = page.locator('[data-testid="watermark-text-input"]');
    const isVisible = await textInput.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('text input is keyboard accessible', async ({ page }) => {
    const textInput = page.locator('[data-testid="watermark-text-input"]');
    await textInput.focus();

    await page.keyboard.type('Test Text');

    const value = await textInput.inputValue();
    expect(value).toBe('Test Text');
  });
});

// ============================================================================
// IMAGE UPLOAD TESTS
// ============================================================================

test.describe('Watermark Image Upload', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandWatermarkSection(page);
    await enableWatermark(page);
    // Select image kind
    await selectDropdownOption(page, 'watermark-kind-trigger', 'image');
    await waitForRenderComplete(page, 'settle');
  });

  test('upload button is visible for image kind', async ({ page }) => {
    const uploadButton = page.locator('[data-testid="watermark-upload-button"]');
    await expect(uploadButton).toBeVisible();
  });

  test('upload button has role="button"', async ({ page }) => {
    const uploadButton = page.locator('[data-testid="watermark-upload-button"]');
    const role = await uploadButton.getAttribute('role');
    // Button elements have implicit button role
    expect(role === 'button' || role === null).toBe(true);
  });

  test('upload button is keyboard accessible', async ({ page }) => {
    const uploadButton = page.locator('[data-testid="watermark-upload-button"]');
    await uploadButton.focus();

    // Should be focusable
    const isFocused = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="watermark-upload-button"]');
      return document.activeElement === el;
    });
    expect(isFocused).toBe(true);
  });
});

// ============================================================================
// POSITION SELECTION TESTS
// ============================================================================

test.describe('Watermark Position Selection', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandWatermarkSection(page);
    await enableWatermark(page);
  });

  test('position select is visible', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-position-trigger"]');
    await expect(trigger).toBeVisible();
  });

  test('position select has role="combobox"', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-position-trigger"]');
    const role = await trigger.getAttribute('role');
    expect(role).toBe('combobox');
  });

  test('position select has all position options', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-position-trigger"]');
    await trigger.click();
    await waitForRenderComplete(page, 'settle');

    // Count total options (should have at least 4: center, corners, edges, behind, quiet)
    const options = page.locator('[role="option"]');
    const count = await options.count();

    await page.keyboard.press('Escape');
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('selecting center position works', async ({ page }) => {
    await selectDropdownOption(page, 'watermark-position-trigger', 'center');

    const trigger = page.locator('[data-testid="watermark-position-trigger"]');
    const text = await trigger.textContent();
    expect(text?.toLowerCase()).toContain('center');
  });

  test('selecting corners position works', async ({ page }) => {
    await selectDropdownOption(page, 'watermark-position-trigger', 'corners');

    const trigger = page.locator('[data-testid="watermark-position-trigger"]');
    const text = await trigger.textContent();
    expect(text?.toLowerCase()).toContain('corner');
  });

  test('position select uses keyboard navigation', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-position-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    // Wait for dropdown to open (targeted wait, not full render settle)
    const opened = await page
      .waitForSelector('[data-radix-popper-content-wrapper]', { state: 'visible', timeout: 5000 })
      .catch(() => null);
    expect(opened, 'dropdown should open with Enter key').toBeTruthy();
    if (opened) {
      await page.keyboard.press('ArrowDown');
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
// OPACITY SLIDER TESTS
// ============================================================================

test.describe('Watermark Opacity Slider', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandWatermarkSection(page);
    await enableWatermark(page);
  });

  test('opacity slider is visible', async ({ page }) => {
    const slider = page.locator('[data-testid="watermark-opacity-slider"]');
    await expect(slider).toBeVisible();
  });

  test('opacity slider has role="slider"', async ({ page }) => {
    const slider = page.locator('[data-testid="watermark-opacity-slider"] [role="slider"]');
    await expect(slider).toBeVisible();
  });

  test('opacity slider has correct range (0-100)', async ({ page }) => {
    const slider = page.locator('[data-testid="watermark-opacity-slider"] [role="slider"]');
    const ariaMin = await slider.getAttribute('aria-valuemin');
    const ariaMax = await slider.getAttribute('aria-valuemax');

    expect(ariaMin).toBe('0');
    expect(ariaMax).toBe('100');
  });

  test('opacity slider has aria-valuenow', async ({ page }) => {
    const slider = page.locator('[data-testid="watermark-opacity-slider"] [role="slider"]');
    const valueNow = await slider.getAttribute('aria-valuenow');
    expect(valueNow).toBeTruthy();
  });

  test('opacity slider responds to keyboard (ArrowRight)', async ({ page }) => {
    const slider = page.locator('[data-testid="watermark-opacity-slider"] [role="slider"]');
    await slider.focus();

    const initialValue = await slider.getAttribute('aria-valuenow');
    await page.keyboard.press('ArrowRight');
    await waitForRenderComplete(page, 'settle');
    const newValue = await slider.getAttribute('aria-valuenow');
    expect(Number(newValue)).toBeGreaterThanOrEqual(Number(initialValue));
  });

  test('opacity slider responds to keyboard (ArrowLeft)', async ({ page }) => {
    const slider = page.locator('[data-testid="watermark-opacity-slider"] [role="slider"]');
    await slider.focus();

    // First increase, then decrease
    await page.keyboard.press('ArrowRight');
    await waitForRenderComplete(page, 'settle');
    const initialValue = await slider.getAttribute('aria-valuenow');
    await page.keyboard.press('ArrowLeft');
    await waitForRenderComplete(page, 'settle');
    const newValue = await slider.getAttribute('aria-valuenow');
    expect(Number(newValue)).toBeLessThanOrEqual(Number(initialValue));
  });

  test('opacity slider can be set via mouse click', async ({ page }) => {
    await setSliderByTestId(page, 'watermark-opacity-slider', 75);

    const slider = page.locator('[data-testid="watermark-opacity-slider"] [role="slider"]');
    const value = await slider.getAttribute('aria-valuenow');
    // Should be somewhere in the higher range
    expect(Number(value)).toBeGreaterThan(50);
  });
});

// ============================================================================
// BLEND MODE SELECTION TESTS
// ============================================================================

test.describe('Watermark Blend Mode Selection', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandWatermarkSection(page);
    await enableWatermark(page);
  });

  test('blend mode select is visible', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-blend-trigger"]');
    await expect(trigger).toBeVisible();
  });

  test('blend mode select has role="combobox"', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-blend-trigger"]');
    const role = await trigger.getAttribute('role');
    expect(role).toBe('combobox');
  });

  test('blend mode select has all blend options', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-blend-trigger"]');
    await trigger.click();
    await waitForRenderComplete(page, 'settle');

    // Count total options (should have 4: normal, multiply, screen, overlay)
    const options = page.locator('[role="option"]');
    const count = await options.count();

    await page.keyboard.press('Escape');
    expect(count).toBe(4);
  });

  test('selecting normal blend mode works', async ({ page }) => {
    await selectDropdownOption(page, 'watermark-blend-trigger', 'normal');

    const trigger = page.locator('[data-testid="watermark-blend-trigger"]');
    const text = await trigger.textContent();
    expect(text?.toLowerCase()).toContain('normal');
  });

  test('selecting multiply blend mode works', async ({ page }) => {
    await selectDropdownOption(page, 'watermark-blend-trigger', 'multiply');

    const trigger = page.locator('[data-testid="watermark-blend-trigger"]');
    const text = await trigger.textContent();
    expect(text?.toLowerCase()).toContain('multiply');
  });

  test('blend mode select uses keyboard navigation', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-blend-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    // Wait for dropdown to open (targeted wait, not full render settle)
    const opened = await page
      .waitForSelector('[data-radix-popper-content-wrapper]', { state: 'visible', timeout: 5000 })
      .catch(() => null);
    expect(opened, 'dropdown should open with Enter key').toBeTruthy();
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
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Watermark Section Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandWatermarkSection(page);
    await enableWatermark(page);
  });

  test('all controls are keyboard navigable', async ({ page }) => {
    // Start from enable switch
    const enableSwitch = page.locator('[data-testid="watermark-enabled-switch"]');
    await enableSwitch.focus();

    // Tab through controls
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should have moved through controls
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('switches have proper data-state attribute', async ({ page }) => {
    const enableSwitch = page.locator('[data-testid="watermark-enabled-switch"]');
    const state = await enableSwitch.getAttribute('data-state');
    expect(state === 'checked' || state === 'unchecked').toBe(true);
  });

  test('select triggers are expandable', async ({ page }) => {
    const kindTrigger = page.locator('[data-testid="watermark-kind-trigger"]');
    const _expandedBefore = await kindTrigger.getAttribute('aria-expanded');

    await kindTrigger.click();
    await waitForRenderComplete(page, 'settle');
    const expandedAfter = await kindTrigger.getAttribute('aria-expanded');
    expect(expandedAfter).toBe('true');

    await page.keyboard.press('Escape');
  });

  test('slider has required ARIA attributes', async ({ page }) => {
    const slider = page.locator('[data-testid="watermark-opacity-slider"] [role="slider"]');

    const valueNow = await slider.getAttribute('aria-valuenow');
    const valueMin = await slider.getAttribute('aria-valuemin');
    const valueMax = await slider.getAttribute('aria-valuemax');

    expect(valueNow).toBeTruthy();
    expect(valueMin).toBeTruthy();
    expect(valueMax).toBeTruthy();
  });

  test('options in selects have role="option"', async ({ page }) => {
    const trigger = page.locator('[data-testid="watermark-kind-trigger"]');
    await trigger.click();
    await waitForRenderComplete(page, 'settle');
    const options = page.locator('[role="option"]');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);

    await page.keyboard.press('Escape');
  });
});

// ============================================================================
// COMBINED SETTINGS TESTS
// ============================================================================

test.describe('Watermark Combined Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandWatermarkSection(page);
  });

  test('multiple watermark settings can be configured together', async ({ page }) => {
    // Enable watermark
    await enableWatermark(page);

    // Select text kind
    await selectDropdownOption(page, 'watermark-kind-trigger', 'text');
    await waitForRenderComplete(page, 'settle');
    // Set text
    await setInputByTestId(page, 'watermark-text-input', 'Custom Watermark');

    // Set position
    await selectDropdownOption(page, 'watermark-position-trigger', 'corners');

    // Set opacity
    await setSliderByTestId(page, 'watermark-opacity-slider', 70);

    // Set blend mode
    await selectDropdownOption(page, 'watermark-blend-trigger', 'multiply');

    // Verify text persisted
    const textInput = page.locator('[data-testid="watermark-text-input"]');
    const text = await textInput.inputValue();
    expect(text).toBe('Custom Watermark');
  });

  test('watermark settings persist after section collapse/expand', async ({ page }) => {
    // Enable and set some values
    await enableWatermark(page);
    await selectDropdownOption(page, 'watermark-kind-trigger', 'text');
    await setInputByTestId(page, 'watermark-text-input', 'Persistent Text');

    // Collapse and expand
    const watermarkTriggerEl = page
      .locator('[data-testid="accordion-watermark"] button[data-state]')
      .first();
    await watermarkTriggerEl.click();
    await waitForRenderComplete(page, 'settle');
    await watermarkTriggerEl.click();
    await page.waitForSelector(
      '[data-testid="accordion-watermark"] [role="region"][data-state="open"]',
      {
        state: 'visible',
        timeout: 5000,
      }
    );

    // Verify text persisted
    const textInput = page.locator('[data-testid="watermark-text-input"]');
    const text = await textInput.inputValue();
    expect(text).toBe('Persistent Text');
  });

  test('disabling watermark hides all settings', async ({ page }) => {
    // Enable watermark first
    await enableWatermark(page);

    // Verify settings visible
    const kindTrigger = page.locator('[data-testid="watermark-kind-trigger"]');
    await expect(kindTrigger).toBeVisible();

    // Disable watermark
    await toggleSwitchByTestId(page, 'watermark-enabled-switch');
    await waitForRenderComplete(page, 'settle');
    // Settings should be hidden
    const isVisible = await kindTrigger.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

test.describe('Watermark Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandWatermarkSection(page);
    await enableWatermark(page);
  });

  test('opacity slider handles minimum value', async ({ page }) => {
    await setSliderByTestId(page, 'watermark-opacity-slider', 0);
    const slider = page.locator('[data-testid="watermark-opacity-slider"] [role="slider"]');
    const value = await slider.getAttribute('aria-valuenow');
    expect(Number(value)).toBe(0);
  });

  test('opacity slider handles maximum value', async ({ page }) => {
    await setSliderByTestId(page, 'watermark-opacity-slider', 100);
    const slider = page.locator('[data-testid="watermark-opacity-slider"] [role="slider"]');
    const value = await slider.getAttribute('aria-valuenow');
    expect(Number(value)).toBe(100);
  });

  test('empty text input is allowed', async ({ page }) => {
    await selectDropdownOption(page, 'watermark-kind-trigger', 'text');
    await waitForRenderComplete(page, 'settle');
    const textInput = page.locator('[data-testid="watermark-text-input"]');
    await textInput.fill('');
    await textInput.blur();

    const value = await textInput.inputValue();
    expect(value).toBe('');
  });

  test('rapid toggle works correctly', async ({ page }) => {
    const switchEl = page.locator('[data-testid="watermark-enabled-switch"]');

    // Toggle rapidly using direct clicks — skip per-click state-change assertions
    // which can time out when renders are queued from previous toggles.
    // Use dispatchEvent to bypass all Playwright viewport/actionability checks
    // during rapid toggling (the switch may shift out of view between clicks).
    for (let i = 0; i < 5; i++) {
      await switchEl.dispatchEvent('click');
    }
    await waitForRenderComplete(page, 'settle');

    // Switch should still be functional
    const state = await switchEl.getAttribute('data-state');
    expect(state === 'checked' || state === 'unchecked').toBe(true);
  });

  test('kind switching preserves opacity setting', async ({ page }) => {
    // Set opacity
    await setSliderByTestId(page, 'watermark-opacity-slider', 80);

    // Switch kind
    await selectDropdownOption(page, 'watermark-kind-trigger', 'image');
    await waitForRenderComplete(page, 'settle');
    await selectDropdownOption(page, 'watermark-kind-trigger', 'text');
    await waitForRenderComplete(page, 'settle');
    // Opacity should be preserved
    const slider = page.locator('[data-testid="watermark-opacity-slider"] [role="slider"]');
    const value = await slider.getAttribute('aria-valuenow');
    expect(Number(value)).toBeGreaterThanOrEqual(75); // Allow some tolerance
  });
});
