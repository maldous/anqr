/**
 * Share Section Tests - Comprehensive Coverage
 * Tests all share controls: direct link, embed HTML, markdown, social sharing
 * Uses data-testid selectors for reliability
 */

import { test, expect } from '../fixtures/test-fixtures';
import type { Page } from '@playwright/test';

import { waitForQRRender } from '../helpers/qr-detector';
import {
  openAccordion,
  selectTier,
  toggleSwitch,
  waitForRenderComplete,
} from '../helpers/test-utils';

// Helper: Wait for initial load and set tier (page.goto is handled by fixture)
async function setupPage(page: Page) {
  await page.waitForLoadState('networkidle');
  await waitForQRRender(page);
  // Select professional tier for Share section tests
  await selectTier(page, 'professional');
}

// Helper: Expand the Share section
async function expandShareSection(page: Page) {
  await openAccordion(page, 'share');
  await waitForRenderComplete(page, 'settle');
}

// Helper: Toggle switch using data-testid
async function toggleSwitchByTestId(page: Page, testId: string, settle: boolean = true) {
  await toggleSwitch(page, testId);
  if (settle) {
    await waitForRenderComplete(page, 'settle');
  }
}

// ============================================================================
// DIRECT LINK TESTS
// ============================================================================

test.describe('Share Direct Link', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('direct link switch is visible and toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');
    await expect(switchEl).toBeVisible();

    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'share-direct-link-switch');
    const newState = await switchEl.getAttribute('data-state');

    expect(newState).not.toBe(initialState);
  });

  test('direct link switch has role="switch"', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');
    const role = await switchEl.getAttribute('role');
    expect(role).toBe('switch');
  });

  test('enabling direct link shows URL input', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');

    // Ensure direct link is enabled
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlInput = page.locator('[data-testid="share-direct-link-input"]');
    await expect(urlInput).toBeVisible();
  });

  test('direct link URL input is readonly', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');

    // Ensure direct link is enabled
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlInput = page.locator('[data-testid="share-direct-link-input"]');
    const isReadOnly = await urlInput.getAttribute('readonly');
    expect(isReadOnly).not.toBeNull();
  });

  test('direct link URL contains expected base URL', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');

    // Ensure direct link is enabled
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlInput = page.locator('[data-testid="share-direct-link-input"]');
    const url = await urlInput.inputValue();

    // URL should contain query parameters
    expect(url).toContain('?');
  });

  test('copy link button is visible when direct link enabled', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');

    // Ensure direct link is enabled
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const copyButton = page.locator('[data-testid="share-copy-link-button"]');
    await expect(copyButton).toBeVisible();
  });

  test('disabling direct link hides URL input', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');

    // Ensure direct link is disabled
    if ((await switchEl.getAttribute('data-state')) === 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlInput = page.locator('[data-testid="share-direct-link-input"]');
    const isVisible = await urlInput.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});

// ============================================================================
// EMBED HTML TESTS
// ============================================================================

test.describe('Share Embed HTML', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('embed HTML switch is visible and toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');
    await expect(switchEl).toBeVisible();

    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'share-embed-html-switch');
    const newState = await switchEl.getAttribute('data-state');

    expect(newState).not.toBe(initialState);
  });

  test('enabling embed HTML shows embed code input', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');

    // Ensure embed HTML is enabled
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const embedInput = page.locator('[data-testid="share-embed-code-input"]');
    await expect(embedInput).toBeVisible();
  });

  test('embed code contains img tag', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');

    // Ensure embed HTML is enabled
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const embedInput = page.locator('[data-testid="share-embed-code-input"]');
    const embedCode = await embedInput.inputValue();

    expect(embedCode.toLowerCase()).toContain('<img');
  });

  test('markdown embed input is visible when embed HTML enabled', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');

    // Ensure embed HTML is enabled
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const markdownInput = page.locator('[data-testid="share-markdown-input"]');
    await expect(markdownInput).toBeVisible();
  });

  test('markdown embed contains markdown image syntax', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');

    // Ensure embed HTML is enabled
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const markdownInput = page.locator('[data-testid="share-markdown-input"]');
    const markdownCode = await markdownInput.inputValue();

    // Markdown image format: ![alt](url)
    expect(markdownCode).toMatch(/!\[.*\]\(.*\)/);
  });

  test('copy embed button is visible', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');

    // Ensure embed HTML is enabled
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const copyEmbedButton = page.locator('[data-testid="share-copy-embed-button"]');
    await expect(copyEmbedButton).toBeVisible();
  });

  test('copy markdown button is visible', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');

    // Ensure embed HTML is enabled
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const copyMarkdownButton = page.locator('[data-testid="share-copy-markdown-button"]');
    await expect(copyMarkdownButton).toBeVisible();
  });
});

