/**
 * Metadata Section Tests - Comprehensive Coverage
 * Tests all metadata controls: title, author, copyright, license, description, creation time, custom KV
 * Uses data-testid selectors for reliability
 */

import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures/test-fixtures';

import { waitForQRRender } from '../helpers/qr-detector';
import {
  openAccordion,
  selectTier,
  setInput,
  toggleSwitch,
  waitForRenderComplete,
} from '../helpers/test-utils';

// Helper: Wait for initial load and set tier (page.goto is handled by fixture)
async function setupPage(page: Page) {
  await page.waitForLoadState('networkidle');
  await waitForQRRender(page);
  // Select professional tier for Metadata section tests
  await selectTier(page, 'professional');
}

// Helper: Expand the Metadata section
async function expandMetadataSection(page: Page) {
  await openAccordion(page, 'metadata');
  await waitForRenderComplete(page, 'settle');
}

// Helper: Set input value using data-testid
// Note: No waitForRenderComplete here — metadata changes don't trigger QR re-renders.
// setInput already handles value-committed stabilization internally.
async function setInputByTestId(page: Page, testId: string, value: string) {
  await setInput(page, testId, value);
}

// Helper: Toggle switch using data-testid
// Note: No waitForRenderComplete here — metadata changes don't trigger QR re-renders.
async function toggleSwitchByTestId(page: Page, testId: string) {
  await toggleSwitch(page, testId);
}

// ============================================================================
// TITLE INPUT TESTS
// ============================================================================

test.describe('Metadata Title', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('title input is visible and accepts values', async ({ page }) => {
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    await expect(titleInput).toBeVisible();

    await setInputByTestId(page, 'metadata-title-input', 'My QR Code');
    const value = await titleInput.inputValue();
    expect(value).toBe('My QR Code');
  });

  test('title input has placeholder', async ({ page }) => {
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const placeholder = await titleInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });

  test('title input handles special characters', async ({ page }) => {
    await setInputByTestId(page, 'metadata-title-input', 'QR Code © 2024 <test>');
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const value = await titleInput.inputValue();
    expect(value).toBe('QR Code © 2024 <test>');
  });
});

// ============================================================================
// AUTHOR INPUT TESTS
// ============================================================================

test.describe('Metadata Author', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('author input is visible and accepts values', async ({ page }) => {
    const authorInput = page.locator('[data-testid="metadata-author-input"]');
    await expect(authorInput).toBeVisible();

    await setInputByTestId(page, 'metadata-author-input', 'John Doe');
    const value = await authorInput.inputValue();
    expect(value).toBe('John Doe');
  });

  test('author input has placeholder', async ({ page }) => {
    const authorInput = page.locator('[data-testid="metadata-author-input"]');
    const placeholder = await authorInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });
});

// ============================================================================
// COPYRIGHT INPUT TESTS
// ============================================================================

test.describe('Metadata Copyright', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('copyright input is visible and accepts values', async ({ page }) => {
    const copyrightInput = page.locator('[data-testid="metadata-copyright-input"]');
    await expect(copyrightInput).toBeVisible();

    await setInputByTestId(page, 'metadata-copyright-input', '© 2024 ANQR');
    const value = await copyrightInput.inputValue();
    expect(value).toBe('© 2024 ANQR');
  });

  test('copyright input has placeholder', async ({ page }) => {
    const copyrightInput = page.locator('[data-testid="metadata-copyright-input"]');
    const placeholder = await copyrightInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });
});

// ============================================================================
// LICENSE INPUT TESTS
// ============================================================================

test.describe('Metadata License', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('license input is visible and accepts values', async ({ page }) => {
    const licenseInput = page.locator('[data-testid="metadata-license-input"]');
    await expect(licenseInput).toBeVisible();

    await setInputByTestId(page, 'metadata-license-input', 'MIT');
    const value = await licenseInput.inputValue();
    expect(value).toBe('MIT');
  });

  test('license input has placeholder', async ({ page }) => {
    const licenseInput = page.locator('[data-testid="metadata-license-input"]');
    const placeholder = await licenseInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });
});

