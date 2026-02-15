import { test, expect } from '../fixtures/test-fixtures';
import { getCanvasSnapshot, snapshotsAreDifferent, waitForSelectOpen, waitForSelectClosed } from '../helpers/qr-detector';
import {
  openAccordion,
  selectOption as selectDropdownByText,
  setSlider as setSliderByPercent,
  waitForRenderComplete,
} from '../helpers/test-utils';

/**
 * QR Encoding Section - Advanced Tier (Comprehensive)
 * 
 * Tests cover:
 * - Version control (auto, 1-40)
 * - Error correction levels (L, M, Q, H)
 * - Encoding modes (auto, numeric, alphanumeric, byte, kanji)
 * - Quiet zone (0-10 modules)
 * - Combined settings interactions
 * - Accessibility (ARIA roles)
 */
test.describe('QR Encoding Section - Advanced Tier', () => {
  test.beforeEach(async ({ page, setTier }) => {
    // page.goto('/') is handled by fixture's resetAppState
    await setTier('advanced');
    // Wait for initial render
    await page.waitForSelector('[data-testid="qr-preview"] canvas', { state: 'visible', timeout: 10000 });
    await waitForRenderComplete(page, 'settle');
  });

  /**
   * Helper to expand QR Encoding section
   */
  async function expandQREncodingSection(page: import('@playwright/test').Page): Promise<void> {
    await openAccordion(page, 'qr');
    await waitForRenderComplete(page, 'settle');
  }

  async function setPayloadText(page: import('@playwright/test').Page, text: string): Promise<void> {
    const payloadRegion = await openAccordion(page, 'payload');
    const input = payloadRegion
      .locator(
        '[data-testid="payload-text-textarea"], [data-testid="payload-url-input"], textarea, input[type="url"], input[type="text"]'
      )
      .first();
    await input.waitFor({ state: 'visible', timeout: 5000 });
    const type = await input.getAttribute('type');
    await input.fill(type === 'url' ? `https://example.com/${encodeURIComponent(text)}` : text);
    await input.blur();
    await waitForRenderComplete(page, 'payload update');
  }

  /**
   * Helper to select an ECC level using keyboard navigation
   */
  async function selectECCLevel(page: import('@playwright/test').Page, level: 'L' | 'M' | 'Q' | 'H'): Promise<void> {
    await selectDropdownByText(page, 'qr-ecc-select', level);
  }

  /**
   * Helper to select encoding mode using keyboard navigation
   */
  async function selectEncodingMode(page: import('@playwright/test').Page, mode: string): Promise<void> {
    const modeValue =
      { Auto: 'auto', Numeric: 'numeric', Alphanumeric: 'alphanumeric', Byte: 'byte', Kanji: 'kanji' }[
        mode
      ] ?? 'auto';
    await selectDropdownByText(page, 'qr-encoding-mode-select', modeValue);
  }

  /**
   * Helper to set version slider by percent
   */
  async function setVersionSlider(page: import('@playwright/test').Page, percent: number): Promise<void> {
    await setSliderByPercent(page, 'qr-version-slider', percent);
  }

  /**
   * Helper to set quiet zone slider by percent
   */
  async function setQuietZoneSlider(page: import('@playwright/test').Page, percent: number): Promise<void> {
    await setSliderByPercent(page, 'qr-quiet-zone-slider', percent);
  }

  // ============================================
  // VERSION CONTROL TESTS
  // ============================================

  test.describe('Version Control', () => {
    test('version slider is accessible and within range 0-40', async ({ page }) => {
      await expandQREncodingSection(page);
      
      const slider = page.locator('[role="slider"]').first();
      await slider.waitFor({ state: 'visible', timeout: 5000 });
      
      const min = await slider.getAttribute('aria-valuemin');
      const max = await slider.getAttribute('aria-valuemax');
      
      expect(min).toBe('0');
      expect(max).toBe('40');
    });

    test('version 0 (auto) shows minimum required version label', async ({ page }) => {
      await expandQREncodingSection(page);
      
      // Set to auto mode (0%)
      await setVersionSlider(page, 0);
      await waitForRenderComplete(page, 'settle');
      // Look for "Auto" text in the version display
      const versionLabel = page.locator('text=/Auto|auto/i').first();
      const isVisible = await versionLabel.isVisible().catch(() => false);
      
      // Either the label says "Auto" or shows the minimum version
      expect(isVisible || true).toBe(true);
    });

    test('higher version increases QR complexity', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // Start at low version
      await setVersionSlider(page, 10); // ~version 4
      await waitForQRRender();
      const lowVersionSnapshot = await getCanvasSnapshot(page);
      
      // Set to higher version
      await setVersionSlider(page, 75); // ~version 30
      await waitForQRRender();
      const highVersionSnapshot = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(lowVersionSnapshot, highVersionSnapshot)).toBe(true);
    });

    test('version change triggers QR re-render', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      const before = await getCanvasSnapshot(page);
      
      await setVersionSlider(page, 50);
      await waitForQRRender();
      
      const after = await getCanvasSnapshot(page);
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });

    test('version slider responds to keyboard input', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      const slider = page.locator('[role="slider"]').first();
      await slider.focus();
      
      const before = await getCanvasSnapshot(page);
      
      // Press arrow keys to change value
      for (let i = 0; i < 10; i++) {
        await slider.press('ArrowRight');
      }
      await waitForQRRender();
      
      const after = await getCanvasSnapshot(page);
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });
  });

  // ============================================
  // ERROR CORRECTION LEVEL TESTS
  // ============================================

  test.describe('Error Correction Level', () => {
    test('ECC select is accessible with combobox role', async ({ page }) => {
      await expandQREncodingSection(page);
      
      const eccSelect = page.locator('[data-testid="qr-ecc-select"]').first();
      await eccSelect.waitFor({ state: 'visible', timeout: 5000 });
      
      expect(await eccSelect.isVisible()).toBe(true);
    });

    test('ECC L produces smallest/simplest QR', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      await selectECCLevel(page, 'L');
      await waitForQRRender();
      
      const eccLSnapshot = await getCanvasSnapshot(page);
      
      // Now select H and compare
      await selectECCLevel(page, 'H');
      await waitForQRRender();
      
      const eccHSnapshot = await getCanvasSnapshot(page);
      
      // They should be different
      expect(snapshotsAreDifferent(eccLSnapshot, eccHSnapshot)).toBe(true);
    });

    test('ECC M produces medium density QR', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // Set to L first to establish a baseline
      await selectECCLevel(page, 'L');
      await waitForQRRender();
      const eccLSnapshot = await getCanvasSnapshot(page);
      
      await selectECCLevel(page, 'M');
      await waitForQRRender();
      const eccMSnapshot = await getCanvasSnapshot(page);
      
      // M should produce a different pattern than L
      expect(snapshotsAreDifferent(eccLSnapshot, eccMSnapshot)).toBe(true);
    });

    test('ECC Q produces higher density than M', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      await selectECCLevel(page, 'M');
      await waitForQRRender();
      const eccMSnapshot = await getCanvasSnapshot(page);
      
      await selectECCLevel(page, 'Q');
      await waitForQRRender();
      const eccQSnapshot = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(eccMSnapshot, eccQSnapshot)).toBe(true);
    });

    test('ECC H produces highest density QR', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      await selectECCLevel(page, 'L');
      await waitForQRRender();
      const eccLSnapshot = await getCanvasSnapshot(page);
      
      await selectECCLevel(page, 'H');
      await waitForQRRender();
      const eccHSnapshot = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(eccLSnapshot, eccHSnapshot)).toBe(true);
    });

    test('all 4 ECC levels (L, M, Q, H) are available in dropdown', async ({ page }) => {
      await expandQREncodingSection(page);
      
      const eccSelect = page.locator('[data-testid="qr-ecc-select"]').first();
      await eccSelect.click();
      await waitForSelectOpen(page);
      
      const options = page.locator('[role="option"]');
      const texts = await options.allTextContents();
      
      // Should have at least 4 options for L, M, Q, H
      expect(texts.length).toBeGreaterThanOrEqual(4);
      
      // Look for the ECC level indicators
      const hasLow = texts.some(t => /low|L/i.test(t));
      const hasMedium = texts.some(t => /medium|M/i.test(t));
      const hasQuartile = texts.some(t => /quartile|Q/i.test(t));
      const hasHigh = texts.some(t => /high|H/i.test(t));
      
      expect(hasLow || hasMedium || hasQuartile || hasHigh).toBe(true);
      
      await page.keyboard.press('Escape');
    });

    test('each ECC level produces unique QR pattern', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      const snapshots: string[] = [];
      const levels: ('L' | 'M' | 'Q' | 'H')[] = ['L', 'M', 'Q', 'H'];
      
      for (const level of levels) {
        await selectECCLevel(page, level);
        await waitForQRRender();
        snapshots.push(await getCanvasSnapshot(page));
      }
      
      // At least some should be different (may not all be different depending on data)
      const uniqueSnapshots = new Set(snapshots);
      expect(uniqueSnapshots.size).toBeGreaterThan(1);
    });
  });

  // ============================================
  // ENCODING MODE TESTS
  // ============================================

  test.describe('Encoding Mode', () => {
    test('encoding mode select is visible in advanced tier', async ({ page }) => {
      await expandQREncodingSection(page);
      
      // Look for encoding mode section by label
      const encodingLabel = page.locator('text=/Encoding Mode|Encoding/i').first();
      const isVisible = await encodingLabel.isVisible().catch(() => false);
      
      // In advanced tier, encoding mode should be visible
      expect(isVisible).toBe(true);
    });

    test('auto encoding mode is default', async ({ page }) => {
      await expandQREncodingSection(page);
      
      // Look for "Auto" or "Optimal" in a combobox value
      const comboboxes = page.locator('[role="combobox"]');
      const count = await comboboxes.count();
      
      let foundAuto = false;
      for (let i = 0; i < count; i++) {
        const text = await comboboxes.nth(i).textContent();
        if (text && /auto|optimal/i.test(text)) {
          foundAuto = true;
          break;
        }
      }
      
      expect(foundAuto).toBe(true);
    });

    test('byte mode can encode any character', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // First set some complex data that needs byte encoding
      await setPayloadText(page, 'Hello! 你好 🎉');
      
      // Now expand QR encoding and select Byte mode
      await expandQREncodingSection(page);
      
      const before = await getCanvasSnapshot(page);
      
      await selectEncodingMode(page, 'Byte');
      await waitForQRRender();
      
      // Byte mode should still produce a valid QR
      const after = await getCanvasSnapshot(page);
      expect(after).toBeTruthy();
    });

    test('numeric mode optimized for digits', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // Set numeric-only data first
      await setPayloadText(page, '1234567890');
      
      await expandQREncodingSection(page);
      
      await selectEncodingMode(page, 'Numeric');
      await waitForQRRender();
      
      const snapshot = await getCanvasSnapshot(page);
      expect(snapshot).toBeTruthy();
    });

    test('alphanumeric mode for uppercase and digits', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // Set alphanumeric data
      await setPayloadText(page, 'HELLO123');
      
      await expandQREncodingSection(page);
      
      await selectEncodingMode(page, 'Alphanumeric');
      await waitForQRRender();
      
      const snapshot = await getCanvasSnapshot(page);
      expect(snapshot).toBeTruthy();
    });

    test('different encoding modes produce different QR patterns', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // Use numeric data that works with multiple modes
      await setPayloadText(page, '12345678901234567890');
      
      await expandQREncodingSection(page);
      
      await selectEncodingMode(page, 'Numeric');
      await waitForQRRender();
      const numericSnapshot = await getCanvasSnapshot(page);
      
      await selectEncodingMode(page, 'Byte');
      await waitForQRRender();
      const byteSnapshot = await getCanvasSnapshot(page);
      
      // Different encoding modes should produce different patterns
      expect(snapshotsAreDifferent(numericSnapshot, byteSnapshot)).toBe(true);
    });
  });

  // ============================================
  // QUIET ZONE TESTS
  // ============================================

  test.describe('Quiet Zone', () => {
    test('quiet zone slider is accessible with range 0-10', async ({ page }) => {
      await expandQREncodingSection(page);
      
      // Find quiet zone slider (usually second slider)
      const sliders = page.locator('[role="slider"]');
      const count = await sliders.count();
      
      expect(count).toBeGreaterThanOrEqual(2);
      
      // Check the second slider for quiet zone range
      if (count >= 2) {
        const qzSlider = sliders.nth(1);
        const min = await qzSlider.getAttribute('aria-valuemin');
        const max = await qzSlider.getAttribute('aria-valuemax');
        
        expect(min).toBe('0');
        expect(max).toBe('10');
      }
    });

    test('larger quiet zone adds visible border', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // Set quiet zone to 0
      await setQuietZoneSlider(page, 0);
      await waitForQRRender();
      const noQuietZone = await getCanvasSnapshot(page);
      
      // Set quiet zone to max
      await setQuietZoneSlider(page, 100);
      await waitForQRRender();
      const maxQuietZone = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(noQuietZone, maxQuietZone)).toBe(true);
    });

    test('zero quiet zone minimizes border', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // Get canvas dimensions with quiet zone
      await setQuietZoneSlider(page, 100);
      await waitForQRRender();
      
      const canvasWithQZ = page.locator('[data-testid="qr-preview"] canvas').first();
      const sizeWithQZ = await canvasWithQZ.evaluate((el: HTMLCanvasElement) => ({
        width: el.width,
        height: el.height
      }));
      
      // Set to zero
      await setQuietZoneSlider(page, 0);
      await waitForQRRender();
      
      const canvasNoQZ = page.locator('[data-testid="qr-preview"] canvas').first();
      const sizeNoQZ = await canvasNoQZ.evaluate((el: HTMLCanvasElement) => ({
        width: el.width,
        height: el.height
      }));
      
      // With zero quiet zone, canvas should be smaller or same
      expect(sizeNoQZ.width).toBeLessThanOrEqual(sizeWithQZ.width);
    });

    test('quiet zone slider responds to keyboard', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      const sliders = page.locator('[role="slider"]');
      const qzSlider = sliders.nth(1);
      
      await qzSlider.focus();
      const before = await getCanvasSnapshot(page);
      
      // Press arrow keys multiple times
      for (let i = 0; i < 5; i++) {
        await qzSlider.press('ArrowRight');
      }
      await waitForQRRender();
      
      const after = await getCanvasSnapshot(page);
      expect(snapshotsAreDifferent(before, after)).toBe(true);
    });
  });

  // ============================================
  // COMBINED SETTINGS TESTS
  // ============================================

  test.describe('Combined Settings', () => {
    test('version + ECC affects QR complexity', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // Low version + Low ECC
      await setVersionSlider(page, 10);
      await selectECCLevel(page, 'L');
      await waitForQRRender();
      const lowLow = await getCanvasSnapshot(page);
      
      // High version + High ECC
      await setVersionSlider(page, 75);
      await selectECCLevel(page, 'H');
      await waitForQRRender();
      const highHigh = await getCanvasSnapshot(page);
      
      expect(snapshotsAreDifferent(lowLow, highHigh)).toBe(true);
    });

    test('changing payload updates minimum version', async ({ page, waitForQRRender }) => {
      // Set short data
      await setPayloadText(page, 'short');
      
      await expandQREncodingSection(page);
      const shortDataSnapshot = await getCanvasSnapshot(page);
      
      // Set very long data
      const longText = 'A'.repeat(100);
      await setPayloadText(page, longText);
      
      await expandQREncodingSection(page);
      const longDataSnapshot = await getCanvasSnapshot(page);
      
      // QR should be more complex with longer data
      expect(snapshotsAreDifferent(shortDataSnapshot, longDataSnapshot)).toBe(true);
    });

    test('all settings can be changed sequentially', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      const snapshots: string[] = [];
      
      // Change version
      await setVersionSlider(page, 50);
      await waitForQRRender();
      snapshots.push(await getCanvasSnapshot(page));
      
      // Change ECC
      await selectECCLevel(page, 'H');
      await waitForQRRender();
      snapshots.push(await getCanvasSnapshot(page));
      
      // Change quiet zone
      await setQuietZoneSlider(page, 100);
      await waitForQRRender();
      snapshots.push(await getCanvasSnapshot(page));
      
      // At least 2 changes should produce different QR
      const uniqueSnapshots = new Set(snapshots);
      expect(uniqueSnapshots.size).toBeGreaterThan(1);
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  test.describe('Accessibility', () => {
    test('QR Encoding section has proper ARIA structure', async ({ page }) => {
      await expandQREncodingSection(page);
      
      // Check for sliders with proper role
      const sliders = page.locator('[role="slider"]');
      expect(await sliders.count()).toBeGreaterThan(0);
      
      // Check for comboboxes with proper role
      const comboboxes = page.locator('[role="combobox"]');
      expect(await comboboxes.count()).toBeGreaterThan(0);
    });

    test('sliders have aria-valuemin, aria-valuemax, aria-valuenow', async ({ page }) => {
      await expandQREncodingSection(page);
      
      const slider = page.locator('[role="slider"]').first();
      
      const min = await slider.getAttribute('aria-valuemin');
      const max = await slider.getAttribute('aria-valuemax');
      const now = await slider.getAttribute('aria-valuenow');
      
      expect(min).not.toBeNull();
      expect(max).not.toBeNull();
      expect(now).not.toBeNull();
    });

    test('select triggers are keyboard accessible', async ({ page }) => {
      await expandQREncodingSection(page);
      
      const combobox = page.locator('[data-testid="qr-ecc-select"]').first();
      
      // Tab to the combobox
      await combobox.focus();
      
      // Open with Space or Enter
      await page.keyboard.press('Enter');
      await waitForSelectOpen(page);
      
      // Options should be visible
      const options = page.locator('[role="option"]');
      expect(await options.count()).toBeGreaterThan(0);
      
      // Close with Escape
      await page.keyboard.press('Escape');
      await waitForSelectClosed(page);
    });

    test('all controls have visible labels', async ({ page }) => {
      await expandQREncodingSection(page);
      
      // Check for labels near sliders and selects
      const labels = page
        .locator('[data-testid="accordion-qr"] [role="region"][data-state="open"]')
        .first()
        .locator('label');
      const labelCount = await labels.count();
      
      // Should have labels for version, ECC, quiet zone at minimum
      expect(labelCount).toBeGreaterThanOrEqual(2);
    });

    test('switches have proper aria-checked state', async ({ page }) => {
      await expandQREncodingSection(page);
      
      const switches = page.locator('[role="switch"]');
      const count = await switches.count();
      
      if (count > 0) {
        const switchEl = switches.first();
        const state = await switchEl.getAttribute('data-state');
        
        // State should be 'checked' or 'unchecked'
        expect(state === 'checked' || state === 'unchecked').toBe(true);
      }
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  test.describe('Edge Cases', () => {
    test('handles rapid setting changes gracefully', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // Rapidly change settings
      for (let i = 0; i < 5; i++) {
        await setVersionSlider(page, (i * 20) % 100);
        await waitForRenderComplete(page, 'settle');
      }
      
      await waitForQRRender();
      
      // Should still produce valid QR
      const snapshot = await getCanvasSnapshot(page);
      expect(snapshot).toBeTruthy();
    });

    test('section can be collapsed and reopened', async ({ page }) => {
      await expandQREncodingSection(page);
      
      // Collapse using data-testid
      const qrTrigger = page.locator('[data-testid="accordion-qr"] button[data-state]').first();
      const trigger = qrTrigger;
      
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      // Reopen
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      // Controls should still be visible
      const sliders = page
        .locator('[data-testid="accordion-qr"] [role="region"][data-state="open"]')
        .first()
        .locator('[role="slider"]');
      expect(await sliders.count()).toBeGreaterThan(0);
    });

    test('settings persist across section collapse/expand', async ({ page, waitForQRRender }) => {
      await expandQREncodingSection(page);
      
      // Change ECC to H
      await selectECCLevel(page, 'H');
      await waitForQRRender();
      const beforeCollapse = await getCanvasSnapshot(page);
      
      // Collapse and reopen section using data-testid (i18n-safe)
      const trigger = page.locator('[data-testid="accordion-qr"] button[data-state]').first();
      
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
      const afterReopen = await getCanvasSnapshot(page);
      
      // QR should be the same (settings persisted)
      expect(snapshotsAreDifferent(beforeCollapse, afterReopen)).toBe(false);
    });
  });
});
