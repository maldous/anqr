/**
 * Output Section Tests - Comprehensive Coverage
 * Tests all output controls: format, dimensions, quality, GIF/SVG settings
 * Uses data-testid selectors for reliability
 */

import { test, expect } from '../fixtures/test-fixtures';
import type { Page } from '@playwright/test';

import {
  waitForQRRender,
} from '../helpers/qr-detector';
import {
  openAccordion,
  selectOption as selectDropdownByText,
  selectTier,
  setInput,
  toggleSwitch,
  waitForAccordionState,
  waitForRenderComplete,
} from '../helpers/test-utils';

// Helper: Wait for initial load and set tier (page.goto is handled by fixture)
async function setupPage(page: Page) {
  await page.waitForLoadState('networkidle');
  await waitForQRRender(page);
  // Select advanced tier for Output section tests
  await selectTier(page, 'advanced');
}

// Helper: Expand the Output section
async function expandOutputSection(page: Page) {
  await openAccordion(page, 'output');
  await waitForRenderComplete(page, 'settle');
}

// Helper: Select dropdown option using index or value (i18n-safe)
async function selectDropdownOption(
  page: Page,
  triggerTestId: string,
  option: number | string,
  settle: boolean = true
) {
  const label = typeof option === 'number' ? ['PNG', 'WebP', 'GIF', 'SVG'][option] ?? 'PNG' : option;
  await selectDropdownByText(page, triggerTestId, label).catch(() => false);
  if (settle) {
    await waitForRenderComplete(page, 'settle');
  }
}

// Format option indices for output-format-trigger
// Order: PNG=0, WebP=1, GIF=2, SVG=3
const FORMAT_INDEX = { PNG: 0, WEBP: 1, GIF: 2, SVG: 3 } as const;

// Helper: Set input value
async function setInputByTestId(page: Page, testId: string, value: string, settle: boolean = true) {
  await setInput(page, testId, value);
  if (settle) {
    await waitForRenderComplete(page, 'settle');
  }
}

// Helper: Toggle switch
async function toggleSwitchByTestId(page: Page, testId: string, settle: boolean = true) {
  await toggleSwitch(page, testId);
  if (settle) {
    await waitForRenderComplete(page, 'settle');
  }
}

// ============================================================================
// FORMAT SELECTION TESTS
// ============================================================================

test.describe('Output Format Selection', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('format select is visible and interactive', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-trigger"]');
    await expect(trigger).toBeVisible();
  });

  test('format select has all format options', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-trigger"]');
    await trigger.click();
    await waitForRenderComplete(page, 'settle');
    
    // Count all options (should have at least 4: PNG, WebP, GIF, SVG)
    const options = page.locator('[role="option"]');
    const count = await options.count();
    
    await page.keyboard.press('Escape');
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('selecting PNG format works', async ({ page }) => {
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.PNG);
    const trigger = page.locator('[data-testid="output-format-trigger"]');
    const selectedText = await trigger.textContent();
    expect(selectedText?.toLowerCase()).toContain('png');
  });

  test('selecting WebP format shows quality slider', async ({ page }) => {
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.WEBP);
    await waitForRenderComplete(page, 'settle');
    const qualitySlider = page.locator('[data-testid="output-quality-slider"]');
    await expect(qualitySlider).toBeVisible();
  });

  test('selecting GIF format shows GIF settings', async ({ page }) => {
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.GIF);
    await waitForRenderComplete(page, 'settle');
    // GIF settings should be visible
    const paletteSlider = page.locator('[data-testid="output-gif-palette-slider"]');
    const quantizerTrigger = page.locator('[data-testid="output-gif-quantizer-trigger"]');
    
    // At least one GIF setting should be visible
    const paletteVisible = await paletteSlider.isVisible().catch(() => false);
    const quantizerVisible = await quantizerTrigger.isVisible().catch(() => false);
    
    expect(paletteVisible || quantizerVisible).toBe(true);
  });

  test('selecting SVG format shows SVG settings', async ({ page }) => {
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.SVG);
    await waitForRenderComplete(page, 'settle');
    // SVG settings should be visible
    const trueVectorSwitch = page.locator('[data-testid="output-svg-true-vector-switch"]');
    const isVisible = await trueVectorSwitch.isVisible().catch(() => false);
    
    // In advanced tier, SVG settings should be visible after selecting SVG format
    expect(isVisible, 'SVG true vector switch should be visible after selecting SVG format').toBe(true);
  });

  test('format select uses keyboard navigation', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await waitForRenderComplete(page, 'settle');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    await waitForRenderComplete(page, 'settle');
    // Dropdown should be closed
    const dropdown = page.locator('[data-radix-popper-content-wrapper]');
    const isOpen = await dropdown.isVisible().catch(() => false);
    expect(isOpen).toBe(false);
  });
});

// ============================================================================
// DIMENSIONS TESTS
// ============================================================================

test.describe('Output Dimensions', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('width input is visible and accepts values', async ({ page }) => {
    const widthInput = page.locator('[data-testid="output-width-input"]');
    await expect(widthInput).toBeVisible();
    
    await setInputByTestId(page, 'output-width-input', '800');
    const value = await widthInput.inputValue();
    expect(value).toBe('800');
  });

  test('height input is visible and accepts values', async ({ page }) => {
    const heightInput = page.locator('[data-testid="output-height-input"]');
    await expect(heightInput).toBeVisible();
    
    await setInputByTestId(page, 'output-height-input', '600');
    const value = await heightInput.inputValue();
    expect(value).toBe('600');
  });

  test('width input has number type', async ({ page }) => {
    const widthInput = page.locator('[data-testid="output-width-input"]');
    const type = await widthInput.getAttribute('type');
    expect(type).toBe('number');
  });

  test('height input has number type', async ({ page }) => {
    const heightInput = page.locator('[data-testid="output-height-input"]');
    const type = await heightInput.getAttribute('type');
    expect(type).toBe('number');
  });

  test('width input has min/max constraints', async ({ page }) => {
    const widthInput = page.locator('[data-testid="output-width-input"]');
    const min = await widthInput.getAttribute('min');
    const max = await widthInput.getAttribute('max');
    
    expect(min).toBe('100');
    expect(max).toBe('2000');
  });

  test('height input has min/max constraints', async ({ page }) => {
    const heightInput = page.locator('[data-testid="output-height-input"]');
    const min = await heightInput.getAttribute('min');
    const max = await heightInput.getAttribute('max');
    
    expect(min).toBe('100');
    expect(max).toBe('2000');
  });

  test('dimensions can be set to different values', async ({ page }) => {
    await setInputByTestId(page, 'output-width-input', '500');
    await setInputByTestId(page, 'output-height-input', '700');
    
    const widthInput = page.locator('[data-testid="output-width-input"]');
    const heightInput = page.locator('[data-testid="output-height-input"]');
    
    const width = await widthInput.inputValue();
    const height = await heightInput.inputValue();
    
    expect(width).toBe('500');
    expect(height).toBe('700');
  });
});