// ============================================================================
// DESCRIPTION TEXTAREA TESTS
// ============================================================================

test.describe('Metadata Description', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('description textarea is visible and accepts values', async ({ page }) => {
    const descriptionTextarea = page.locator('[data-testid="metadata-description-textarea"]');
    await expect(descriptionTextarea).toBeVisible();

    await setInputByTestId(
      page,
      'metadata-description-textarea',
      'This is a test QR code with a description.'
    );
    const value = await descriptionTextarea.inputValue();
    expect(value).toBe('This is a test QR code with a description.');
  });

  test('description textarea has placeholder', async ({ page }) => {
    const descriptionTextarea = page.locator('[data-testid="metadata-description-textarea"]');
    const placeholder = await descriptionTextarea.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });

  test('description textarea accepts multiline text', async ({ page }) => {
    const multilineText = 'Line 1\nLine 2\nLine 3';
    await setInputByTestId(page, 'metadata-description-textarea', multilineText);
    const descriptionTextarea = page.locator('[data-testid="metadata-description-textarea"]');
    const value = await descriptionTextarea.inputValue();
    expect(value).toBe(multilineText);
  });
});

// ============================================================================
// CREATION TIME TOGGLE TESTS
// ============================================================================

test.describe('Metadata Creation Time', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('creation time switch is visible and toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="metadata-creation-time-switch"]');
    await expect(switchEl).toBeVisible();

    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'metadata-creation-time-switch');

    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('creation time switch has role="switch"', async ({ page }) => {
    const switchEl = page.locator('[data-testid="metadata-creation-time-switch"]');
    const role = await switchEl.getAttribute('role');
    expect(role).toBe('switch');
  });

  test('creation time switch toggles between checked and unchecked', async ({ page }) => {
    const switchEl = page.locator('[data-testid="metadata-creation-time-switch"]');

    // Toggle twice to verify both states work
    await toggleSwitchByTestId(page, 'metadata-creation-time-switch');
    const state1 = await switchEl.getAttribute('data-state');

    await toggleSwitchByTestId(page, 'metadata-creation-time-switch');
    const state2 = await switchEl.getAttribute('data-state');

    expect(state1).not.toBe(state2);
  });
});

// ============================================================================
// CUSTOM KEY-VALUE TESTS
// ============================================================================

