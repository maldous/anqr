/**
 * E2E Library Demo - Professional Tier Features
 *
 * Tests for features available in the Professional tier
 */

import { test, expect } from '../fixtures/test-fixtures';

import { setupTest, createTestContext } from '../helpers/e2e-library';

test.describe('Professional Tier Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page, { tier: 'professional' });
  });

  test('can access watermark section in professional tier', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.watermark.open();
    expect(await ctx.watermark.isOpen()).toBe(true);

    const region = ctx.watermark.getRegion();
    await expect(region).toBeVisible();
  });

  test('can access safety section in professional tier', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.safety.open();
    expect(await ctx.safety.isOpen()).toBe(true);
  });

  test('can access metadata section in professional tier', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.metadata.open();
    expect(await ctx.metadata.isOpen()).toBe(true);
  });

  test('watermark section has expected controls', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.watermark.open();
    const region = ctx.watermark.getRegion();

    // Should have watermark controls (enable switch, inputs, etc.)
    const controls = region.locator('[role="switch"], input, [role="combobox"]');
    await expect(controls.first()).toBeVisible();
  });

  test('safety section has expected controls', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.safety.open();
    const region = ctx.safety.getRegion();

    // Should have safety controls
    const controls = region.locator('[role="switch"], [role="slider"], [role="combobox"]');
    await expect(controls.first()).toBeVisible();
  });

  test('metadata section has expected controls', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.metadata.open();
    const region = ctx.metadata.getRegion();

    // Should have metadata input fields
    const inputs = region.locator('input, textarea');
    await expect(inputs.first()).toBeVisible();
  });
});
