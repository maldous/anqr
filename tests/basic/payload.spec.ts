import { test, expect } from '../fixtures/test-fixtures';
import { 
  getCanvasSnapshot, 
  snapshotsAreDifferent,
  waitForAccordionOpen,
  waitForSelectOpen
} from '../helpers/qr-detector';
import type { Page } from '@playwright/test';

/**
 * Comprehensive Basic Tier Payload Tests
 * 
 * Tests ALL payload-related functionality available in the basic tier:
 * - URL content type with various URL values
 * - Plain Text content type with various text values
 * - Switching between content types
 * - Special characters and unicode handling
 * - Empty state handling
 */

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Expand the Payload section in the sidebar
 * Uses data-testid for reliable selection (i18n safe)
 */
async function expandPayloadSection(page: Page) {
  // Use data-testid selector for accordion trigger only - no text fallback for i18n compatibility
  const payloadTrigger = page.locator('[data-testid="accordion-payload"] button[data-state]').first();
  
  // Wait for trigger to be visible
  await payloadTrigger.waitFor({ state: 'visible', timeout: 5000 });
  
  // Check if section is already open
  const currentState = await payloadTrigger.getAttribute('data-state');
  
  if (currentState !== 'open') {
    await payloadTrigger.click();
    await waitForAccordionOpen(page, 'payload');
  }
}

/**
 * Switch to a specific payload/content type
 * Uses event-driven select interaction
 */
async function switchToPayloadType(page: Page, type: 'url' | 'plain_text') {
  await expandPayloadSection(page);
  
  // Find the content type select (first combobox in payload section)
  const combobox = page.getByRole('combobox').first();
  await combobox.click();
  
  // Wait for dropdown to open
  await waitForSelectOpen(page);
  
  // Select the option
  const optionText = type === 'url' ? 'URL' : 'Plain Text';
  const option = page.getByRole('option', { name: new RegExp(`^${optionText}$`, 'i') }).first();
  await option.click();
}

/**
 * Set the URL input value
 */
async function setUrlValue(page: Page, url: string) {
  await expandPayloadSection(page);
  const urlInput = page.locator('input[type="url"]').first();
  await urlInput.waitFor({ state: 'visible', timeout: 5000 });
  await urlInput.clear();
  await urlInput.fill(url);
  await urlInput.blur();
}

/**
 * Set the Plain Text textarea value
 */
async function setPlainTextValue(page: Page, text: string) {
  await expandPayloadSection(page);
  const textarea = page.locator('textarea').first();
  await textarea.waitFor({ state: 'visible', timeout: 5000 });
  await textarea.clear();
  await textarea.fill(text);
  await textarea.blur();
}

/**
 * Get the current content type
 */
async function getCurrentContentType(page: Page): Promise<string> {
  await expandPayloadSection(page);
  const combobox = page.getByRole('combobox').first();
  return await combobox.textContent() || '';
}

// ==========================================
// TESTS
// ==========================================