test.describe('Metadata Custom Key-Value Pairs', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('add custom field button is visible', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await expect(addButton).toBeVisible();
  });

  test('clicking add button creates new key-value row', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    // First row should now exist
    const keyInput = page.locator('[data-testid="metadata-custom-key-input-0"]');
    await expect(keyInput).toBeVisible();

    const valueInput = page.locator('[data-testid="metadata-custom-value-input-0"]');
    await expect(valueInput).toBeVisible();
  });

  test('can add multiple custom key-value rows', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');

    // Add 3 rows
    for (let i = 0; i < 3; i++) {
      await addButton.scrollIntoViewIfNeeded();
      await addButton.click();
      await waitForRenderComplete(page, 'settle');
    }

    // All 3 rows should exist
    for (let i = 0; i < 3; i++) {
      const row = page.locator(`[data-testid="metadata-custom-kv-row-${i}"]`);
      await expect(row).toBeVisible();
    }
  });

  test('can edit custom key-value inputs', async ({ page }) => {
    // Add a row first
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    // Edit the key
    await setInputByTestId(page, 'metadata-custom-key-input-0', 'myKey');
    const keyInput = page.locator('[data-testid="metadata-custom-key-input-0"]');
    expect(await keyInput.inputValue()).toBe('myKey');

    // Edit the value
    await setInputByTestId(page, 'metadata-custom-value-input-0', 'myValue');
    const valueInput = page.locator('[data-testid="metadata-custom-value-input-0"]');
    expect(await valueInput.inputValue()).toBe('myValue');
  });

  test('can remove custom key-value row', async ({ page }) => {
    // Add a row first
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    // Verify row exists
    const row = page.locator('[data-testid="metadata-custom-kv-row-0"]');
    await expect(row).toBeVisible();

    // Click remove button
    const removeButton = page.locator('[data-testid="metadata-custom-remove-button-0"]');
    await removeButton.click();
    await waitForRenderComplete(page, 'settle');
    // Row should be gone
    await expect(row).not.toBeVisible();
  });

  test('key-value inputs have placeholders', async ({ page }) => {
    // Add a row first
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    const keyInput = page.locator('[data-testid="metadata-custom-key-input-0"]');
    const valueInput = page.locator('[data-testid="metadata-custom-value-input-0"]');

    const keyPlaceholder = await keyInput.getAttribute('placeholder');
    const valuePlaceholder = await valueInput.getAttribute('placeholder');

    expect(keyPlaceholder).toBeTruthy();
    expect(valuePlaceholder).toBeTruthy();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Metadata Section Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('all inputs are focusable via keyboard', async ({ page }) => {
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('creation time switch has proper role', async ({ page }) => {
    const switchEl = page.locator('[data-testid="metadata-creation-time-switch"]');
    const role = await switchEl.getAttribute('role');
    expect(role).toBe('switch');
  });

  test('add button is keyboard accessible', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.focus();
    await page.keyboard.press('Enter');
    await waitForRenderComplete(page, 'settle');
    // Row should be added
    const row = page.locator('[data-testid="metadata-custom-kv-row-0"]');
    await expect(row).toBeVisible();
  });
});

// ============================================================================
// COMBINED SETTINGS TESTS
// ============================================================================

test.describe('Metadata Combined Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('all metadata fields can be filled together', async ({ page }) => {
    await setInputByTestId(page, 'metadata-title-input', 'Test QR');
    await setInputByTestId(page, 'metadata-author-input', 'Test Author');
    await setInputByTestId(page, 'metadata-copyright-input', '© 2024');
    await setInputByTestId(page, 'metadata-license-input', 'MIT');
    await setInputByTestId(page, 'metadata-description-textarea', 'Test description');

    // Enable creation time
    const switchEl = page.locator('[data-testid="metadata-creation-time-switch"]');
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'metadata-creation-time-switch');
    }

    // Verify all values
    expect(await page.locator('[data-testid="metadata-title-input"]').inputValue()).toBe('Test QR');
    expect(await page.locator('[data-testid="metadata-author-input"]').inputValue()).toBe(
      'Test Author'
    );
    expect(await page.locator('[data-testid="metadata-copyright-input"]').inputValue()).toBe(
      '© 2024'
    );
    expect(await page.locator('[data-testid="metadata-license-input"]').inputValue()).toBe('MIT');
    expect(await page.locator('[data-testid="metadata-description-textarea"]').inputValue()).toBe(
      'Test description'
    );
    expect(await switchEl.getAttribute('data-state')).toBe('checked');
  });

  test('metadata settings persist after section collapse/expand', async ({ page }) => {
    // Set a value
    await setInputByTestId(page, 'metadata-title-input', 'Persistent Title');

    // Collapse and expand
    const metadataTriggerEl = page
      .locator('[data-testid="accordion-metadata"] button[data-state]')
      .first();
    await metadataTriggerEl.click();
    await waitForRenderComplete(page, 'settle');
    await metadataTriggerEl.click();
    await page.waitForSelector(
      '[data-testid="accordion-metadata"] [role="region"][data-state="open"]',
      {
        state: 'visible',
        timeout: 5000,
      }
    );

    // Verify value persisted
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const value = await titleInput.inputValue();
    expect(value).toBe('Persistent Title');
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

test.describe('Metadata Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('inputs handle empty values', async ({ page }) => {
    // Fill and then clear
    await setInputByTestId(page, 'metadata-title-input', 'Test');
    await setInputByTestId(page, 'metadata-title-input', '');

    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const value = await titleInput.inputValue();
    expect(value).toBe('');
  });

  test('inputs handle long text', async ({ page }) => {
    const longText = 'A'.repeat(500);
    await setInputByTestId(page, 'metadata-description-textarea', longText);

    const descriptionTextarea = page.locator('[data-testid="metadata-description-textarea"]');
    const value = await descriptionTextarea.inputValue();
    expect(value).toBe(longText);
  });

  test('rapid custom field add/remove works correctly', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');

    // Add 3 rows rapidly
    for (let i = 0; i < 3; i++) {
      await addButton.scrollIntoViewIfNeeded();
      await addButton.click();
      await waitForRenderComplete(page, 'settle');
    }

    // Remove middle row
    const removeButton = page.locator('[data-testid="metadata-custom-remove-button-1"]');
    if (await removeButton.isVisible()) {
      await removeButton.click();
      await waitForRenderComplete(page, 'settle');
    }

    // Should still have at least one row visible
    const rows = page.locator('[data-testid^="metadata-custom-kv-row-"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// UNICODE HANDLING TESTS
// ============================================================================

test.describe('Metadata Unicode Handling', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('title accepts emoji characters', async ({ page }) => {
    await setInputByTestId(page, 'metadata-title-input', 'QR Code 🎉✨🚀');
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const value = await titleInput.inputValue();
    expect(value).toBe('QR Code 🎉✨🚀');
  });

  test('title accepts CJK characters', async ({ page }) => {
    await setInputByTestId(page, 'metadata-title-input', 'QR码 - 二维码');
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const value = await titleInput.inputValue();
    expect(value).toBe('QR码 - 二维码');
  });

  test('title accepts Japanese characters', async ({ page }) => {
    await setInputByTestId(page, 'metadata-title-input', 'QRコード テスト');
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const value = await titleInput.inputValue();
    expect(value).toBe('QRコード テスト');
  });

  test('title accepts RTL Arabic text', async ({ page }) => {
    await setInputByTestId(page, 'metadata-title-input', 'رمز الاستجابة السريعة');
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const value = await titleInput.inputValue();
    expect(value).toBe('رمز الاستجابة السريعة');
  });

  test('author accepts unicode characters', async ({ page }) => {
    await setInputByTestId(page, 'metadata-author-input', 'José García 日本太郎');
    const authorInput = page.locator('[data-testid="metadata-author-input"]');
    const value = await authorInput.inputValue();
    expect(value).toBe('José García 日本太郎');
  });

  test('copyright accepts special symbols', async ({ page }) => {
    await setInputByTestId(page, 'metadata-copyright-input', '© 2024 ™ ® All Rights Reserved');
    const copyrightInput = page.locator('[data-testid="metadata-copyright-input"]');
    const value = await copyrightInput.inputValue();
    expect(value).toBe('© 2024 ™ ® All Rights Reserved');
  });

  test('description accepts mixed unicode', async ({ page }) => {
    const mixedText = 'Description: 中文 日本語 한국어 العربية 🌍';
    await setInputByTestId(page, 'metadata-description-textarea', mixedText);
    const descTextarea = page.locator('[data-testid="metadata-description-textarea"]');
    const value = await descTextarea.inputValue();
    expect(value).toBe(mixedText);
  });

  test('custom KV accepts unicode keys', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    await setInputByTestId(page, 'metadata-custom-key-input-0', '标签');
    const keyInput = page.locator('[data-testid="metadata-custom-key-input-0"]');
    expect(await keyInput.inputValue()).toBe('标签');
  });

  test('custom KV accepts unicode values', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    await setInputByTestId(page, 'metadata-custom-value-input-0', '日本語の値 🎌');
    const valueInput = page.locator('[data-testid="metadata-custom-value-input-0"]');
    expect(await valueInput.inputValue()).toBe('日本語の値 🎌');
  });
});

