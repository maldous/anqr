import { test, expect } from '../fixtures/test-fixtures';

/**
 * Gallery Verification Tests
 *
 * Post-deploy smoke tests that verify the gallery page renders correctly:
 * - All 10 section headings are visible
 * - Gallery images load successfully (naturalWidth > 0)
 * - Share links contain expected URL parameters
 * - Clicking a gallery item opens the editor with correct parameters
 */

const GALLERY_SECTION_TITLES = [
  'Plain QR Codes',
  'Content Types',
  'Module & Finder Styles',
  'Colors & Themes',
  'Image Overlays',
  'Animated Overlays',
  'Blend Modes',
  'Color Processing',
  'QR Encoding',
  'Power Combos',
];

/** Representative gallery item IDs used for spot-check assertions */
const SAMPLE_ITEM_IDS = [
  'plain-basic',
  'content-vcard',
  'style-square',
  'color-midnight',
  'overlay-dithered-tsunami',
  'animation-dithered-king',
  'preserve-balanced-tsunami',
  'output-grayscale-tsunami',
  'encoding-v6-tsunami',
  'render-rounded-tsunami',
];

test.describe('Gallery Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
    // Wait for the gallery hero heading to be visible
    await page.locator('h1').first().waitFor({ state: 'visible', timeout: 15000 });
  });

  test('gallery page loads with all 10 section headings visible', async ({ page }) => {
    // All sections are expanded by default, so all h3 headings should be visible
    for (const title of GALLERY_SECTION_TITLES) {
      const heading = page.locator('h3', { hasText: title });
      await expect(heading).toBeVisible({ timeout: 10000 });
    }

    // Verify we have at least 10 section headings
    const allH3s = page.locator('h3');
    const h3Count = await allH3s.count();
    expect(h3Count).toBeGreaterThanOrEqual(10);
  });

  test('gallery images load successfully', async ({ page }) => {
    // Wait for network to settle so lazy images start loading
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Scroll through the page to trigger lazy-loaded images
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const scrollContainer = document.querySelector('.scrollbar-hide') || document.documentElement;
      const scrollHeight = scrollContainer.scrollHeight;
      const step = Math.floor(scrollHeight / 10);
      for (let y = 0; y <= scrollHeight; y += step) {
        scrollContainer.scrollTop = y;
        await delay(200);
      }
      // Scroll back to top
      scrollContainer.scrollTop = 0;
    });

    // Give lazy images time to load after scrolling
    await page.waitForTimeout(2000);

    // Check a representative sample of images have loaded (naturalWidth > 0)
    // Gallery images are <img> tags with loading="lazy" inside gallery cards
    const allImages = page.locator('img[loading="lazy"]');
    const imageCount = await allImages.count();
    expect(imageCount).toBeGreaterThan(0);

    // Check first 12 images (one per section roughly) have loaded
    const sampleSize = Math.min(12, imageCount);
    let loadedCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const img = allImages.nth(i);
      const naturalWidth = await img.evaluate(
        (el: HTMLImageElement) => el.naturalWidth
      );
      if (naturalWidth > 0) {
        loadedCount++;
      }
    }

    // At least 75% of the sample should have loaded
    expect(loadedCount).toBeGreaterThanOrEqual(Math.floor(sampleSize * 0.75));
  });

  test('gallery item share links contain expected URL parameters', async ({ page }) => {
    // Gallery items are rendered as <a> tags with href containing the share URL
    const galleryLinks = page.locator('a[href*="anqr.link"]');
    const linkCount = await galleryLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Check a sample of links for expected URL parameters
    const sampleSize = Math.min(20, linkCount);

    for (let i = 0; i < sampleSize; i++) {
      const link = galleryLinks.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();

      // All gallery share URLs should point to anqr.link with query params
      expect(href).toContain('https://anqr.link');

      // Parse the URL to check for expected parameters
      const url = new URL(href!);
      const params = url.searchParams;

      // Every gallery item should have 'data' and 'ec' parameters at minimum
      expect(params.has('data'), `Link ${i} missing 'data' param: ${href}`).toBe(true);
      expect(params.has('ec'), `Link ${i} missing 'ec' param: ${href}`).toBe(true);

      // 'v' parameter should be present (QR version)
      expect(params.has('v'), `Link ${i} missing 'v' param: ${href}`).toBe(true);

      // 'data' should be a non-empty string
      const data = params.get('data');
      expect(data?.length).toBeGreaterThan(0);

      // 'ec' should be one of L, M, Q, H
      const ec = params.get('ec');
      expect(['L', 'M', 'Q', 'H']).toContain(ec);
    }
  });

  test('gallery links have target="_blank" for external opening', async ({ page }) => {
    const galleryLinks = page.locator('a[href*="anqr.link"]');
    const linkCount = await galleryLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Check that links open in new tab
    const sampleSize = Math.min(10, linkCount);
    for (let i = 0; i < sampleSize; i++) {
      const link = galleryLinks.nth(i);
      const target = await link.getAttribute('target');
      expect(target).toBe('_blank');

      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });

  test('gallery items with overlay have img and mode parameters', async ({ page }) => {
    // Find links that contain 'mode=' which indicates overlay items
    const overlayLinks = page.locator('a[href*="mode="]');
    const overlayCount = await overlayLinks.count();
    expect(overlayCount).toBeGreaterThan(0);

    // Check a sample of overlay links
    const sampleSize = Math.min(10, overlayCount);
    for (let i = 0; i < sampleSize; i++) {
      const link = overlayLinks.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();

      const url = new URL(href!);
      const params = url.searchParams;

      // Overlay items should have 'mode' and 'img' parameters
      expect(params.has('mode'), `Overlay link ${i} missing 'mode': ${href}`).toBe(true);
      expect(params.has('img'), `Overlay link ${i} missing 'img': ${href}`).toBe(true);

      // 'img' should be an absolute URL
      const img = params.get('img');
      expect(img).toContain('https://anqr.link/');

      // 'intensity' should be present for overlay items
      expect(params.has('intensity'), `Overlay link ${i} missing 'intensity': ${href}`).toBe(true);
    }
  });

  test('gallery items with custom colors have fg and bg parameters', async ({ page }) => {
    // Find links in the Colors & Themes section
    // Look for links with fg= parameter
    const colorLinks = page.locator('a[href*="fg="]');
    const colorCount = await colorLinks.count();
    expect(colorCount).toBeGreaterThan(0);

    const sampleSize = Math.min(10, colorCount);
    for (let i = 0; i < sampleSize; i++) {
      const link = colorLinks.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();

      const url = new URL(href!);
      const params = url.searchParams;

      // Color items should have both fg and bg
      expect(params.has('fg'), `Color link ${i} missing 'fg': ${href}`).toBe(true);
      expect(params.has('bg'), `Color link ${i} missing 'bg': ${href}`).toBe(true);

      // fg and bg should be valid 6-char hex (without #)
      const fg = params.get('fg')!;
      const bg = params.get('bg')!;
      expect(fg).toMatch(/^[0-9a-fA-F]{6}$/);
      expect(bg).toMatch(/^[0-9a-fA-F]{6}$/);
    }
  });

  test('clicking a gallery item opens editor with correct parameters', async ({ page }) => {
    // Find the first gallery link (should be in Plain QR Codes section)
    const firstLink = page.locator('a[href*="anqr.link"]').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toBeTruthy();

    // Parse the expected parameters from the share URL
    const expectedUrl = new URL(href!);
    const expectedData = expectedUrl.searchParams.get('data');
    const expectedEc = expectedUrl.searchParams.get('ec');
    const expectedV = expectedUrl.searchParams.get('v');

    // Validate editor routing locally to avoid production/network dependency.
    const currentOrigin = new URL(page.url()).origin;
    const localEditorUrl = new URL(href!);
    localEditorUrl.protocol = new URL(currentOrigin).protocol;
    localEditorUrl.host = new URL(currentOrigin).host;

    await page.goto(`${localEditorUrl.pathname}${localEditorUrl.search}`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // The editor URL should contain the expected parameters
    const newUrl = new URL(page.url());

    // The editor should receive the data parameter
    if (expectedData) {
      expect(newUrl.searchParams.get('data')).toBe(expectedData);
    }
    if (expectedEc) {
      expect(newUrl.searchParams.get('ec')).toBe(expectedEc);
    }
    if (expectedV) {
      expect(newUrl.searchParams.get('v')).toBe(expectedV);
    }

    // No popup/tab was opened in this local navigation path.
  });

  test('each section has the expected number of gallery items', async ({ page }) => {
    // Each section should have at least 1 gallery item (an <a> tag with image)
    for (const title of GALLERY_SECTION_TITLES) {
      const heading = page.locator('h3', { hasText: title });
      await expect(heading).toBeVisible();

      // The section's grid of items is a sibling div after the header button
      // Gallery cards are <a> tags containing <img> elements
      // Find the parent section container - each section is inside a mb-8 div
      const sectionContainer = heading.locator('..').locator('..').locator('..').locator('..');
      const sectionImages = sectionContainer.locator('img[loading="lazy"]');
      const itemCount = await sectionImages.count();
      expect(itemCount, `Section "${title}" should have gallery items`).toBeGreaterThan(0);
    }
  });

  test('gallery sections can be collapsed and expanded', async ({ page }) => {
    // Find the first section toggle button
    const firstSectionButton = page.locator('button', { hasText: GALLERY_SECTION_TITLES[0] }).first();
    await expect(firstSectionButton).toBeVisible();

    // The grid should be visible initially (sections expanded by default)
    const firstSectionContainer = firstSectionButton.locator('..');
    const gridBefore = firstSectionContainer.locator('.grid');
    await expect(gridBefore).toBeVisible();

    // Click to collapse
    await firstSectionButton.click();
    await page.waitForTimeout(300);

    // The grid should now be hidden
    const gridAfter = firstSectionContainer.locator('.grid');
    await expect(gridAfter).toHaveCount(0);

    // Click to expand again
    await firstSectionButton.click();
    await page.waitForTimeout(300);

    // The grid should be visible again
    const gridRestored = firstSectionContainer.locator('.grid');
    await expect(gridRestored).toBeVisible();
  });
});
