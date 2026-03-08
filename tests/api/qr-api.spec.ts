/**
 * ANQR — QR API Tests (Playwright)
 *
 * Tests the /api/qr Netlify Function endpoint via HTTP requests.
 * Requires `netlify dev` (port 8888) — started automatically by Playwright webServer config.
 *
 * Coverage:
 *   - Core QR generation (data, size, format)
 *   - Parameter validation and error handling
 *   - Output formats (PNG, GIF, WebP)
 *   - Styling options (module style, colors, finder style)
 *   - ECC levels
 *   - Overlay and watermark (basic)
 *   - CORS headers
 *   - Cache headers
 */

import { test, expect } from '@playwright/test';
import { detectImageFormat, isValidPng } from '../helpers/visual-compare';

const API = '/api/qr';

test.describe('QR API — Core', () => {
  test('returns a valid image for minimal params', async ({ request }) => {
    const res = await request.get(API, { params: { data: 'https://example.com' } });
    expect(res.status()).toBe(200);
    const ct = res.headers()['content-type'];
    expect(ct).toMatch(/^image\/(png|gif|webp)/);
    const body = await res.body();
    expect(body.byteLength).toBeGreaterThan(100);
  });

  test('returns 400 when data param is missing', async ({ request }) => {
    const res = await request.get(API);
    expect(res.status()).toBe(400);
    const text = await res.text();
    expect(text).toContain('data');
  });

  test('returns 400 for excessively long data', async ({ request }) => {
    const longData = 'x'.repeat(5000);
    const res = await request.get(API, { params: { data: longData } });
    expect(res.status()).toBe(400);
  });

  test('returns CORS headers', async ({ request }) => {
    const res = await request.get(API, { params: { data: 'cors-test' } });
    expect(res.headers()['access-control-allow-origin']).toBe('*');
  });

  test('OPTIONS preflight returns 204', async ({ request }) => {
    const res = await request.fetch(API, { method: 'OPTIONS' });
    expect(res.status()).toBe(204);
    expect(res.headers()['access-control-allow-methods']).toContain('GET');
  });
});

test.describe('QR API — Output Formats', () => {
  test('returns PNG when format=png', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'format-png', format: 'png' },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/png');
    const body = await res.body();
    expect(detectImageFormat(body)).toBe('png');
    expect(isValidPng(body)).toBe(true);
  });

  test('returns GIF when format=gif', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'format-gif', format: 'gif' },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/gif');
    const body = await res.body();
    expect(detectImageFormat(body)).toBe('gif');
  });

  test('returns WebP when format=webp', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'format-webp', format: 'webp' },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/webp');
    const body = await res.body();
    expect(detectImageFormat(body)).toBe('webp');
  });

  test('defaults to GIF when format is not specified', async ({ request }) => {
    const res = await request.get(API, { params: { data: 'default-format' } });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/gif');
  });
});

test.describe('QR API — Size and Dimensions', () => {
  test('respects size parameter', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'size-test', size: '200', format: 'png' },
    });
    expect(res.status()).toBe(200);
    const body = await res.body();
    expect(isValidPng(body)).toBe(true);
  });

  test('respects w and h parameters', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'wh-test', w: '300', h: '300', format: 'png' },
    });
    expect(res.status()).toBe(200);
    const body = await res.body();
    expect(isValidPng(body)).toBe(true);
  });

  test('caps size at 2048 (server limit)', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'large', size: '9999', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });
});