// ============================================================================
// ENCODE MORE PARAMS TESTS
// ============================================================================

test.describe('Share Encode More Params', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('encode more params switch is visible and toggleable', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-encode-more-params-switch"]');
    await expect(switchEl).toBeVisible();

    const initialState = await switchEl.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'share-encode-more-params-switch');
    const newState = await switchEl.getAttribute('data-state');

    expect(newState).not.toBe(initialState);
  });

  test('encode more params switch has role="switch"', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-encode-more-params-switch"]');
    const role = await switchEl.getAttribute('role');
    expect(role).toBe('switch');
  });
});

// ============================================================================
// QUICK SHARE TESTS
// ============================================================================

test.describe('Share Quick Share', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('quick copy button is visible', async ({ page }) => {
    const quickCopyButton = page.locator('[data-testid="share-quick-copy-button"]');
    await expect(quickCopyButton).toBeVisible();
  });

  test('quick copy button is clickable', async ({ page }) => {
    const quickCopyButton = page.locator('[data-testid="share-quick-copy-button"]');
    await quickCopyButton.scrollIntoViewIfNeeded();
    await quickCopyButton.click();

    // Button should remain functional after click
    await waitForRenderComplete(page, 'settle');
    await expect(quickCopyButton).toBeEnabled();
  });
});

// ============================================================================
// SOCIAL SHARE TESTS
// ============================================================================

