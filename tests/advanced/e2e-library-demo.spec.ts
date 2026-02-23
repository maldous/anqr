/**
 * E2E Library Demo - Advanced Tier Features
 *
 * Tests for features available in the Advanced tier
 */

import { test, expect } from '../fixtures/test-fixtures';

import { setupTest, createTestContext } from '../helpers/e2e-library';

test.describe('Advanced Tier Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page, { tier: 'advanced' });
  });

  test('can access animation section in advanced tier', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.animation.open();
    expect(await ctx.animation.isOpen()).toBe(true);

    const region = ctx.animation.getRegion();
    await expect(region).toBeVisible();
  });

  test('animation section has expected controls', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.animation.open();
    const region = ctx.animation.getRegion();

    // Should have animation-related controls
    const controls = region.locator('[role="switch"], [role="slider"], [role="combobox"]');
    await expect(controls.first()).toBeVisible();
  });
});
