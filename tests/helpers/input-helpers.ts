import type { Locator, Page } from '@playwright/test';

/**
 * Input Interaction Helpers for ANQR UI Testing
 * Handles Radix UI components (sliders, selects, switches) and standard inputs
 */

/**
 * Set a Radix UI Slider value
 * Radix sliders use aria-valuenow and can be set via keyboard or drag
 */
export async function setSlider(page: Page, selector: string, targetValue: number): Promise<void> {
  const slider = page.locator(selector).first();
  await slider.waitFor({ state: 'visible' });

  // Get current value and range
  const currentValue = await slider.getAttribute('aria-valuenow');
  const min = await slider.getAttribute('aria-valuemin');
  const max = await slider.getAttribute('aria-valuemax');

  const current = parseFloat(currentValue || '0');
  const minVal = parseFloat(min || '0');
  const maxVal = parseFloat(max || '100');

  // Calculate how many arrow key presses needed
  // This is more reliable than drag for Radix sliders
  const step = (maxVal - minVal) / 100; // Assume 100 steps
  const diff = targetValue - current;
  const presses = Math.abs(Math.round(diff / step));
  const key = diff > 0 ? 'ArrowRight' : 'ArrowLeft';

  // Focus and use keyboard to set value
  await slider.focus();
  for (let i = 0; i < Math.min(presses, 200); i++) {
    await slider.press(key);
  }
}

/**
 * Set a Radix UI Slider by clicking at a percentage position
 */
export async function setSliderByPercent(
  page: Page,
  selector: string,
  percent: number
): Promise<void> {
  const slider = page.locator(selector).first();
  await slider.waitFor({ state: 'visible' });

  const box = await slider.boundingBox();
  if (!box) throw new Error('Could not get slider bounding box');

  // Click at the percentage position
  const x = box.x + (box.width * percent) / 100;
  const y = box.y + box.height / 2;

  await page.mouse.click(x, y);
}

/**
 * Toggle a Radix UI Switch
 */
export async function toggleSwitch(page: Page, selector: string): Promise<void> {
  const switchEl = page.locator(selector).first();
  await switchEl.waitFor({ state: 'visible' });
  await switchEl.click();
}

/**
 * Set a Radix UI Switch to a specific state
 */
export async function setSwitch(page: Page, selector: string, checked: boolean): Promise<void> {
  const switchEl = page.locator(selector).first();
  await switchEl.waitFor({ state: 'visible' });

  const currentState = await switchEl.getAttribute('data-state');
  const isCurrentlyChecked = currentState === 'checked';

  if (isCurrentlyChecked !== checked) {
    await switchEl.click();
  }
}

/**
 * Set a color input (both native and text input)
 */
export async function setColorInput(
  page: Page,
  colorPickerSelector: string,
  hexColor: string
): Promise<void> {
  // Find the color input
  const colorInput = page.locator(colorPickerSelector).first();
  await colorInput.waitFor({ state: 'visible' });

  // Set value programmatically and dispatch events
  await colorInput.evaluate((el: HTMLInputElement, color: string) => {
    el.value = color;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, hexColor);
}

/**
 * Set a text input value
 */
export async function setTextInput(page: Page, selector: string, text: string): Promise<void> {
  const input = page.locator(selector).first();
  await input.waitFor({ state: 'visible' });

  // Clear and fill
  await input.clear();
  await input.fill(text);

  // Trigger blur to ensure React state updates
  await input.blur();
}

/**
 * Set a number input value
 */
export async function setNumberInput(page: Page, selector: string, value: number): Promise<void> {
  const input = page.locator(selector).first();
  await input.waitFor({ state: 'visible' });

  await input.clear();
  await input.fill(value.toString());
  await input.blur();
}

/**
 * Set a textarea value
 */
export async function setTextarea(page: Page, selector: string, text: string): Promise<void> {
  const textarea = page.locator(selector).first();
  await textarea.waitFor({ state: 'visible' });

  await textarea.clear();
  await textarea.fill(text);
  await textarea.blur();
}

/**
 * Click a button by data-testid
 * @param page - Playwright page
 * @param testId - The data-testid attribute value
 */
export async function clickButton(page: Page, testId: string): Promise<void> {
  await page.click(`[data-testid="${testId}"]`);
}

/**
 * Upload a file to a file input
 */
export async function uploadFile(
  page: Page,
  inputSelector: string,
  filePath: string
): Promise<void> {
  const input = page.locator(inputSelector).first();
  await input.setInputFiles(filePath);
}

/**
 * Get the current value of a slider
 */
export async function getSliderValue(page: Page, selector: string): Promise<number> {
  const slider = page.locator(selector).first();
  const value = await slider.getAttribute('aria-valuenow');
  return parseFloat(value || '0');
}

/**
 * Get the current state of a switch
 */
export async function getSwitchState(page: Page, selector: string): Promise<boolean> {
  const switchEl = page.locator(selector).first();
  const state = await switchEl.getAttribute('data-state');
  return state === 'checked';
}

/**
 * Get the current value of a select
 */
export async function getSelectValue(page: Page, triggerSelector: string): Promise<string> {
  const trigger = page.locator(triggerSelector).first();
  const _valueSpan = trigger.locator('[data-placeholder]').first();

  // Try to get from the displayed value
  const text = await trigger.textContent();
  return text?.trim() || '';
}

/**
 * Wait for input to be interactive
 */
export async function waitForInput(page: Page, selector: string): Promise<Locator> {
  const input = page.locator(selector).first();
  await input.waitFor({ state: 'visible' });
  return input;
}