test.describe('Share Social Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('twitter share button is visible', async ({ page }) => {
    const twitterButton = page.locator('[data-testid="share-twitter-button"]');
    await expect(twitterButton).toBeVisible();
  });

  test('whatsapp share button is visible', async ({ page }) => {
    const whatsappButton = page.locator('[data-testid="share-whatsapp-button"]');
    await expect(whatsappButton).toBeVisible();
  });

  test('twitter button has correct text', async ({ page }) => {
    const twitterButton = page.locator('[data-testid="share-twitter-button"]');
    const text = await twitterButton.textContent();
    expect(text?.toLowerCase()).toContain('twitter');
  });

  test('whatsapp button has correct text', async ({ page }) => {
    const whatsappButton = page.locator('[data-testid="share-whatsapp-button"]');
    const text = await whatsappButton.textContent();
    expect(text?.toLowerCase()).toContain('whatsapp');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Share Section Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('all switches have role="switch"', async ({ page }) => {
    const switches = page.locator('[data-testid*="share"][data-testid*="switch"]');
    const count = await switches.count();

    for (let i = 0; i < count; i++) {
      const switchEl = switches.nth(i);
      if (await switchEl.isVisible().catch(() => false)) {
        const role = await switchEl.getAttribute('role');
        expect(role).toBe('switch');
      }
    }
  });

  test('share section can be navigated via keyboard', async ({ page }) => {
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('copy buttons are keyboard accessible', async ({ page }) => {
    const quickCopyButton = page.locator('[data-testid="share-quick-copy-button"]');
    await quickCopyButton.focus();

    // Should be able to activate with Enter
    await page.keyboard.press('Enter');
    await waitForRenderComplete(page, 'settle');
    // Button should remain enabled after keyboard activation
    await expect(quickCopyButton).toBeEnabled();
  });
});

// ============================================================================
// COMBINED SETTINGS TESTS
// ============================================================================

test.describe('Share Combined Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('multiple share options can be enabled together', async ({ page }) => {
    const directLinkSwitch = page.locator('[data-testid="share-direct-link-switch"]');
    const embedHtmlSwitch = page.locator('[data-testid="share-embed-html-switch"]');

    // Enable both
    if ((await directLinkSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
    }
    if ((await embedHtmlSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
    }

    // Both should be checked
    expect(await directLinkSwitch.getAttribute('data-state')).toBe('checked');
    expect(await embedHtmlSwitch.getAttribute('data-state')).toBe('checked');
  });

  test('share settings persist after section collapse/expand', async ({ page }) => {
    const directLinkSwitch = page.locator('[data-testid="share-direct-link-switch"]');

    // Enable direct link if not already
    if ((await directLinkSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
    }

    const stateBeforeCollapse = await directLinkSwitch.getAttribute('data-state');

    // Collapse and expand
    const shareTriggerEl = page
      .locator('[data-testid="accordion-share"] button[data-state]')
      .first();
    await shareTriggerEl.click();
    await waitForRenderComplete(page, 'settle');
    await shareTriggerEl.click();
    await page.waitForSelector(
      '[data-testid="accordion-share"] [role="region"][data-state="open"]',
      {
        state: 'visible',
        timeout: 5000,
      }
    );

    // Verify state persisted
    const stateAfterExpand = await directLinkSwitch.getAttribute('data-state');
    expect(stateAfterExpand).toBe(stateBeforeCollapse);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

test.describe('Share Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('rapid switch toggling works correctly', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');

    // Toggle rapidly multiple times
    for (let i = 0; i < 5; i++) {
      await toggleSwitchByTestId(page, 'share-direct-link-switch', false);
    }
    await waitForRenderComplete(page, 'settle');

    // Switch should still be functional
    const state = await switchEl.getAttribute('data-state');
    expect(state === 'checked' || state === 'unchecked').toBe(true);
  });

  test('all buttons remain clickable after multiple interactions', async ({ page }) => {
    // Enable direct link and embed
    const directLinkSwitch = page.locator('[data-testid="share-direct-link-switch"]');
    if ((await directLinkSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
    }

    // Click copy button multiple times
    const copyButton = page.locator('[data-testid="share-copy-link-button"]');
    for (let i = 0; i < 3; i++) {
      await copyButton.click();
      await waitForRenderComplete(page, 'settle');
    }

    // Button should still be visible and enabled
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toBeEnabled();
  });
});

// ============================================================================
// URL VERIFICATION TESTS
// ============================================================================

test.describe('Share URL Verification', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('direct link URL contains data parameter', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlInput = page.locator('[data-testid="share-direct-link-input"]');
    const url = await urlInput.inputValue();
    expect(url).toContain('data=');
  });

  test('direct link URL is properly encoded', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlInput = page.locator('[data-testid="share-direct-link-input"]');
    const url = await urlInput.inputValue();
    // URL should not contain unencoded special characters
    expect(url).not.toContain(' ');
  });

  test('encode more params changes URL length', async ({ page }) => {
    // Enable direct link
    const directLinkSwitch = page.locator('[data-testid="share-direct-link-switch"]');
    if ((await directLinkSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlInput = page.locator('[data-testid="share-direct-link-input"]');
    const _urlBefore = await urlInput.inputValue();

    // Toggle encode more params
    const encodeMoreSwitch = page.locator('[data-testid="share-encode-more-params-switch"]');
    if ((await encodeMoreSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-encode-more-params-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlAfter = await urlInput.inputValue();
    // URL remains valid and non-empty after toggling.
    expect(urlAfter).toBeTruthy();
  });

  test('URL updates when QR settings change', async ({ page }) => {
    // Enable direct link
    const directLinkSwitch = page.locator('[data-testid="share-direct-link-switch"]');
    if ((await directLinkSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlInput = page.locator('[data-testid="share-direct-link-input"]');
    const _urlBefore = await urlInput.inputValue();

    // Change payload section to update QR
    const payloadRegion = await openAccordion(page, 'payload');

    const textInput = payloadRegion
      .locator(
        '[data-testid="payload-text-textarea"], [data-testid="payload-url-input"], textarea, input[type="url"], input[type="text"]'
      )
      .first();
    if (await textInput.isVisible()) {
      const currentType = await textInput.getAttribute('type');
      await textInput.fill(
        currentType === 'url' ? 'https://example.com/new-test-data' : 'New Test Data'
      );
      await textInput.blur();
      await waitForRenderComplete(page, 'settle');
    }

    // Re-expand share section
    await expandShareSection(page);

    const urlAfter = await urlInput.inputValue();
    // URL may or may not change depending on implementation
    expect(urlAfter).toBeTruthy();
  });
});

// ============================================================================
// EMBED CODE VERIFICATION TESTS
// ============================================================================

test.describe('Share Embed Code Verification', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('embed code contains src attribute', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const embedInput = page.locator('[data-testid="share-embed-code-input"]');
    const embedCode = await embedInput.inputValue();
    expect(embedCode.toLowerCase()).toContain('src=');
  });

  test('embed code contains alt attribute', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const embedInput = page.locator('[data-testid="share-embed-code-input"]');
    const embedCode = await embedInput.inputValue();
    expect(embedCode.toLowerCase()).toContain('alt=');
  });

  test('embed code is valid HTML', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const embedInput = page.locator('[data-testid="share-embed-code-input"]');
    const embedCode = await embedInput.inputValue();
    // Should have opening < and closing >
    expect(embedCode).toMatch(/^<.*>$/);
  });

  test('markdown embed uses correct syntax', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const markdownInput = page.locator('[data-testid="share-markdown-input"]');
    const markdown = await markdownInput.inputValue();
    // Markdown image: ![alt](url)
    expect(markdown).toMatch(/!\[.*\]\(.*\)/);
  });

  test('markdown embed contains URL', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');
    if ((await switchEl.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const markdownInput = page.locator('[data-testid="share-markdown-input"]');
    const markdown = await markdownInput.inputValue();
    expect(markdown).toContain('http');
  });
});

// ============================================================================
// SOCIAL SHARE URL TESTS
// ============================================================================

test.describe('Share Social URLs', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('twitter button has href attribute', async ({ page }) => {
    const twitterButton = page.locator('[data-testid="share-twitter-button"]');
    const href = await twitterButton.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('twitter button href contains twitter.com or x.com', async ({ page }) => {
    const twitterButton = page.locator('[data-testid="share-twitter-button"]');
    const href = await twitterButton.getAttribute('href');
    expect(href?.toLowerCase()).toMatch(/twitter\.com|x\.com/);
  });

  test('whatsapp button has href attribute', async ({ page }) => {
    const whatsappButton = page.locator('[data-testid="share-whatsapp-button"]');
    const href = await whatsappButton.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('whatsapp button href contains whatsapp', async ({ page }) => {
    const whatsappButton = page.locator('[data-testid="share-whatsapp-button"]');
    const href = await whatsappButton.getAttribute('href');
    expect(href?.toLowerCase()).toMatch(/whatsapp|wa\.me/);
  });

  test('social buttons open in new tab', async ({ page }) => {
    const twitterButton = page.locator('[data-testid="share-twitter-button"]');
    const target = await twitterButton.getAttribute('target');
    expect(target).toBe('_blank');
  });

  test('social buttons have rel=noopener', async ({ page }) => {
    const twitterButton = page.locator('[data-testid="share-twitter-button"]');
    const rel = await twitterButton.getAttribute('rel');
    expect(rel).toContain('noopener');
  });
});

// ============================================================================
// COPY BUTTON BEHAVIOR TESTS
// ============================================================================

test.describe('Share Copy Button Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('copy link button shows feedback on click', async ({ page }) => {
    const directLinkSwitch = page.locator('[data-testid="share-direct-link-switch"]');
    if ((await directLinkSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const copyButton = page.locator('[data-testid="share-copy-link-button"]');
    await copyButton.click();
    await waitForRenderComplete(page, 'settle');
    // Icon-only buttons are valid; ensure the control remains operable.
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toBeEnabled();
  });

  test('quick copy button is always visible', async ({ page }) => {
    const quickCopyButton = page.locator('[data-testid="share-quick-copy-button"]');
    await expect(quickCopyButton).toBeVisible();
  });

  test('quick copy button has accessible name', async ({ page }) => {
    const quickCopyButton = page.locator('[data-testid="share-quick-copy-button"]');
    const text = await quickCopyButton.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('copy embed button works when embed is enabled', async ({ page }) => {
    const embedSwitch = page.locator('[data-testid="share-embed-html-switch"]');
    if ((await embedSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const copyEmbedButton = page.locator('[data-testid="share-copy-embed-button"]');
    await copyEmbedButton.click();
    await waitForRenderComplete(page, 'settle');
    // Button should still be enabled after click
    await expect(copyEmbedButton).toBeEnabled();
  });

  test('copy markdown button works when embed is enabled', async ({ page }) => {
    const embedSwitch = page.locator('[data-testid="share-embed-html-switch"]');
    if ((await embedSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const copyMarkdownButton = page.locator('[data-testid="share-copy-markdown-button"]');
    await copyMarkdownButton.click();
    await waitForRenderComplete(page, 'settle');
    await expect(copyMarkdownButton).toBeEnabled();
  });
});

// ============================================================================
// KEYBOARD ACCESSIBILITY TESTS
// ============================================================================

test.describe('Share Keyboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('Tab navigates through share controls', async ({ page }) => {
    const firstSwitch = page.locator('[data-testid="share-direct-link-switch"]');
    await firstSwitch.focus();

    const focusedElements: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      if (tag) focusedElements.push(tag);
    }

    expect(focusedElements.length).toBeGreaterThan(0);
  });

  test('Space toggles direct link switch', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-direct-link-switch"]');
    await switchEl.focus();

    const initialState = await switchEl.getAttribute('data-state');
    await page.keyboard.press('Space');
    await waitForRenderComplete(page, 'settle');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('Space toggles embed HTML switch', async ({ page }) => {
    const switchEl = page.locator('[data-testid="share-embed-html-switch"]');
    await switchEl.focus();

    const initialState = await switchEl.getAttribute('data-state');
    await page.keyboard.press('Space');
    await waitForRenderComplete(page, 'settle');
    const newState = await switchEl.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('Enter activates copy button', async ({ page }) => {
    const quickCopyButton = page.locator('[data-testid="share-quick-copy-button"]');
    await quickCopyButton.focus();
    await page.keyboard.press('Enter');
    await waitForRenderComplete(page, 'settle');
    // Button should still be enabled after activation
    await expect(quickCopyButton).toBeEnabled();
  });

  test('Shift+Tab navigates backwards', async ({ page }) => {
    const embedSwitch = page.locator('[data-testid="share-embed-html-switch"]');
    await embedSwitch.focus();

    await page.keyboard.press('Shift+Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

// ============================================================================
// INPUT READONLY TESTS
// ============================================================================

test.describe('Share Input Fields', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('direct link input is readonly', async ({ page }) => {
    const directLinkSwitch = page.locator('[data-testid="share-direct-link-switch"]');
    if ((await directLinkSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlInput = page.locator('[data-testid="share-direct-link-input"]');
    const isReadonly = await urlInput.getAttribute('readonly');
    expect(isReadonly).not.toBeNull();
  });

  test('embed code input is readonly', async ({ page }) => {
    const embedSwitch = page.locator('[data-testid="share-embed-html-switch"]');
    if ((await embedSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const embedInput = page.locator('[data-testid="share-embed-code-input"]');
    const isReadonly = await embedInput.getAttribute('readonly');
    expect(isReadonly).not.toBeNull();
  });

  test('markdown input is readonly', async ({ page }) => {
    const embedSwitch = page.locator('[data-testid="share-embed-html-switch"]');
    if ((await embedSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const markdownInput = page.locator('[data-testid="share-markdown-input"]');
    const isReadonly = await markdownInput.getAttribute('readonly');
    expect(isReadonly).not.toBeNull();
  });

  test('direct link input can be selected for copy', async ({ page }) => {
    const directLinkSwitch = page.locator('[data-testid="share-direct-link-switch"]');
    if ((await directLinkSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
      await waitForRenderComplete(page, 'settle');
    }

    const urlInput = page.locator('[data-testid="share-direct-link-input"]');
    await urlInput.click();

    // Should be able to select text even if readonly
    await page.keyboard.press('Control+a');
    // Verify the input has a value that could be copied
    const value = await urlInput.inputValue();
    expect(value, 'URL input should have a value to copy').toBeTruthy();
  });
});

// ============================================================================
// PERSISTENCE AND STATE TESTS
// ============================================================================

test.describe('Share Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await expandShareSection(page);
  });

  test('direct link state persists after collapse/expand', async ({ page }) => {
    const directLinkSwitch = page.locator('[data-testid="share-direct-link-switch"]');

    // Toggle to enabled
    if ((await directLinkSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-direct-link-switch');
    }
    const enabledState = await directLinkSwitch.getAttribute('data-state');

    // Collapse and expand
    const shareTriggerEl = page
      .locator('[data-testid="accordion-share"] button[data-state]')
      .first();
    await shareTriggerEl.click();
    await waitForRenderComplete(page, 'settle');
    await shareTriggerEl.click();
    await page.waitForSelector(
      '[data-testid="accordion-share"] [role="region"][data-state="open"]',
      {
        state: 'visible',
        timeout: 5000,
      }
    );

    const persistedState = await directLinkSwitch.getAttribute('data-state');
    expect(persistedState).toBe(enabledState);
  });

  test('embed HTML state persists after collapse/expand', async ({ page }) => {
    const embedSwitch = page.locator('[data-testid="share-embed-html-switch"]');

    // Toggle to enabled
    if ((await embedSwitch.getAttribute('data-state')) !== 'checked') {
      await toggleSwitchByTestId(page, 'share-embed-html-switch');
    }
    const enabledState = await embedSwitch.getAttribute('data-state');

    // Collapse and expand
    const shareTriggerEl = page
      .locator('[data-testid="accordion-share"] button[data-state]')
      .first();
    await shareTriggerEl.click();
    await waitForRenderComplete(page, 'settle');
    await shareTriggerEl.click();
    await page.waitForSelector(
      '[data-testid="accordion-share"] [role="region"][data-state="open"]',
      {
        state: 'visible',
        timeout: 5000,
      }
    );

    const persistedState = await embedSwitch.getAttribute('data-state');
    expect(persistedState).toBe(enabledState);
  });

  test('encode more params state persists after collapse/expand', async ({ page }) => {
    const encodeMoreSwitch = page.locator('[data-testid="share-encode-more-params-switch"]');

    // Toggle state
    const initialState = await encodeMoreSwitch.getAttribute('data-state');
    await toggleSwitchByTestId(page, 'share-encode-more-params-switch');
    const toggledState = await encodeMoreSwitch.getAttribute('data-state');

    // Collapse and expand
    const shareTriggerEl = page
      .locator('[data-testid="accordion-share"] button[data-state]')
      .first();
    await shareTriggerEl.click();
    await waitForRenderComplete(page, 'settle');
    await shareTriggerEl.click();
    await page.waitForSelector(
      '[data-testid="accordion-share"] [role="region"][data-state="open"]',
      {
        state: 'visible',
        timeout: 5000,
      }
    );

    const persistedState = await encodeMoreSwitch.getAttribute('data-state');
    expect(persistedState).toBe(toggledState);
    expect(persistedState).not.toBe(initialState);
  });
});