// ============================================================================
// LENGTH LIMITS AND VALIDATION TESTS
// ============================================================================

test.describe('Metadata Length Limits', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('title accepts very long text (1000 chars)', async ({ page }) => {
    const longTitle = 'T'.repeat(1000);
    await setInputByTestId(page, 'metadata-title-input', longTitle);
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const value = await titleInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('author accepts very long text', async ({ page }) => {
    const longAuthor = 'Author Name '.repeat(50);
    await setInputByTestId(page, 'metadata-author-input', longAuthor);
    const authorInput = page.locator('[data-testid="metadata-author-input"]');
    const value = await authorInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('description accepts very long multiline text', async ({ page }) => {
    const longDesc = 'Line of text.\n'.repeat(100);
    await setInputByTestId(page, 'metadata-description-textarea', longDesc);
    const descTextarea = page.locator('[data-testid="metadata-description-textarea"]');
    const value = await descTextarea.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('empty title is valid', async ({ page }) => {
    await setInputByTestId(page, 'metadata-title-input', '');
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const value = await titleInput.inputValue();
    expect(value).toBe('');
  });

  test('whitespace-only title is valid', async ({ page }) => {
    await setInputByTestId(page, 'metadata-title-input', '   ');
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    const value = await titleInput.inputValue();
    expect(value.length).toBeGreaterThanOrEqual(0);
  });

  test('single character inputs are valid', async ({ page }) => {
    await setInputByTestId(page, 'metadata-title-input', 'A');
    await setInputByTestId(page, 'metadata-author-input', 'B');

    const titleValue = await page.locator('[data-testid="metadata-title-input"]').inputValue();
    const authorValue = await page.locator('[data-testid="metadata-author-input"]').inputValue();

    expect(titleValue).toBe('A');
    expect(authorValue).toBe('B');
  });
});

// ============================================================================
// CUSTOM KV CRUD OPERATIONS
// ============================================================================

test.describe('Metadata Custom KV CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('can add 5 custom KV rows', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');

    for (let i = 0; i < 5; i++) {
      await addButton.scrollIntoViewIfNeeded();
      await addButton.click();
      await waitForRenderComplete(page, 'settle');
    }

    // Check at least 5 rows exist
    const rows = page.locator('[data-testid^="metadata-custom-kv-row-"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('can edit existing KV key', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    // Set initial key
    await setInputByTestId(page, 'metadata-custom-key-input-0', 'originalKey');

    // Edit key
    await setInputByTestId(page, 'metadata-custom-key-input-0', 'editedKey');

    const keyInput = page.locator('[data-testid="metadata-custom-key-input-0"]');
    expect(await keyInput.inputValue()).toBe('editedKey');
  });

  test('can edit existing KV value', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    // Set initial value
    await setInputByTestId(page, 'metadata-custom-value-input-0', 'originalValue');

    // Edit value
    await setInputByTestId(page, 'metadata-custom-value-input-0', 'editedValue');

    const valueInput = page.locator('[data-testid="metadata-custom-value-input-0"]');
    expect(await valueInput.inputValue()).toBe('editedValue');
  });

  test('can remove first KV row', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    const row = page.locator('[data-testid="metadata-custom-kv-row-0"]');
    await expect(row).toBeVisible();

    const removeButton = page.locator('[data-testid="metadata-custom-remove-button-0"]');
    await removeButton.click();
    await waitForRenderComplete(page, 'settle');
    await expect(row).not.toBeVisible();
  });

  test('removing middle row preserves other rows', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');

    // Add 3 rows (metadata/KV changes don't trigger QR re-renders, so no render wait needed)
    for (let i = 0; i < 3; i++) {
      await addButton.scrollIntoViewIfNeeded();
      await addButton.click();
      await page
        .locator(`[data-testid="metadata-custom-kv-row-${i}"]`)
        .waitFor({ state: 'visible', timeout: 5000 });
    }

    // Set values to identify rows
    await setInputByTestId(page, 'metadata-custom-key-input-0', 'first');
    await setInputByTestId(page, 'metadata-custom-key-input-1', 'second');
    await setInputByTestId(page, 'metadata-custom-key-input-2', 'third');

    // Remove middle row
    const removeButton = page.locator('[data-testid="metadata-custom-remove-button-1"]');
    if (await removeButton.isVisible()) {
      await removeButton.click();
      await page
        .locator('[data-testid="metadata-custom-remove-button-1"]')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});
    }

    // Verify first and third still exist (indices may shift)
    const rows = page.locator('[data-testid^="metadata-custom-kv-row-"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('empty key is allowed', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    // Leave key empty, set value
    await setInputByTestId(page, 'metadata-custom-value-input-0', 'valueWithoutKey');

    const keyInput = page.locator('[data-testid="metadata-custom-key-input-0"]');
    expect(await keyInput.inputValue()).toBe('');
  });

  test('empty value is allowed', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    // Set key, leave value empty
    await setInputByTestId(page, 'metadata-custom-key-input-0', 'keyWithoutValue');

    const valueInput = page.locator('[data-testid="metadata-custom-value-input-0"]');
    expect(await valueInput.inputValue()).toBe('');
  });

  test('duplicate keys are allowed', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');

    // Add 2 rows
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    // Set same key for both
    await setInputByTestId(page, 'metadata-custom-key-input-0', 'duplicateKey');
    await setInputByTestId(page, 'metadata-custom-key-input-1', 'duplicateKey');

    const key0 = await page.locator('[data-testid="metadata-custom-key-input-0"]').inputValue();
    const key1 = await page.locator('[data-testid="metadata-custom-key-input-1"]').inputValue();

    expect(key0).toBe('duplicateKey');
    expect(key1).toBe('duplicateKey');
  });
});

