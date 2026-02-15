import { test, expect } from '@playwright/test';

/**
 * Gallery Production Verification Tests
 *
 * Post-deploy production smoke tests that verify gallery assets are
 * accessible on the live anqr.link domain. These tests make HTTP requests
 * to production and are SKIPPED by default. Enable them by setting:
 *
 *   ANQR_PRODUCTION_TEST=1 npx playwright test tests/basic/gallery-production.spec.ts
 *
 * Tests verify:
 * - Gallery page loads at https://anqr.link/gallery
 * - Gallery preview images (PNG/GIF) return HTTP 200
 * - Image responses have correct content-type headers
 */

const PRODUCTION_BASE = 'https://anqr.link';

/** Representative sample of static gallery image IDs (PNG) */
const SAMPLE_STATIC_IMAGE_IDS = [
  'plain-basic',
  'plain-v6',
  'content-vcard',
  'content-wifi',
  'style-square',
  'style-rounded',
  'color-midnight',
  'color-forest',
  'img-dithered',
  'img-halftone',
  'blend-classic',
  'blend-navy',
  'cmode-dithered-color',
  'cmode-dithered-grayscale',
  'prep-brightness-p25',
  'prep-contrast-p50',
  'enc-v0',
  'enc-v6',
  'dither-error-diffusion',
  'dither-ordered-bayer',
  'combo-dots-halftone-gold',
  'combo-rounded-dithered-royal',
];

/** Representative sample of animated gallery image IDs (GIF) */
const SAMPLE_ANIMATED_IMAGE_IDS = [
  'anim-dithered',
  'anim-blue-noise',
  'anim-halftone',
  'combo-anim-dots-halftone',
  'combo-anim-rounded-blue-noise',
];

test.describe('Gallery Production Verification', () => {
  test.skip(!process.env.ANQR_PRODUCTION_TEST, 'Set ANQR_PRODUCTION_TEST=1 to run production tests');

  test('gallery page loads at production URL', async ({ request }) => {
    const response = await request.get(`${PRODUCTION_BASE}/gallery`);
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('text/html');

    const body = await response.text();
    expect(body.length).toBeGreaterThan(1000);
    expect(body).toContain('</html>');
  });

  test('static gallery images (PNG) return HTTP 200', async ({ request }) => {
    const results: { id: string; status: number; ok: boolean }[] = [];

    for (const id of SAMPLE_STATIC_IMAGE_IDS) {
      const url = `${PRODUCTION_BASE}/gallery/${id}.png`;
      const response = await request.get(url);
      results.push({
        id,
        status: response.status(),
        ok: response.ok(),
      });
    }

    // Log results for debugging
    const failures = results.filter((r) => !r.ok);
    if (failures.length > 0) {
      console.log('Failed gallery images:', failures);
    }

    // All images should return 200
    for (const result of results) {
      expect(result.status, `Gallery image ${result.id}.png returned ${result.status}`).toBe(200);
    }
  });

  test('animated gallery images (GIF) return HTTP 200', async ({ request }) => {
    const results: { id: string; status: number; ok: boolean }[] = [];

    for (const id of SAMPLE_ANIMATED_IMAGE_IDS) {
      const url = `${PRODUCTION_BASE}/gallery/${id}.gif`;
      const response = await request.get(url);
      results.push({
        id,
        status: response.status(),
        ok: response.ok(),
      });
    }

    const failures = results.filter((r) => !r.ok);
    if (failures.length > 0) {
      console.log('Failed animated gallery images:', failures);
    }

    for (const result of results) {
      expect(result.status, `Gallery image ${result.id}.gif returned ${result.status}`).toBe(200);
    }
  });

  test('gallery images have correct content-type headers', async ({ request }) => {
    // Check a PNG image
    const pngResponse = await request.get(
      `${PRODUCTION_BASE}/gallery/${SAMPLE_STATIC_IMAGE_IDS[0]}.png`
    );
    expect(pngResponse.status()).toBe(200);
    const pngContentType = pngResponse.headers()['content-type'] || '';
    expect(pngContentType).toContain('image/png');

    // Check a GIF image
    const gifResponse = await request.get(
      `${PRODUCTION_BASE}/gallery/${SAMPLE_ANIMATED_IMAGE_IDS[0]}.gif`
    );
    expect(gifResponse.status()).toBe(200);
    const gifContentType = gifResponse.headers()['content-type'] || '';
    expect(gifContentType).toContain('image/gif');
  });

  test('gallery images have non-trivial file sizes', async ({ request }) => {
    // PNG images should be at least a few KB (not empty or error pages)
    const pngResponse = await request.get(
      `${PRODUCTION_BASE}/gallery/${SAMPLE_STATIC_IMAGE_IDS[0]}.png`
    );
    expect(pngResponse.status()).toBe(200);
    const pngBody = await pngResponse.body();
    expect(pngBody.length, 'PNG image should be at least 1KB').toBeGreaterThan(1024);

    // GIF images should also be substantial
    const gifResponse = await request.get(
      `${PRODUCTION_BASE}/gallery/${SAMPLE_ANIMATED_IMAGE_IDS[0]}.gif`
    );
    expect(gifResponse.status()).toBe(200);
    const gifBody = await gifResponse.body();
    expect(gifBody.length, 'GIF image should be at least 1KB').toBeGreaterThan(1024);
  });

  test('production overlay source images are accessible', async ({ request }) => {
    // The gallery items reference these overlay source images
    const sourceImages = [
      `${PRODUCTION_BASE}/tsunami.jpg`,
      `${PRODUCTION_BASE}/king.gif`,
    ];

    for (const url of sourceImages) {
      const response = await request.get(url);
      expect(response.status(), `Source image ${url} should return 200`).toBe(200);
      const body = await response.body();
      expect(body.length, `Source image ${url} should be non-trivial`).toBeGreaterThan(1024);
    }
  });

  test('gallery share URLs resolve to editor page', async ({ request }) => {
    // A gallery share URL should redirect or serve the editor with query params
    const shareUrl = `${PRODUCTION_BASE}?data=https%3A%2F%2Fanqr.link&ec=H&v=0`;
    const response = await request.get(shareUrl);

    // Should return 200 (the SPA serves index.html for all routes)
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('text/html');

    const body = await response.text();
    expect(body).toContain('</html>');
  });
});