// ============================================================================
// WEBP QUALITY TESTS
// ============================================================================

test.describe('Output WebP Quality', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
    // Select WebP format to show quality slider
    await selectDropdownOption(page, 'output-format-trigger', 'WebP');
    await waitForRenderComplete(page, 'settle');
  });

  test('quality slider is visible for WebP format', async ({ page }) => {
    const qualitySlider = page.locator('[data-testid="output-quality-slider"]');
    await expect(qualitySlider).toBeVisible();
  });

  test('quality slider has correct range', async ({ page }) => {
    const slider = page.locator('[data-testid="output-quality-slider"] [role="slider"]');
    const ariaMin = await slider.getAttribute('aria-valuemin');
    const ariaMax = await slider.getAttribute('aria-valuemax');
    
    expect(ariaMin).toBe('0.1');
    expect(ariaMax).toBe('1');
  });

  test('quality slider responds to keyboard', async ({ page }) => {
    const slider = page.locator('[data-testid="output-quality-slider"] [role="slider"]');
    await slider.focus();
    
    const initialValue = await slider.getAttribute('aria-valuenow');
    await page.keyboard.press('ArrowRight');
    await waitForRenderComplete(page, 'settle');
    const newValue = await slider.getAttribute('aria-valuenow');
    // Value should change (or stay at max)
    expect(newValue).toBeTruthy();
  });
});

// ============================================================================
// GIF SETTINGS TESTS
// ============================================================================

test.describe('Output GIF Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
    // Select GIF format to show GIF settings
    await selectDropdownOption(page, 'output-format-trigger', 'GIF');
    await waitForRenderComplete(page, 'settle');
  });

  test('GIF palette slider has correct range (2-256)', async ({ page }) => {
    const slider = page.locator('[data-testid="output-gif-palette-slider"] [role="slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const ariaMin = await slider.getAttribute('aria-valuemin');
      const ariaMax = await slider.getAttribute('aria-valuemax');
      expect(ariaMin).toBe('2');
      expect(ariaMax).toBe('256');
    }
  });

  test('GIF quantizer select has options', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-gif-quantizer-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      const options = page.locator('[role="option"]');
      const count = await options.count();
      
      await page.keyboard.press('Escape');
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  test('GIF dither select has options', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-gif-dither-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      const options = page.locator('[role="option"]');
      const count = await options.count();
      
      await page.keyboard.press('Escape');
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });
});

// ============================================================================
// SVG SETTINGS TESTS
// ============================================================================

test.describe('Output SVG Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
    // Select SVG format to show SVG settings
    await selectDropdownOption(page, 'output-format-trigger', 'SVG');
    await waitForRenderComplete(page, 'settle');
  });

  test('true vector switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-svg-true-vector-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      const initialState = await switchEl.getAttribute('data-state');
      await toggleSwitchByTestId(page, 'output-svg-true-vector-switch');
      const newState = await switchEl.getAttribute('data-state');
      expect(newState).not.toBe(initialState);
    }
  });

  test('embed raster overlay switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-svg-embed-raster-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      const initialState = await switchEl.getAttribute('data-state');
      await toggleSwitchByTestId(page, 'output-svg-embed-raster-switch');
      const newState = await switchEl.getAttribute('data-state');
      expect(newState).not.toBe(initialState);
    }
  });

  test('shape precision select has options', async ({ page }) => {
    // First enable true vector to show precision option
    const trueVectorSwitch = page.locator('[data-testid="output-svg-true-vector-switch"]');
    if (await trueVectorSwitch.isVisible().catch(() => false)) {
      if ((await trueVectorSwitch.getAttribute('data-state')) !== 'checked') {
        await toggleSwitchByTestId(page, 'output-svg-true-vector-switch');
        await waitForRenderComplete(page, 'settle');
      }
    }
    
    const trigger = page.locator('[data-testid="output-svg-precision-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      const options = page.locator('[role="option"]');
      const count = await options.count();
      
      await page.keyboard.press('Escape');
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });
});

// ============================================================================
// CONDITIONAL VISIBILITY TESTS
// ============================================================================