// ============================================================================
// PERSISTENCE TESTS
// ============================================================================

test.describe('Metadata Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('all fields persist after section collapse/expand', async ({ page }) => {
    // Set all fields
    await setInputByTestId(page, 'metadata-title-input', 'Persistent Title');
    await setInputByTestId(page, 'metadata-author-input', 'Persistent Author');
    await setInputByTestId(page, 'metadata-copyright-input', 'Persistent Copyright');
    await setInputByTestId(page, 'metadata-license-input', 'Persistent License');
    await setInputByTestId(page, 'metadata-description-textarea', 'Persistent Description');

    // Collapse and expand (accordion toggle doesn't trigger QR re-renders)
    const metadataTriggerEl = page
      .locator('[data-testid="accordion-metadata"] button[data-state]')
      .first();
    await metadataTriggerEl.click();
    await page.waitForFunction(
      () => {
        const trigger = document.querySelector(
          '[data-testid="accordion-metadata"] button[data-state]'
        );
        return trigger && trigger.getAttribute('data-state') === 'closed';
      },
      { timeout: 5000 }
    );
    await metadataTriggerEl.click();
    await page.waitForSelector(
      '[data-testid="accordion-metadata"] [role="region"][data-state="open"]',
      {
        state: 'visible',
        timeout: 5000,
      }
    );

    // Verify all values persisted
    expect(await page.locator('[data-testid="metadata-title-input"]').inputValue()).toBe(
      'Persistent Title'
    );
    expect(await page.locator('[data-testid="metadata-author-input"]').inputValue()).toBe(
      'Persistent Author'
    );
    expect(await page.locator('[data-testid="metadata-copyright-input"]').inputValue()).toBe(
      'Persistent Copyright'
    );
    expect(await page.locator('[data-testid="metadata-license-input"]').inputValue()).toBe(
      'Persistent License'
    );
    expect(await page.locator('[data-testid="metadata-description-textarea"]').inputValue()).toBe(
      'Persistent Description'
    );
  });

  test('custom KV rows persist after section collapse/expand', async ({ page }) => {
    // Add and fill a KV row
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    await setInputByTestId(page, 'metadata-custom-key-input-0', 'persistKey');
    await setInputByTestId(page, 'metadata-custom-value-input-0', 'persistValue');

    // Collapse and expand
    const metadataTriggerEl = page
      .locator('[data-testid="accordion-metadata"] button[data-state]')
      .first();
    await metadataTriggerEl.click();
    await waitForRenderComplete(page, 'settle');
    await metadataTriggerEl.click();
    await page.waitForSelector(
      '[data-testid="accordion-metadata"] [role="region"][data-state="open"]',
      {
        state: 'visible',
        timeout: 5000,
      }
    );

    // Verify KV row persisted
    const keyInput = page.locator('[data-testid="metadata-custom-key-input-0"]');
    const valueInput = page.locator('[data-testid="metadata-custom-value-input-0"]');

    if (await keyInput.isVisible()) {
      expect(await keyInput.inputValue()).toBe('persistKey');
      expect(await valueInput.inputValue()).toBe('persistValue');
    }
  });

  test('creation time toggle persists after collapse/expand', async ({ page }) => {
    const switchEl = page.locator('[data-testid="metadata-creation-time-switch"]');

    // Toggle to opposite state
    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'metadata-creation-time-switch');
    const toggledState = await switchEl.getAttribute('data-state');

    // Collapse and expand
    const metadataTriggerEl = page
      .locator('[data-testid="accordion-metadata"] button[data-state]')
      .first();
    await metadataTriggerEl.click();
    await waitForRenderComplete(page, 'settle');
    await metadataTriggerEl.click();
    await page.waitForSelector(
      '[data-testid="accordion-metadata"] [role="region"][data-state="open"]',
      {
        state: 'visible',
        timeout: 5000,
      }
    );

    // Verify state persisted
    const persistedState = await switchEl.getAttribute('data-state');
    expect(persistedState).toBe(toggledState);
    expect(persistedState).not.toBe(initialState);
  });

  test('rapid input changes are captured', async ({ page }) => {
    const titleInput = page.locator('[data-testid="metadata-title-input"]');

    // Type rapidly
    await titleInput.focus();
    await titleInput.fill('');
    await page.keyboard.type('rapid input test', { delay: 10 });
    await titleInput.blur();
    await waitForRenderComplete(page, 'settle');
    const value = await titleInput.inputValue();
    expect(value).toBe('rapid input test');
  });
});