test.describe('QR API — ECC Levels', () => {
  for (const ec of ['L', 'M', 'Q', 'H']) {
    test(`generates QR with ECC level ${ec}`, async ({ request }) => {
      const res = await request.get(API, {
        params: { data: `ecc-${ec}`, ec, format: 'png' },
      });
      expect(res.status()).toBe(200);
      const body = await res.body();
      expect(isValidPng(body)).toBe(true);
    });
  }

  test('returns 400 for invalid ECC level', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'bad-ecc', ec: 'Z' },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('QR API — Module Styles', () => {
  for (const style of ['square', 'rounded', 'dots', 'diamond', 'connected']) {
    test(`generates QR with style=${style}`, async ({ request }) => {
      const res = await request.get(API, {
        params: { data: `style-${style}`, style, format: 'png' },
      });
      expect(res.status()).toBe(200);
      const body = await res.body();
      expect(body.byteLength).toBeGreaterThan(100);
    });
  }

  test('returns 400 for invalid module style', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'bad-style', style: 'zigzag' },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('QR API — Colors', () => {
  test('respects custom fg and bg colors', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'color-test', fg: 'ff0000', bg: '00ff00', format: 'png' },
    });
    expect(res.status()).toBe(200);
    const body = await res.body();
    expect(isValidPng(body)).toBe(true);
  });

  test('supports transparent background', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'transparent', transparent: '1', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });
});

test.describe('QR API — Encoding', () => {
  test('encodes a URL', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'https://anqr.link/test?q=hello+world', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });

  test('encodes plain text', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'Hello, World! 🌍', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });

  test('encodes numeric data', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: '1234567890', enc: 'numeric', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });

  test('respects version parameter', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'version-test', v: '5', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });
});

test.describe('QR API — Styling Options', () => {
  test('applies corner radius', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'radius', radius: '50', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });

  test('applies module gap', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'gap', gap: '10', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });

  test('applies finder style', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'finder', finder: 'rounded', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });

  test('applies gradient', async ({ request }) => {
    const res = await request.get(API, {
      params: {
        data: 'gradient',
        grad: 'linear',
        gradAngle: '45',
        gradStops: 'ff0000,0,0000ff,1',
        format: 'png',
      },
    });
    expect(res.status()).toBe(200);
  });

  test('applies frame', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'frame', frame: 'rounded_frame', frameText: 'SCAN ME', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });
});

test.describe('QR API — Watermark', () => {
  test('applies text watermark', async ({ request }) => {
    const res = await request.get(API, {
      params: {
        data: 'watermark-test',
        wmEn: '1',
        wmKind: 'text',
        wmText: 'ANQR',
        wmPos: 'center',
        wmOpacity: '30',
        format: 'png',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.body();
    expect(isValidPng(body)).toBe(true);
  });
});

test.describe('QR API — Metadata', () => {
  test('embeds PNG metadata', async ({ request }) => {
    const res = await request.get(API, {
      params: {
        data: 'meta-test',
        format: 'png',
        metaTitle: 'Test QR',
        metaAuthor: 'ANQR Tests',
      },
    });
    expect(res.status()).toBe(200);
    expect(isValidPng(await res.body())).toBe(true);
  });

  test('sets custom DPI', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'dpi-test', format: 'png', dpi: '300' },
    });
    expect(res.status()).toBe(200);
  });
});

test.describe('QR API — Safety', () => {
  test('applies safety mode balanced', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'safety', safeMode: 'balanced', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });

  test('applies safety mode strict', async ({ request }) => {
    const res = await request.get(API, {
      params: { data: 'safety-strict', safeMode: 'strict', format: 'png' },
    });
    expect(res.status()).toBe(200);
  });
});

test.describe('QR API — Determinism', () => {
  test('produces identical output for identical params', async ({ request }) => {
    const params = { data: 'determinism', format: 'png', size: '200', style: 'square' };
    const res1 = await request.get(API, { params });
    const res2 = await request.get(API, { params });

    expect(res1.status()).toBe(200);
    expect(res2.status()).toBe(200);

    const buf1 = await res1.body();
    const buf2 = await res2.body();
    expect(buf1.equals(buf2)).toBe(true);
  });

  test('produces different output for different data', async ({ request }) => {
    const res1 = await request.get(API, { params: { data: 'aaa', format: 'png' } });
    const res2 = await request.get(API, { params: { data: 'bbb', format: 'png' } });

    const buf1 = await res1.body();
    const buf2 = await res2.body();
    expect(buf1.equals(buf2)).toBe(false);
  });
});