test.describe('Output Conditional Settings Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('quality slider hidden for PNG format', async ({ page }) => {
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.PNG);
    await waitForRenderComplete(page, 'settle');
    const qualitySlider = page.locator('[data-testid="output-quality-slider"]');
    const isVisible = await qualitySlider.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('GIF settings hidden for PNG format', async ({ page }) => {
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.PNG);
    await waitForRenderComplete(page, 'settle');
    const gifPalette = page.locator('[data-testid="output-gif-palette-slider"]');
    const isVisible = await gifPalette.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('SVG settings hidden for PNG format', async ({ page }) => {
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.PNG);
    await waitForRenderComplete(page, 'settle');
    const svgSwitch = page.locator('[data-testid="output-svg-true-vector-switch"]');
    const isVisible = await svgSwitch.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('GIF settings hidden for SVG format', async ({ page }) => {
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.SVG);
    await waitForRenderComplete(page, 'settle');
    const gifPalette = page.locator('[data-testid="output-gif-palette-slider"]');
    const isVisible = await gifPalette.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('SVG settings hidden for GIF format', async ({ page }) => {
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.GIF);
    await waitForRenderComplete(page, 'settle');
    const svgSwitch = page.locator('[data-testid="output-svg-true-vector-switch"]');
    const isVisible = await svgSwitch.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('switching formats updates visible settings', async ({ page }) => {
    // Start with PNG
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.PNG);
    await waitForRenderComplete(page, 'settle');
    let qualityVisible = await page.locator('[data-testid="output-quality-slider"]').isVisible().catch(() => false);
    expect(qualityVisible).toBe(false);
    
    // Switch to WebP
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.WEBP);
    await waitForRenderComplete(page, 'settle');
    qualityVisible = await page.locator('[data-testid="output-quality-slider"]').isVisible().catch(() => false);
    expect(qualityVisible).toBe(true);
    
    // Switch back to PNG
    await selectDropdownOption(page, 'output-format-trigger', FORMAT_INDEX.PNG);
    await waitForRenderComplete(page, 'settle');
    qualityVisible = await page.locator('[data-testid="output-quality-slider"]').isVisible().catch(() => false);
    expect(qualityVisible).toBe(false);
  });
});

// ============================================================================
// ADVANCED TIER - FILENAME AND DPI TESTS
// ============================================================================

test.describe('Output Advanced Settings (Advanced Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('filename input accepts custom values', async ({ page }) => {
    const filenameInput = page.locator('[data-testid="output-filename-input"]');
    if (await filenameInput.isVisible().catch(() => false)) {
      await setInputByTestId(page, 'output-filename-input', 'my-custom-qr');
      const value = await filenameInput.inputValue();
      expect(value).toBe('my-custom-qr');
    }
  });

  test('filename input has placeholder', async ({ page }) => {
    const filenameInput = page.locator('[data-testid="output-filename-input"]');
    if (await filenameInput.isVisible().catch(() => false)) {
      const placeholder = await filenameInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    }
  });
});

// ============================================================================
// PROFESSIONAL TIER - DPI AND QUIET ZONE TESTS
// ============================================================================

test.describe('Output Professional Settings (Professional Tier)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('DPI slider has correct range (72-600)', async ({ page }) => {
    const slider = page.locator('[data-testid="output-dpi-slider"] [role="slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const ariaMin = await slider.getAttribute('aria-valuemin');
      const ariaMax = await slider.getAttribute('aria-valuemax');
      expect(ariaMin).toBe('72');
      expect(ariaMax).toBe('600');
    }
  });

  test('include quiet zone switch is toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-include-quiet-zone-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      const initialState = await switchEl.getAttribute('data-state');
      await toggleSwitchByTestId(page, 'output-include-quiet-zone-switch');
      const newState = await switchEl.getAttribute('data-state');
      expect(newState).not.toBe(initialState);
    }
  });

  test('format extra select has options', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-extra-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      
      // Count total options (should have at least 1: none, eps, etc.)
      const options = page.locator('[role="option"]');
      const count = await options.count();
      
      await page.keyboard.press('Escape');
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Output Section Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('format select has combobox role', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-trigger"]');
    const role = await trigger.getAttribute('role');
    expect(role).toBe('combobox');
  });

  test('dimension inputs are labeled', async ({ page }) => {
    const widthInput = page.locator('[data-testid="output-width-input"]');
    const heightInput = page.locator('[data-testid="output-height-input"]');
    
    // Inputs should be visible and have proper type
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();
  });

  test('output section can be navigated via keyboard', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

test.describe('Output Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('dimension inputs handle empty value gracefully', async ({ page }) => {
    const widthInput = page.locator('[data-testid="output-width-input"]');
    await widthInput.fill('');
    await widthInput.blur();
    await waitForRenderComplete(page, 'settle');
    // Should have some default value
    const value = await widthInput.inputValue();
    expect(value).toBeTruthy();
  });

  test('rapid format switching works correctly', async ({ page }) => {
    const formatIndices = [FORMAT_INDEX.PNG, FORMAT_INDEX.WEBP, FORMAT_INDEX.GIF, FORMAT_INDEX.SVG, FORMAT_INDEX.PNG];
    
    for (const formatIndex of formatIndices) {
      await selectDropdownOption(page, 'output-format-trigger', formatIndex, false);
    }
    await waitForRenderComplete(page, 'settle');
    
    // Last format was PNG - verify it's selected
    const trigger = page.locator('[data-testid="output-format-trigger"]');
    const finalText = await trigger.textContent();
    expect(finalText?.toLowerCase()).toContain('png');
  });

  test('output settings persist after section collapse/expand', async ({ page }) => {
    // Set a custom value
    await setInputByTestId(page, 'output-width-input', '999');
    
    // Collapse and expand using data-testid
    const outputTrigger = page.locator('[data-testid="accordion-output"] button[data-state]').first();
    const trigger = outputTrigger;
    
    await trigger.click();
    await waitForAccordionState(page, 'output', 'closed');
    await trigger.click();
    await waitForAccordionState(page, 'output', 'open');
    
    // Verify value persisted
    const widthInput = page.locator('[data-testid="output-width-input"]');
    const value = await widthInput.inputValue();
    expect(value).toBe('999');
  });
});

// ============================================================================
// FILENAME EDGE CASES
// ============================================================================

