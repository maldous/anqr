import { test, expect } from '../fixtures/test-fixtures';

test.describe('Header Controls - Basic Tier', () => {
  test('export button is visible and enabled', async ({ page, waitForQRRender }) => {
    await waitForQRRender();

    const exportButton = page.locator('[data-testid="export-button"]');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
  });
});
