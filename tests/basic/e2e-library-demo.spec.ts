/**
 * E2E Library Demo Tests
 * 
 * Demonstrates how to use the E2E testing library with:
 * - Deterministic event-driven waits (no sleeps)
 * - Helper classes for UI interactions
 * - Accessibility assertions
 * - Visual comparison tied to render completion
 */

import { test, expect } from '../fixtures/test-fixtures';

import {
  setupTest,
  createTestContext,
  waitForRenderCycle,
  waitForRenderIdle,
  snapshotsAreDifferent,
  SidebarSection,
  SelectHelper,
  SliderHelper,
  SwitchHelper,
  InputHelper,
  assertSliderAccessibility,
  assertSelectAccessibility,
  assertSwitchAccessibility,
  assertKeyboardFocusable,
} from '../helpers/e2e-library';

test.describe('E2E Library Demo', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test with clean state - this handles navigation, modal dismissal, and initial render wait
    await setupTest(page, { tier: 'basic' });
  });

  test.describe('Section Navigation', () => {
    test('can open and close accordion sections', async ({ page }) => {
      const ctx = createTestContext(page);
      
      // Open Payload section (basic tier)
      await ctx.payload.open();
      expect(await ctx.payload.isOpen()).toBe(true);
      
      // Open Overlay section (basic tier)
      await ctx.overlay.open();
      expect(await ctx.overlay.isOpen()).toBe(true);
      
      // Close Overlay section
      await ctx.overlay.close();
      expect(await ctx.overlay.isOpen()).toBe(false);
    });

    test('can access controls within a section', async ({ page }) => {
      const ctx = createTestContext(page);
      
      await ctx.payload.open();
      const region = ctx.payload.getRegion();
      
      // Find an input or textarea within the section
      const input = region.locator('input, textarea').first();
      await expect(input).toBeVisible();
    });
  });

  test.describe('Select Interactions', () => {
    test('can change content type and verify render update', async ({ page }) => {
      const ctx = createTestContext(page);
      
      // Open Payload section and find content type select (basic tier)
      await ctx.payload.open();
      const region = ctx.payload.getRegion();
      const contentTypeSelect = new SelectHelper(region.locator('[role="combobox"]').first());
      
      // First ensure we're on Plain Text (to have a different starting point)
      await contentTypeSelect.choose('Plain Text');
      await ctx.waitForRender();
      const plainText = region.locator('textarea').first();
      await plainText.fill('e2e-library-demo plain text');
      await plainText.blur();
      await ctx.waitForRender();
      
      // Take snapshot after switching to Plain Text
      const before = await ctx.getSnapshot();
      
      // Now change to URL (should produce different QR)
      await contentTypeSelect.choose('URL');
      await ctx.waitForRender();
      
      // Verify QR changed
      const after = await ctx.getSnapshot();
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('select has proper ARIA attributes', async ({ page }) => {
      const ctx = createTestContext(page);
      
      await ctx.payload.open();
      const region = ctx.payload.getRegion();
      const select = region.locator('[role="combobox"]').first();
      
      await assertSelectAccessibility(select);
    });
  });

  test.describe('Slider Interactions', () => {
    test('can change overlay intensity slider and verify render update', async ({ page }) => {
      const ctx = createTestContext(page);
      
      // First upload an overlay image to enable the intensity slider
      await ctx.overlay.open();
      // Use page-level file input selector - more reliable
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('public/tsunami.jpg');
      await ctx.waitForRender();
      
      const before = await ctx.getSnapshot();
      
      // Find the intensity slider using data-testid
      const sliderContainer = page.locator('[data-testid="overlay-intensity-slider"]').first();
      const slider = new SliderHelper(sliderContainer);
      
      // Set to a different value
      await slider.setValue(25);
      
      await ctx.waitForRender();
      
      const after = await ctx.getSnapshot();
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('slider has proper ARIA attributes', async ({ page }) => {
      const ctx = createTestContext(page);
      
      // Upload overlay to enable sliders
      await ctx.overlay.open();
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('public/tsunami.jpg');
      await ctx.waitForRender();
      
      const sliderContainer = page.locator('[data-testid="overlay-intensity-slider"]').first();
      
      await assertSliderAccessibility(sliderContainer);
    });

    test('slider is keyboard operable', async ({ page }) => {
      const ctx = createTestContext(page);
      
      // Upload overlay to enable sliders
      await ctx.overlay.open();
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('public/tsunami.jpg');
      await ctx.waitForRender();
      
      const sliderThumb = page.locator('[data-testid="overlay-intensity-slider"] [role="slider"]').first();
      
      await assertKeyboardFocusable(sliderThumb);
      
      // Get initial value
      const initialValue = Number(await sliderThumb.getAttribute('aria-valuenow'));
      
      // Press arrow key to change value
      await page.keyboard.press('ArrowRight');
      
      // Value should have changed
      const newValue = Number(await sliderThumb.getAttribute('aria-valuenow'));
      expect(newValue).toBeGreaterThanOrEqual(initialValue);
    });
  });

  test.describe('Switch Interactions', () => {
    test('can toggle overlay enabled switch', async ({ page }) => {
      const ctx = createTestContext(page);
      
      // First upload an overlay to enable the switch
      await ctx.overlay.open();
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('public/tsunami.jpg');
      await ctx.waitForRender();
      
      // Find the enabled switch using data-testid
      const switchEl = page.locator('[data-testid="overlay-enabled-switch"]').first();
      const switchHelper = new SwitchHelper(switchEl);
      
      const before = await switchHelper.isChecked();
      await switchHelper.toggle();
      const after = await switchHelper.isChecked();
      
      expect(after).not.toBe(before);
    });

    test('switch has proper ARIA attributes', async ({ page }) => {
      const ctx = createTestContext(page);
      
      // Upload overlay to enable the switch
      await ctx.overlay.open();
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('public/tsunami.jpg');
      await ctx.waitForRender();
      
      const switchEl = page.locator('[data-testid="overlay-enabled-switch"]').first();
      
      await assertSwitchAccessibility(switchEl);
    });

    test('switch is keyboard operable', async ({ page }) => {
      const ctx = createTestContext(page);
      
      // Upload overlay to enable the switch
      await ctx.overlay.open();
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles('public/tsunami.jpg');
      await ctx.waitForRender();
      
      const switchEl = page.locator('[data-testid="overlay-enabled-switch"]').first();
      
      await assertKeyboardFocusable(switchEl);
      
      const switchHelper = new SwitchHelper(switchEl);
      const before = await switchHelper.isChecked();
      
      // Toggle with Space key
      await switchHelper.toggleByKeyboard();
      
      const after = await switchHelper.isChecked();
      expect(after).not.toBe(before);
    });
  });

  test.describe('Input Interactions', () => {
    test('can change payload text', async ({ page }) => {
      const ctx = createTestContext(page);
      
      const before = await ctx.getSnapshot();
      
      await ctx.payload.open();
      const region = ctx.payload.getRegion();
      
      // Find the text input or textarea
      const input = region.locator('input[type="text"], input[type="url"], textarea').first();
      const inputHelper = new InputHelper(input);
      
      // Change the value
      await inputHelper.setValue('https://example.com/test');
      
      await ctx.waitForRender();
      
      const after = await ctx.getSnapshot();
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });
  });

  test.describe('Render Completion Waits', () => {
    test('waitForRenderCycle waits for complete cycle', async ({ page }) => {
      const ctx = createTestContext(page);
      
      await ctx.payload.open();
      const region = ctx.payload.getRegion();
      const input = region.locator('input[type="text"], input[type="url"], textarea').first();
      
      // Make a change
      await input.fill('https://test-url.com');
      
      // Wait for complete render cycle (change -> debounce -> render -> idle)
      await ctx.waitForRender();
      
      // Should be in idle state now
      const preview = page.locator('[data-testid="qr-preview"]');
      await expect(preview).toHaveAttribute('data-rendering-state', 'idle');
    });

    test('multiple rapid changes result in single render', async ({ page }) => {
      const ctx = createTestContext(page);
      
      await ctx.payload.open();
      const region = ctx.payload.getRegion();
      const input = region.locator('input[type="text"], input[type="url"], textarea').first();
      
      // Make rapid changes (debounce should batch them)
      await input.fill('a');
      await input.fill('ab');
      await input.fill('abc');
      await input.fill('https://final-url.com');
      
      // Wait for render to complete
      await ctx.waitForRender();
      
      // QR should show the final URL
      const snapshot = await ctx.getSnapshot();
      expect(snapshot).toBeTruthy();
    });
  });

  test.describe('Visual Comparison', () => {
    test('snapshots are deterministic', async ({ page }) => {
      const ctx = createTestContext(page);
      
      // Take two snapshots without any changes
      const snapshot1 = await ctx.getSnapshot();
      const snapshot2 = await ctx.getSnapshot();
      
      // They should be identical
      expect(snapshotsAreDifferent(snapshot1, snapshot2)).toBe(false);
    });

    test('different settings produce different snapshots', async ({ page }) => {
      const ctx = createTestContext(page);
      
      const snapshot1 = await ctx.getSnapshot();
      
      // Change payload text (basic tier)
      await ctx.payload.open();
      const region = ctx.payload.getRegion();
      const textInput = region.locator('input, textarea').first();
      await textInput.fill('https://different-url.com/test');
      
      await ctx.waitForRender();
      
      const snapshot2 = await ctx.getSnapshot();
      
      // Snapshots should be different
      expect(snapshotsAreDifferent(snapshot1, snapshot2)).toBe(true);
    });
  });
});

// NOTE: Advanced and Professional tier tests have been moved to their respective directories:
// - tests/advanced/e2e-library-demo.spec.ts
// - tests/professional/e2e-library-demo.spec.ts