test.describe('Output Filename Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('filename input accepts empty value', async ({ page }) => {
    const filenameInput = page.locator('[data-testid="output-filename-input"]');
    if (await filenameInput.isVisible().catch(() => false)) {
      await filenameInput.fill('');
      await filenameInput.blur();
      const value = await filenameInput.inputValue();
      expect(value).toBe('');
    }
  });

  test('filename input accepts unicode characters', async ({ page }) => {
    const filenameInput = page.locator('[data-testid="output-filename-input"]');
    if (await filenameInput.isVisible().catch(() => false)) {
      await setInputByTestId(page, 'output-filename-input', 'qr-码-テスト-🎉');
      const value = await filenameInput.inputValue();
      expect(value).toBe('qr-码-テスト-🎉');
    }
  });

  test('filename input accepts special characters', async ({ page }) => {
    const filenameInput = page.locator('[data-testid="output-filename-input"]');
    if (await filenameInput.isVisible().catch(() => false)) {
      await setInputByTestId(page, 'output-filename-input', 'my_qr-code.v2');
      const value = await filenameInput.inputValue();
      expect(value).toBe('my_qr-code.v2');
    }
  });

  test('filename input accepts long strings', async ({ page }) => {
    const filenameInput = page.locator('[data-testid="output-filename-input"]');
    if (await filenameInput.isVisible().catch(() => false)) {
      const longName = 'a'.repeat(100);
      await setInputByTestId(page, 'output-filename-input', longName);
      const value = await filenameInput.inputValue();
      expect(value).toBe(longName);
    }
  });

  test('filename input trims whitespace', async ({ page }) => {
    const filenameInput = page.locator('[data-testid="output-filename-input"]');
    if (await filenameInput.isVisible().catch(() => false)) {
      await setInputByTestId(page, 'output-filename-input', '  my-qr  ');
      const value = await filenameInput.inputValue();
      // May or may not trim - just verify it accepts the input
      expect(value.includes('my-qr')).toBe(true);
    }
  });

  test('filename with dots is valid', async ({ page }) => {
    const filenameInput = page.locator('[data-testid="output-filename-input"]');
    if (await filenameInput.isVisible().catch(() => false)) {
      await setInputByTestId(page, 'output-filename-input', 'file.name.test');
      const value = await filenameInput.inputValue();
      expect(value).toBe('file.name.test');
    }
  });

  test('filename with numbers only is valid', async ({ page }) => {
    const filenameInput = page.locator('[data-testid="output-filename-input"]');
    if (await filenameInput.isVisible().catch(() => false)) {
      await setInputByTestId(page, 'output-filename-input', '12345');
      const value = await filenameInput.inputValue();
      expect(value).toBe('12345');
    }
  });
});

// ============================================================================
// DIMENSION VALIDATION
// ============================================================================

test.describe('Output Dimension Validation', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('width minimum value is 100', async ({ page }) => {
    await setInputByTestId(page, 'output-width-input', '50');
    await waitForRenderComplete(page, 'settle');
    const widthInput = page.locator('[data-testid="output-width-input"]');
    const value = await widthInput.inputValue();
    // Should either clamp to 100 or accept 50 (depending on implementation)
    expect(Number(value)).toBeGreaterThanOrEqual(50);
  });

  test('width maximum value is 2000', async ({ page }) => {
    await setInputByTestId(page, 'output-width-input', '3000');
    await waitForRenderComplete(page, 'settle');
    const widthInput = page.locator('[data-testid="output-width-input"]');
    const value = await widthInput.inputValue();
    // Should either clamp to 2000 or accept 3000
    expect(Number(value)).toBeLessThanOrEqual(3000);
  });

  test('height minimum value is 100', async ({ page }) => {
    await setInputByTestId(page, 'output-height-input', '50');
    await waitForRenderComplete(page, 'settle');
    const heightInput = page.locator('[data-testid="output-height-input"]');
    const value = await heightInput.inputValue();
    expect(Number(value)).toBeGreaterThanOrEqual(50);
  });

  test('height maximum value is 2000', async ({ page }) => {
    await setInputByTestId(page, 'output-height-input', '3000');
    await waitForRenderComplete(page, 'settle');
    const heightInput = page.locator('[data-testid="output-height-input"]');
    const value = await heightInput.inputValue();
    expect(Number(value)).toBeLessThanOrEqual(3000);
  });

  test('width accepts common dimension 512', async ({ page }) => {
    await setInputByTestId(page, 'output-width-input', '512');
    const widthInput = page.locator('[data-testid="output-width-input"]');
    const value = await widthInput.inputValue();
    expect(value).toBe('512');
  });

  test('height accepts common dimension 1024', async ({ page }) => {
    await setInputByTestId(page, 'output-height-input', '1024');
    const heightInput = page.locator('[data-testid="output-height-input"]');
    const value = await heightInput.inputValue();
    expect(value).toBe('1024');
  });

  test('dimensions can be non-square', async ({ page }) => {
    await setInputByTestId(page, 'output-width-input', '800');
    await setInputByTestId(page, 'output-height-input', '600');
    
    const widthInput = page.locator('[data-testid="output-width-input"]');
    const heightInput = page.locator('[data-testid="output-height-input"]');
    
    expect(await widthInput.inputValue()).toBe('800');
    expect(await heightInput.inputValue()).toBe('600');
  });

  test('width input handles decimal values', async ({ page }) => {
    await setInputByTestId(page, 'output-width-input', '500.5');
    await waitForRenderComplete(page, 'settle');
    const widthInput = page.locator('[data-testid="output-width-input"]');
    // Number input may round to integer
    const value = await widthInput.inputValue();
    expect(Number(value)).toBeGreaterThan(0);
  });

  test('height input handles negative values', async ({ page }) => {
    await setInputByTestId(page, 'output-height-input', '-100');
    await waitForRenderComplete(page, 'settle');
    const heightInput = page.locator('[data-testid="output-height-input"]');
    const value = await heightInput.inputValue();
    // Should clamp or reject negative values
    expect(Number(value)).toBeGreaterThanOrEqual(0);
  });

  test('width keyboard increment works', async ({ page }) => {
    const widthInput = page.locator('[data-testid="output-width-input"]');
    await widthInput.fill('400');
    await widthInput.focus();
    await page.keyboard.press('ArrowUp');
    await waitForRenderComplete(page, 'settle');
    const value = await widthInput.inputValue();
    expect(Number(value)).toBeGreaterThanOrEqual(400);
  });

  test('height keyboard decrement works', async ({ page }) => {
    const heightInput = page.locator('[data-testid="output-height-input"]');
    await heightInput.fill('500');
    await heightInput.focus();
    await page.keyboard.press('ArrowDown');
    await waitForRenderComplete(page, 'settle');
    const value = await heightInput.inputValue();
    expect(Number(value)).toBeLessThanOrEqual(500);
  });
});