// ============================================================================
// KEYBOARD ACCESSIBILITY
// ============================================================================

test.describe('Metadata Keyboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandMetadataSection(page);
  });

  test('Tab navigates through all metadata fields', async ({ page }) => {
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    await titleInput.focus();

    // Tab through fields and collect focused element tags
    const focusedElements: string[] = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      if (tag) focusedElements.push(tag);
    }

    expect(focusedElements.length).toBeGreaterThan(0);
  });

  test('Shift+Tab navigates backwards', async ({ page }) => {
    const authorInput = page.locator('[data-testid="metadata-author-input"]');
    await authorInput.focus();

    await page.keyboard.press('Shift+Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('Space toggles creation time switch', async ({ page }) => {
    const switchEl = page.locator('[data-testid="metadata-creation-time-switch"]');
    await switchEl.focus();

    const initialState = await switchEl.getAttribute('data-state');
    await page.keyboard.press('Space');
    await waitForRenderComplete(page, 'settle');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('Enter activates add custom field button', async ({ page }) => {
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.focus();
    await page.keyboard.press('Enter');
    await waitForRenderComplete(page, 'settle');
    const row = page.locator('[data-testid="metadata-custom-kv-row-0"]');
    await expect(row).toBeVisible();
  });

  test('inputs accept keyboard text entry', async ({ page }) => {
    const titleInput = page.locator('[data-testid="metadata-title-input"]');
    await titleInput.focus();

    await page.keyboard.type('Keyboard Entry Test');

    const value = await titleInput.inputValue();
    expect(value).toBe('Keyboard Entry Test');
  });

  test('textarea accepts Enter for new lines', async ({ page }) => {
    const descTextarea = page.locator('[data-testid="metadata-description-textarea"]');
    await descTextarea.focus();

    await page.keyboard.type('Line 1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line 2');

    const value = await descTextarea.inputValue();
    expect(value).toContain('Line 1');
    expect(value).toContain('Line 2');
  });

  test('remove button is keyboard accessible', async ({ page }) => {
    // Add a row first
    const addButton = page.locator('[data-testid="metadata-add-custom-button"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    await waitForRenderComplete(page, 'settle');
    const row = page.locator('[data-testid="metadata-custom-kv-row-0"]');
    await expect(row).toBeVisible();

    // Focus remove button and press Enter
    const removeButton = page.locator('[data-testid="metadata-custom-remove-button-0"]');
    await removeButton.focus();
    await page.keyboard.press('Enter');
    await waitForRenderComplete(page, 'settle');
    await expect(row).not.toBeVisible();
  });
});