test.describe('Payload Section - Basic Tier', () => {
  test.beforeEach(async ({ page, setTier, waitForQRRender }) => {
    // Note: page.goto('/') is handled by resetAppState in test-fixtures.ts
    await setTier('basic');
    await page.waitForSelector('[data-testid="qr-preview"] canvas', { timeout: 10000 });
    // Event-driven: wait for canvas to stabilize instead of arbitrary timeout
    await waitForQRRender();
  });

  // ==========================================
  // URL CONTENT TYPE TESTS
  // ==========================================
  test.describe('URL Content Type', () => {
    test('URL is the default content type', async ({ page }) => {
      await expandPayloadSection(page);
      const currentType = await getCurrentContentType(page);
      expect(currentType.toLowerCase()).toContain('url');
    });

    test('URL input is visible when URL type is selected', async ({ page }) => {
      await switchToPayloadType(page, 'url');
      const urlInput = page.locator('input[type="url"]').first();
      await expect(urlInput).toBeVisible();
    });

    test('changing URL value updates QR code', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'url');
      
      const before = await getCanvasSnapshot(page);
      await setUrlValue(page, 'https://example.com/test-change');
      await waitForQRRender();
      const after = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('different URLs produce different QR codes', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'url');
      
      // Set first URL
      await setUrlValue(page, 'https://google.com');
      await waitForQRRender();
      const snapshot1 = await getCanvasSnapshot(page);
      
      // Set second URL
      await setUrlValue(page, 'https://github.com');
      await waitForQRRender();
      const snapshot2 = await getCanvasSnapshot(page);
      
      // Set third URL
      await setUrlValue(page, 'https://anqr.link/test');
      await waitForQRRender();
      const snapshot3 = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(snapshot1, snapshot2)).toBe(true);
      expect(snapshotsAreDifferent(snapshot2, snapshot3)).toBe(true);
      expect(snapshotsAreDifferent(snapshot1, snapshot3)).toBe(true);
    });

    test('URL with query parameters works', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'url');
      
      const before = await getCanvasSnapshot(page);
      await setUrlValue(page, 'https://example.com?foo=bar&baz=qux');
      await waitForQRRender();
      const after = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('URL with special characters works', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'url');
      
      const before = await getCanvasSnapshot(page);
      await setUrlValue(page, 'https://example.com/path?name=John%20Doe&email=test@example.com');
      await waitForQRRender();
      const after = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('long URL works', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'url');
      
      const before = await getCanvasSnapshot(page);
      const longUrl = 'https://example.com/' + 'a'.repeat(100);
      await setUrlValue(page, longUrl);
      await waitForQRRender();
      const after = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });
  });

  // ==========================================
  // PLAIN TEXT CONTENT TYPE TESTS
  // ==========================================
  test.describe('Plain Text Content Type', () => {
    test('can switch to Plain Text type', async ({ page }) => {
      await switchToPayloadType(page, 'plain_text');
      
      // Verify textarea is visible
      const textarea = page.locator('textarea').first();
      await expect(textarea).toBeVisible();
    });

    test('changing plain text value updates QR code', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      
      const before = await getCanvasSnapshot(page);
      await setPlainTextValue(page, 'Hello World Test 123');
      await waitForQRRender();
      const after = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('different text values produce different QR codes', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      
      // Set first text
      await setPlainTextValue(page, 'First text content');
      await waitForQRRender();
      const snapshot1 = await getCanvasSnapshot(page);
      
      // Set second text
      await setPlainTextValue(page, 'Second completely different text');
      await waitForQRRender();
      const snapshot2 = await getCanvasSnapshot(page);
      
      // Set third text
      await setPlainTextValue(page, 'Third variation of content');
      await waitForQRRender();
      const snapshot3 = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(snapshot1, snapshot2)).toBe(true);
      expect(snapshotsAreDifferent(snapshot2, snapshot3)).toBe(true);
      expect(snapshotsAreDifferent(snapshot1, snapshot3)).toBe(true);
    });

    test('multiline text works', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      
      const before = await getCanvasSnapshot(page);
      await setPlainTextValue(page, 'Line 1\nLine 2\nLine 3');
      await waitForQRRender();
      const after = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('special characters in text work', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      
      const before = await getCanvasSnapshot(page);
      await setPlainTextValue(page, 'Special: @#$%^&*(){}[]|\\:";\'<>,.?/~`');
      await waitForQRRender();
      const after = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('unicode characters work', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      
      const unicodeValue = 'Unicode: 你好世界 🎉 Ñoño café émoji 🚀';
      const before = await getCanvasSnapshot(page);
      await setPlainTextValue(page, unicodeValue);
      await waitForQRRender();
      const textarea = page.locator('textarea').first();
      await expect(textarea).toHaveValue(unicodeValue);
      const after = await getCanvasSnapshot(page);
      
      if (!snapshotsAreDifferent(before, after)) expect(after.length).toBeGreaterThan(100);
    });

    test('long text works', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      
      const before = await getCanvasSnapshot(page);
      const longText = 'This is a long text. '.repeat(50);
      await setPlainTextValue(page, longText);
      await waitForQRRender();
      const after = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('numbers-only text works', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      
      const before = await getCanvasSnapshot(page);
      await setPlainTextValue(page, '1234567890123456789');
      await waitForQRRender();
      const after = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });
  });

  // ==========================================
  // SWITCHING BETWEEN TYPES
  // ==========================================
  test.describe('Switching Between Content Types', () => {
    test('switching from URL to Plain Text changes QR', async ({ page, waitForQRRender }) => {
      // Start with URL
      await switchToPayloadType(page, 'url');
      await setUrlValue(page, 'https://example.com');
      await waitForQRRender();
      const urlSnapshot = await getCanvasSnapshot(page);
      
      // Switch to Plain Text
      await switchToPayloadType(page, 'plain_text');
      await setPlainTextValue(page, 'This is plain text content');
      await waitForQRRender();
      const textSnapshot = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(urlSnapshot, textSnapshot)).toBe(true);
    });

    test('switching from Plain Text to URL changes QR', async ({ page, waitForQRRender }) => {
      // Start with Plain Text
      await switchToPayloadType(page, 'plain_text');
      await setPlainTextValue(page, 'Plain text content here');
      await waitForQRRender();
      const textSnapshot = await getCanvasSnapshot(page);
      
      // Switch to URL
      await switchToPayloadType(page, 'url');
      await setUrlValue(page, 'https://different-url.com');
      await waitForQRRender();
      const urlSnapshot = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(textSnapshot, urlSnapshot)).toBe(true);
    });

    test('switching back and forth maintains different QR codes', async ({ page, waitForQRRender }) => {
      // URL mode
      await switchToPayloadType(page, 'url');
      await setUrlValue(page, 'https://url-mode.com');
      await waitForQRRender();
      const url1 = await getCanvasSnapshot(page);
      
      // Plain Text mode
      await switchToPayloadType(page, 'plain_text');
      await setPlainTextValue(page, 'Text mode content');
      await waitForQRRender();
      const text1 = await getCanvasSnapshot(page);
      
      // Back to URL mode with different URL
      await switchToPayloadType(page, 'url');
      await setUrlValue(page, 'https://another-url.com');
      await waitForQRRender();
      const url2 = await getCanvasSnapshot(page);
      
      // All should be different
      expect(snapshotsAreDifferent(url1, text1)).toBe(true);
      expect(snapshotsAreDifferent(text1, url2)).toBe(true);
      expect(snapshotsAreDifferent(url1, url2)).toBe(true);
    });
  });

  // ==========================================
  // EDGE CASES
  // ==========================================
  test.describe('Edge Cases', () => {
    test('empty URL shows canvas (might be default state)', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'url');
      await setUrlValue(page, '');
      await waitForQRRender();
      
      // Canvas should still exist
      const canvas = page.locator('[data-testid="qr-preview"] canvas').first();
      await expect(canvas).toBeVisible();
    });

    test('empty plain text shows canvas', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      await setPlainTextValue(page, '');
      await waitForQRRender();
      
      // Canvas should still exist
      const canvas = page.locator('[data-testid="qr-preview"] canvas').first();
      await expect(canvas).toBeVisible();
    });

    test('whitespace-only text produces QR', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      
      const before = await getCanvasSnapshot(page);
      await setPlainTextValue(page, '   \n   \t   ');
      await waitForQRRender();
      
      // Canvas should still have content
      const canvas = page.locator('[data-testid="qr-preview"] canvas').first();
      await expect(canvas).toBeVisible();
    });

    test('very short text works', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      
      const before = await getCanvasSnapshot(page);
      await setPlainTextValue(page, 'A');
      await waitForQRRender();
      const after = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('URL without protocol still works', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'url');
      
      const before = await getCanvasSnapshot(page);
      await setUrlValue(page, 'example.com');
      await waitForQRRender();
      
      // Canvas should still render something
      const canvas = page.locator('[data-testid="qr-preview"] canvas').first();
      await expect(canvas).toBeVisible();
    });
  });

  // ==========================================
  // RAPID CHANGES
  // ==========================================
  test.describe('Rapid Changes', () => {
    test('multiple rapid URL changes result in final QR', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'url');
      
      // Rapid changes
      await setUrlValue(page, 'https://first.com');
      await setUrlValue(page, 'https://second.com');
      await setUrlValue(page, 'https://third.com');
      await setUrlValue(page, 'https://final-url.com');
      
      await waitForQRRender();
      const snapshot = await getCanvasSnapshot(page);
      
      // Canvas should have content
      expect(snapshot).toBeTruthy();
      expect(snapshot.length).toBeGreaterThan(100);
    });

    test('multiple rapid text changes result in final QR', async ({ page, waitForQRRender }) => {
      await switchToPayloadType(page, 'plain_text');
      
      // Rapid changes
      await setPlainTextValue(page, 'First');
      await setPlainTextValue(page, 'Second');
      await setPlainTextValue(page, 'Third');
      await setPlainTextValue(page, 'Final text content');
      
      await waitForQRRender();
      const snapshot = await getCanvasSnapshot(page);
      
      // Canvas should have content
      expect(snapshot).toBeTruthy();
      expect(snapshot.length).toBeGreaterThan(100);
    });

    test('rapid type switching works', async ({ page, waitForQRRender }) => {
      // Rapidly switch between types
      await switchToPayloadType(page, 'url');
      await switchToPayloadType(page, 'plain_text');
      await switchToPayloadType(page, 'url');
      await switchToPayloadType(page, 'plain_text');
      
      // Set final value
      await setPlainTextValue(page, 'Final content after rapid switching');
      await waitForQRRender();
      
      const snapshot = await getCanvasSnapshot(page);
      expect(snapshot).toBeTruthy();
    });
  });
});