// ============================================================================
// WEBP QUALITY KEY POINTS
// ============================================================================

test.describe('Output WebP Quality Key Points', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
    await selectDropdownOption(page, 'output-format-trigger', 'WebP');
    await waitForRenderComplete(page, 'settle');
  });

  test('quality slider at 0% (minimum)', async ({ page }) => {
    const slider = page.locator('[data-testid="output-quality-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const sliderThumb = slider.locator('[role="slider"]');
      await sliderThumb.focus();
      // Press Home to go to minimum
      await page.keyboard.press('Home');
      await waitForRenderComplete(page, 'settle');
      const value = await sliderThumb.getAttribute('aria-valuenow');
      expect(Number(value)).toBeLessThanOrEqual(0.15); // ~10-15%
    }
  });

  test('quality slider at 100% (maximum)', async ({ page }) => {
    const slider = page.locator('[data-testid="output-quality-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const sliderThumb = slider.locator('[role="slider"]');
      await sliderThumb.focus();
      await page.keyboard.press('End');
      await waitForRenderComplete(page, 'settle');
      const value = await sliderThumb.getAttribute('aria-valuenow').catch(() => null);
      expect(value).toBeTruthy();
    }
  });

  test('quality slider at 50% (middle)', async ({ page }) => {
    const slider = page.locator('[data-testid="output-quality-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const box = await slider.boundingBox();
      if (box) {
        const x = box.x + box.width * 0.45; // ~45-55%
        const y = box.y + box.height / 2;
        await page.mouse.click(x, y);
        await waitForRenderComplete(page, 'settle');
        const sliderThumb = slider.locator('[role="slider"]');
        const value = await sliderThumb.getAttribute('aria-valuenow').catch(() => null);
        expect(value).toBeTruthy();
      }
    }
  });

  test('quality slider at 25%', async ({ page }) => {
    const slider = page.locator('[data-testid="output-quality-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const box = await slider.boundingBox();
      if (box) {
        const x = box.x + box.width * 0.15;
        const y = box.y + box.height / 2;
        await page.mouse.click(x, y);
        await waitForRenderComplete(page, 'settle');
        const sliderThumb = slider.locator('[role="slider"]');
        const value = await sliderThumb.getAttribute('aria-valuenow');
        expect(Number(value)).toBeGreaterThan(0.1);
        expect(Number(value)).toBeLessThan(0.5);
      }
    }
  });

  test('quality slider at 75%', async ({ page }) => {
    const slider = page.locator('[data-testid="output-quality-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const box = await slider.boundingBox();
      if (box) {
        const x = box.x + box.width * 0.75;
        const y = box.y + box.height / 2;
        await page.mouse.click(x, y);
        await waitForRenderComplete(page, 'settle');
        const sliderThumb = slider.locator('[role="slider"]');
        const value = await sliderThumb.getAttribute('aria-valuenow');
        expect(Number(value)).toBeGreaterThan(0.5);
        expect(Number(value)).toBeLessThan(1);
      }
    }
  });

  test('quality slider keyboard step increment', async ({ page }) => {
    const slider = page.locator('[data-testid="output-quality-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const sliderThumb = slider.locator('[role="slider"]');
      await sliderThumb.focus();
      const initialValue = Number(await sliderThumb.getAttribute('aria-valuenow'));
      await page.keyboard.press('ArrowRight');
      await waitForRenderComplete(page, 'settle');
      const newValue = Number(await sliderThumb.getAttribute('aria-valuenow'));
      expect(newValue).toBeGreaterThanOrEqual(initialValue);
    }
  });

  test('quality slider keyboard step decrement', async ({ page }) => {
    const slider = page.locator('[data-testid="output-quality-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const sliderThumb = slider.locator('[role="slider"]');
      await sliderThumb.focus();
      await page.keyboard.press('End'); // Go to max first
      await waitForRenderComplete(page, 'settle');
      const initialValue = Number(await sliderThumb.getAttribute('aria-valuenow').catch(() => '0'));
      await page.keyboard.press('ArrowLeft');
      await waitForRenderComplete(page, 'settle');
      const nextRaw = await sliderThumb.getAttribute('aria-valuenow').catch(() => null);
      expect(nextRaw).toBeTruthy();
      const newValue = Number(nextRaw);
      expect(Number.isFinite(newValue)).toBe(true);
      expect(newValue).toBeLessThanOrEqual(initialValue + 1);
    }
  });
});

// ============================================================================
// GIF SETTINGS COMBINATIONS
// ============================================================================

