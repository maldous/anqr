import { test, expect } from '@playwright/test';

/**
 * Gallery Availability Verification
 *
 * Runs against the active test base URL by default and can be pointed to a
 * deployed environment via:
 *
 *   ANQR_PRODUCTION_BASE=https://anqr.link npx playwright test tests/basic/gallery-production.spec.ts
 */

const BASE_URL =
  process.env.ANQR_PRODUCTION_BASE || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
const GALLERY_PATH = '/gallery';

async function getGalleryAssets(
  request: import('@playwright/test').APIRequestContext
): Promise<{ pngs: string[]; gifs: string[] }> {
  const manifestUrl = `${BASE_URL}${GALLERY_PATH}/manifest.json`;
  const resp = await request.get(manifestUrl);
  if (!resp.ok()) {
    return { pngs: [], gifs: [] };
  }

  const manifest = (await resp.json()) as {
    items?: Array<{ output?: { file?: string } }>;
  };
  const files = (manifest.items || [])
    .map((item) => item.output?.file)
    .filter((v): v is string => Boolean(v));

  const pngs = files
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .map((f) => `${BASE_URL}${GALLERY_PATH}/${f}`);
  const gifs = files
    .filter((f) => f.toLowerCase().endsWith('.gif'))
    .map((f) => `${BASE_URL}${GALLERY_PATH}/${f}`);

  return { pngs, gifs };
}

test.describe('Gallery Production Verification', () => {
  test('gallery page loads at production URL', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${GALLERY_PATH}`);
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('text/html');

    const body = await response.text();
    expect(body.length).toBeGreaterThan(1000);
    expect(body).toContain('</html>');
  });

  test('static gallery images (PNG) return HTTP 200', async ({ request }) => {
    const { pngs } = await getGalleryAssets(request);
    expect(pngs.length).toBeGreaterThan(0);

    for (const url of pngs.slice(0, 24)) {
      const response = await request.get(url);
      expect(response.status(), `Gallery image ${url} returned ${response.status()}`).toBe(200);
    }
  });

  test('animated gallery images (GIF) return HTTP 200', async ({ request }) => {
    const { gifs } = await getGalleryAssets(request);

    // Some environments may ship PNG-only gallery sets.
    if (gifs.length === 0) {
      expect(gifs.length).toBe(0);
      return;
    }

    for (const url of gifs.slice(0, 12)) {
      const response = await request.get(url);
      expect(response.status(), `Gallery image ${url} returned ${response.status()}`).toBe(200);
    }
  });

  test('gallery images have correct content-type headers', async ({ request }) => {
    const { pngs, gifs } = await getGalleryAssets(request);
    expect(pngs.length).toBeGreaterThan(0);

    const pngResponse = await request.get(pngs[0]);
    expect(pngResponse.status()).toBe(200);
    const pngContentType = pngResponse.headers()['content-type'] || '';
    expect(pngContentType).toContain('image/png');

    if (gifs.length > 0) {
      const gifResponse = await request.get(gifs[0]);
      expect(gifResponse.status()).toBe(200);
      const gifContentType = gifResponse.headers()['content-type'] || '';
      expect(gifContentType).toContain('image/gif');
    }
  });

  test('gallery images have non-trivial file sizes', async ({ request }) => {
    const { pngs, gifs } = await getGalleryAssets(request);
    expect(pngs.length).toBeGreaterThan(0);

    const pngResponse = await request.get(pngs[0]);
    expect(pngResponse.status()).toBe(200);
    const pngBody = await pngResponse.body();
    expect(pngBody.length, 'PNG image should be at least 1KB').toBeGreaterThan(1024);

    if (gifs.length > 0) {
      const gifResponse = await request.get(gifs[0]);
      expect(gifResponse.status()).toBe(200);
      const gifBody = await gifResponse.body();
      expect(gifBody.length, 'GIF image should be at least 1KB').toBeGreaterThan(1024);
    }
  });

  test('production overlay source images are accessible', async ({ request }) => {
    // The gallery items reference these overlay source images
    const sourceImages = [
      `${BASE_URL}/tsunami.jpg`,
      `${BASE_URL}/king.gif`,
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
    const shareUrl = `${BASE_URL}?data=https%3A%2F%2Fanqr.link&ec=H&v=0`;
    const response = await request.get(shareUrl);

    // Should return 200 (the SPA serves index.html for all routes)
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('text/html');

    const body = await response.text();
    expect(body).toContain('</html>');
  });
});