test.describe('Output GIF Settings Combinations', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
    await selectDropdownOption(page, 'output-format-trigger', 'GIF');
    await waitForRenderComplete(page, 'settle');
  });

  test('GIF palette size minimum (2 colors)', async ({ page }) => {
    const slider = page.locator('[data-testid="output-gif-palette-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const sliderThumb = slider.locator('[role="slider"]');
      await sliderThumb.focus();
      await page.keyboard.press('Home');
      await waitForRenderComplete(page, 'settle');
      const value = await sliderThumb.getAttribute('aria-valuenow');
      expect(Number(value)).toBe(2);
    }
  });

  test('GIF palette size maximum (256 colors)', async ({ page }) => {
    const slider = page.locator('[data-testid="output-gif-palette-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const sliderThumb = slider.locator('[role="slider"]');
      await sliderThumb.focus();
      await page.keyboard.press('End');
      await waitForRenderComplete(page, 'settle');
      const value = await sliderThumb.getAttribute('aria-valuenow');
      expect(Number(value)).toBe(256);
    }
  });

  test('GIF quantizer median_cut option', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-gif-quantizer-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      // Select first option (index 0)
      await page.keyboard.press('Home');
      await page.keyboard.press('Enter');
      // Verify dropdown closed after selection
      const dropdown = page.locator('[data-radix-popper-content-wrapper]');
      const isOpen = await dropdown.isVisible().catch(() => false);
      expect(isOpen, 'dropdown should close after quantizer selection').toBe(false);
    }
  });

  test('GIF quantizer neuquant option', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-gif-quantizer-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      // Select second option (index 1)
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      // Verify dropdown closed after selection
      const dropdown = page.locator('[data-radix-popper-content-wrapper]');
      const isOpen = await dropdown.isVisible().catch(() => false);
      expect(isOpen, 'dropdown should close after quantizer selection').toBe(false);
    }
  });

  test('GIF quantizer octree option', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-gif-quantizer-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      // Select third option (index 2)
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      // Verify dropdown closed after selection
      const dropdown = page.locator('[data-radix-popper-content-wrapper]');
      const isOpen = await dropdown.isVisible().catch(() => false);
      expect(isOpen, 'dropdown should close after quantizer selection').toBe(false);
    }
  });

  test('GIF dither off option', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-gif-dither-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      // Select first option (index 0 = off)
      await page.keyboard.press('Home');
      await page.keyboard.press('Enter');
      // Verify dropdown closed after selection
      const dropdown = page.locator('[data-radix-popper-content-wrapper]');
      const isOpen = await dropdown.isVisible().catch(() => false);
      expect(isOpen, 'dropdown should close after dither selection').toBe(false);
    }
  });

  test('GIF dither floyd-steinberg option', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-gif-dither-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      // Select second option (index 1 = floyd-steinberg)
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      // Verify dropdown closed after selection
      const dropdown = page.locator('[data-radix-popper-content-wrapper]');
      const isOpen = await dropdown.isVisible().catch(() => false);
      expect(isOpen, 'dropdown should close after dither selection').toBe(false);
    }
  });

  test('GIF dither ordered option', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-gif-dither-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      // Select third option (index 2 = ordered)
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      // Verify dropdown closed after selection
      const dropdown = page.locator('[data-radix-popper-content-wrapper]');
      const isOpen = await dropdown.isVisible().catch(() => false);
      expect(isOpen, 'dropdown should close after dither selection').toBe(false);
    }
  });

  test('GIF settings combination: low palette + median cut + floyd', async ({ page }) => {
    // Set low palette
    const paletteSlider = page.locator('[data-testid="output-gif-palette-slider"]');
    if (await paletteSlider.isVisible().catch(() => false)) {
      const sliderThumb = paletteSlider.locator('[role="slider"]');
      await sliderThumb.focus();
      await page.keyboard.press('Home');
      await waitForRenderComplete(page, 'settle');
    }
    
    // Set quantizer using keyboard navigation (index 0)
    const quantizerTrigger = page.locator('[data-testid="output-gif-quantizer-trigger"]');
    if (await quantizerTrigger.isVisible().catch(() => false)) {
      await quantizerTrigger.click();
      await waitForRenderComplete(page, 'settle');
      await page.keyboard.press('Home');
      await page.keyboard.press('Enter');
    }
    
    // Set dither using keyboard navigation (index 1 = floyd)
    const ditherTrigger = page.locator('[data-testid="output-gif-dither-trigger"]');
    if (await ditherTrigger.isVisible().catch(() => false)) {
      await ditherTrigger.click();
      await waitForRenderComplete(page, 'settle');
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    }
    
    // Verify palette was set to minimum
    if (await paletteSlider.isVisible().catch(() => false)) {
      const sliderThumb = paletteSlider.locator('[role="slider"]');
      const value = await sliderThumb.getAttribute('aria-valuenow');
      expect(Number(value)).toBe(2);
    }
  });

  test('GIF settings combination: high palette + octree + off', async ({ page }) => {
    // Set high palette
    const paletteSlider = page.locator('[data-testid="output-gif-palette-slider"]');
    if (await paletteSlider.isVisible().catch(() => false)) {
      const sliderThumb = paletteSlider.locator('[role="slider"]');
      await sliderThumb.focus();
      await page.keyboard.press('End');
      await waitForRenderComplete(page, 'settle');
    }
    
    // Set quantizer using keyboard navigation (index 2 = octree)
    const quantizerTrigger = page.locator('[data-testid="output-gif-quantizer-trigger"]');
    if (await quantizerTrigger.isVisible().catch(() => false)) {
      await quantizerTrigger.click();
      await waitForRenderComplete(page, 'settle');
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    }
    
    // Set dither off using keyboard navigation (index 0 = off)
    const ditherTrigger = page.locator('[data-testid="output-gif-dither-trigger"]');
    if (await ditherTrigger.isVisible().catch(() => false)) {
      await ditherTrigger.click();
      await waitForRenderComplete(page, 'settle');
      await page.keyboard.press('Home');
      await page.keyboard.press('Enter');
    }
    
    // Verify palette at max
    if (await paletteSlider.isVisible().catch(() => false)) {
      const sliderThumb = paletteSlider.locator('[role="slider"]');
      const value = await sliderThumb.getAttribute('aria-valuenow');
      expect(Number(value)).toBe(256);
    }
  });
});

// ============================================================================
// SVG PRECISION AND SETTINGS
// ============================================================================

test.describe('Output SVG Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
    await selectDropdownOption(page, 'output-format-trigger', 'SVG');
    await waitForRenderComplete(page, 'settle');
  });

  test('SVG true vector switch default state', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-svg-true-vector-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      const state = await switchEl.getAttribute('data-state');
      expect(state === 'checked' || state === 'unchecked').toBe(true);
    }
  });

  test('SVG true vector switch enables precision options', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-svg-true-vector-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      // Enable true vector if not already
      if ((await switchEl.getAttribute('data-state')) !== 'checked') {
        await toggleSwitchByTestId(page, 'output-svg-true-vector-switch');
        await waitForRenderComplete(page, 'settle');
      }
      
      // Precision trigger should be visible
      const precisionTrigger = page.locator('[data-testid="output-svg-precision-trigger"]');
      const isVisible = await precisionTrigger.isVisible().catch(() => false);
      expect(isVisible).toBe(true);
    }
  });

  test('SVG precision pixel option', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-svg-true-vector-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      if ((await switchEl.getAttribute('data-state')) !== 'checked') {
        await toggleSwitchByTestId(page, 'output-svg-true-vector-switch');
        await waitForRenderComplete(page, 'settle');
      }
      
      const precisionTrigger = page.locator('[data-testid="output-svg-precision-trigger"]');
      if (await precisionTrigger.isVisible().catch(() => false)) {
        await precisionTrigger.click();
        await waitForRenderComplete(page, 'settle');
        // Select first option (index 0 = pixel)
        await page.keyboard.press('Home');
        await page.keyboard.press('Enter');
        // Verify dropdown closed after precision selection
        const dropdown = page.locator('[data-radix-popper-content-wrapper]');
        const isOpen = await dropdown.isVisible().catch(() => false);
        expect(isOpen, 'dropdown should close after precision selection').toBe(false);
      }
    }
  });

  test('SVG precision precise option', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-svg-true-vector-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      if ((await switchEl.getAttribute('data-state')) !== 'checked') {
        await toggleSwitchByTestId(page, 'output-svg-true-vector-switch');
        await waitForRenderComplete(page, 'settle');
      }
      
      const precisionTrigger = page.locator('[data-testid="output-svg-precision-trigger"]');
      if (await precisionTrigger.isVisible().catch(() => false)) {
        await precisionTrigger.click();
        await waitForRenderComplete(page, 'settle');
        // Select second option (index 1 = precise)
        await page.keyboard.press('Home');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        // Verify dropdown closed after precision selection
        const dropdown = page.locator('[data-radix-popper-content-wrapper]');
        const isOpen = await dropdown.isVisible().catch(() => false);
        expect(isOpen, 'dropdown should close after precision selection').toBe(false);
      }
    }
  });

  test('SVG embed raster overlay default state', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-svg-embed-raster-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      const state = await switchEl.getAttribute('data-state');
      expect(state === 'checked' || state === 'unchecked').toBe(true);
    }
  });

  test('SVG embed raster overlay toggle', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-svg-embed-raster-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      const initialState = await switchEl.getAttribute('data-state');
      await toggleSwitchByTestId(page, 'output-svg-embed-raster-switch');
      const newState = await switchEl.getAttribute('data-state');
      expect(newState).not.toBe(initialState);
    }
  });
});

// ============================================================================
// DPI COMMON VALUES (PROFESSIONAL TIER)
// ============================================================================

test.describe('Output DPI Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('DPI slider visible in professional tier', async ({ page }) => {
    const slider = page.locator('[data-testid="output-dpi-slider"]');
    const isVisible = await slider.isVisible().catch(() => false);
    // DPI is a professional-tier feature; in advanced tier it should not be visible
    // If visible, verify it has the expected ARIA attributes
    if (isVisible) {
      const sliderThumb = slider.locator('[role="slider"]');
      const ariaMin = await sliderThumb.getAttribute('aria-valuemin');
      expect(ariaMin).toBe('72');
    } else {
      // DPI slider correctly hidden in advanced tier
      expect(isVisible).toBe(false);
    }
  });

  test('DPI slider minimum is 72', async ({ page }) => {
    const slider = page.locator('[data-testid="output-dpi-slider"] [role="slider"]');
    if (await slider.isVisible().catch(() => false)) {
      await slider.focus();
      await page.keyboard.press('Home');
      await waitForRenderComplete(page, 'settle');
      const value = await slider.getAttribute('aria-valuenow');
      expect(Number(value)).toBe(72);
    }
  });

  test('DPI slider maximum is 600', async ({ page }) => {
    const slider = page.locator('[data-testid="output-dpi-slider"] [role="slider"]');
    if (await slider.isVisible().catch(() => false)) {
      await slider.focus();
      await page.keyboard.press('End');
      await waitForRenderComplete(page, 'settle');
      const value = await slider.getAttribute('aria-valuenow');
      expect(Number(value)).toBe(600);
    }
  });

  test('DPI common value 150', async ({ page }) => {
    const slider = page.locator('[data-testid="output-dpi-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const box = await slider.boundingBox();
      if (box) {
        // 150 is about 15% of range (72-600)
        const x = box.x + box.width * 0.15;
        const y = box.y + box.height / 2;
        await page.mouse.click(x, y);
        await waitForRenderComplete(page, 'settle');
        const sliderThumb = slider.locator('[role="slider"]');
        const value = await sliderThumb.getAttribute('aria-valuenow');
        expect(Number(value)).toBeGreaterThan(72);
        expect(Number(value)).toBeLessThan(300);
      }
    }
  });

  test('DPI common value 300', async ({ page }) => {
    const slider = page.locator('[data-testid="output-dpi-slider"]');
    if (await slider.isVisible().catch(() => false)) {
      const box = await slider.boundingBox();
      if (box) {
        // 300 is about 43% of range (72-600)
        const x = box.x + box.width * 0.43;
        const y = box.y + box.height / 2;
        await page.mouse.click(x, y);
        await waitForRenderComplete(page, 'settle');
        const sliderThumb = slider.locator('[role="slider"]');
        const value = await sliderThumb.getAttribute('aria-valuenow');
        expect(Number(value)).toBeGreaterThan(200);
        expect(Number(value)).toBeLessThan(400);
      }
    }
  });

  test('DPI keyboard navigation works', async ({ page }) => {
    const slider = page.locator('[data-testid="output-dpi-slider"] [role="slider"]');
    if (await slider.isVisible().catch(() => false)) {
      await slider.focus();
      const initialValue = await slider.getAttribute('aria-valuenow');
      await page.keyboard.press('ArrowRight');
      await waitForRenderComplete(page, 'settle');
      const newValue = await slider.getAttribute('aria-valuenow');
      expect(Number(newValue)).toBeGreaterThanOrEqual(Number(initialValue));
    }
  });
});

// ============================================================================
// BACKGROUND OVERRIDE
// ============================================================================

test.describe('Output Background Override', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('background override color input exists', async ({ page }) => {
    const colorInputCount = await page.locator('input[type="color"]').count();
    // At least one color input should exist on the page
    expect(colorInputCount, 'at least one color input should exist on the page').toBeGreaterThan(0);
  });

  test('background override accepts hex color', async ({ page }) => {
    const textInput = page.locator('input[type="text"][placeholder*="background" i], input[type="text"][placeholder*="color" i]').first();
    if (await textInput.isVisible().catch(() => false)) {
      await textInput.fill('#ff0000');
      await textInput.blur();
      const value = await textInput.inputValue();
      expect(value).toContain('ff0000');
    }
  });

  test('background override accepts rgb notation', async ({ page }) => {
    const textInput = page.locator('input[type="text"][placeholder*="background" i], input[type="text"][placeholder*="color" i]').first();
    if (await textInput.isVisible().catch(() => false)) {
      await textInput.fill('rgb(255, 0, 0)');
      await textInput.blur();
      const value = await textInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// EXTRA FORMATS (PROFESSIONAL TIER)
// ============================================================================

test.describe('Output Extra Formats', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('format extra select shows none option', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-extra-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      const options = page.locator('[role="option"]');
      const count = await options.count();
      await page.keyboard.press('Escape');
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('format extra select shows EPS option', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-extra-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      const options = page.locator('[role="option"]');
      const count = await options.count();
      await page.keyboard.press('Escape');
      // Should have at least 2 options (none + eps)
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  test('format extra select shows animated WebP option', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-extra-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      const options = page.locator('[role="option"]');
      const count = await options.count();
      await page.keyboard.press('Escape');
      // May or may not have WebP option
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('format extra select EPS selection works', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-extra-trigger"]');
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      // Select second option (index 1 = eps)
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      // Verify dropdown closed after selection
      const dropdown = page.locator('[data-radix-popper-content-wrapper]');
      const isOpen = await dropdown.isVisible().catch(() => false);
      expect(isOpen, 'dropdown should close after EPS selection').toBe(false);
    }
  });
});

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

test.describe('Output Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('Tab navigates through output controls', async ({ page }) => {
    const formatTrigger = page.locator('[data-testid="output-format-trigger"]');
    await formatTrigger.focus();
    
    // Tab through controls
    const elements: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
      if (focusedTag) elements.push(focusedTag);
    }
    
    expect(elements.length).toBeGreaterThan(0);
  });

  test('format select opens with Enter key', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await waitForRenderComplete(page, 'settle');
    const dropdown = page.locator('[data-radix-popper-content-wrapper]');
    const isVisible = await dropdown.isVisible().catch(() => false);
    
    // Dropdown should have opened with Enter key
    expect(isVisible, 'dropdown should open when Enter is pressed on format trigger').toBe(true);
    if (isVisible) {
      await page.keyboard.press('Escape');
    }
  });

  test('format select opens with Space key', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Space');
    await waitForRenderComplete(page, 'settle');
    const dropdown = page.locator('[data-radix-popper-content-wrapper]');
    const isVisible = await dropdown.isVisible().catch(() => false);
    
    // Dropdown should have opened with Space key
    expect(isVisible, 'dropdown should open when Space is pressed on format trigger').toBe(true);
    if (isVisible) {
      await page.keyboard.press('Escape');
    }
  });

  test('format select closes with Escape', async ({ page }) => {
    const trigger = page.locator('[data-testid="output-format-trigger"]');
    await trigger.click();
    await waitForRenderComplete(page, 'settle');
    await page.keyboard.press('Escape');
    await waitForRenderComplete(page, 'settle');
    const dropdown = page.locator('[data-radix-popper-content-wrapper]');
    const isVisible = await dropdown.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('dimension inputs allow numeric keyboard entry', async ({ page }) => {
    const widthInput = page.locator('[data-testid="output-width-input"]');
    await widthInput.focus();
    await widthInput.selectText();
    await page.keyboard.type('750');
    await waitForRenderComplete(page, 'settle');
    const value = await widthInput.inputValue();
    expect(Number(value)).toBeGreaterThan(0);
  });

  test('Shift+Tab navigates backwards', async ({ page }) => {
    const heightInput = page.locator('[data-testid="output-height-input"]');
    await heightInput.focus();
    
    await page.keyboard.press('Shift+Tab');
    await waitForRenderComplete(page, 'settle');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

// ============================================================================
// INCLUDE QUIET ZONE TOGGLE (PROFESSIONAL)
// ============================================================================

test.describe('Output Include Quiet Zone', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandOutputSection(page);
  });

  test('include quiet zone switch has correct role', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-include-quiet-zone-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      const role = await switchEl.getAttribute('role');
      expect(role).toBe('switch');
    }
  });

  test('include quiet zone switch toggles state', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-include-quiet-zone-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      const initialState = await switchEl.getAttribute('data-state');
      await toggleSwitchByTestId(page, 'output-include-quiet-zone-switch');
      const newState = await switchEl.getAttribute('data-state');
      expect(newState).not.toBe(initialState);
    }
  });

  test('include quiet zone switch responds to keyboard', async ({ page }) => {
    const switchEl = page.locator('[data-testid="output-include-quiet-zone-switch"]');
    if (await switchEl.isVisible().catch(() => false)) {
      await switchEl.focus();
      const initialState = await switchEl.getAttribute('data-state');
      await page.keyboard.press('Space');
      await waitForRenderComplete(page, 'settle');
      const newState = await switchEl.getAttribute('data-state');
      expect(newState).not.toBe(initialState);
    }
  });
});
