// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { decodeQR } from '../../src/modules/qr-decoder';
import { buildUrlParams } from '../../src/modules/share-links/url-params';

vi.mock('@sentry/node', () => ({ init: vi.fn(), captureException: vi.fn() }));

import handler from '../../netlify/functions/qr';
import { __test } from '../../netlify/functions/qr';

async function bufferToImageData(buffer: Buffer) {
  const img = await loadImage(buffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  return {
    data: new Uint8ClampedArray(imageData.data),
    width: imageData.width,
    height: imageData.height,
  };
}

function makeOverlayPngBuffer(): Buffer {
  const canvas = createCanvas(40, 40);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 40, 40);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 20, 20);
  ctx.fillRect(20, 20, 20, 20);
  return canvas.toBuffer('image/png');
}

function makeAnimatedGifBuffer(): Buffer {
  const a = createCanvas(24, 24);
  const b = createCanvas(24, 24);
  const ac = a.getContext('2d');
  const bc = b.getContext('2d');
  ac.fillStyle = '#000000';
  ac.fillRect(0, 0, 24, 24);
  bc.fillStyle = '#ffffff';
  bc.fillRect(0, 0, 24, 24);
  return __test.encodeAnimatedGif([a, b], 80, 64, 2);
}

describe('netlify qr function', () => {
  const PROD_STATIC_OVERLAY_URL = 'https://anqr.link/test.png';
  const PROD_ANIM_OVERLAY_URL = 'https://anqr.link/king.gif';
  it('returns 400 for missing data parameter', async () => {
    const res = await handler(new Request('https://anqr.link/api/qr?format=png&size=256'));
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toContain('Missing required "data" parameter');
  });

  it('returns 400 for invalid ec/style parameters', async () => {
    const badEc = await handler(
      new Request('https://anqr.link/api/qr?data=test&format=png&size=128&ec=Z')
    );
    expect(badEc.status).toBe(400);
    await expect(badEc.text()).resolves.toContain('Invalid "ec"');

    const badStyle = await handler(
      new Request('https://anqr.link/api/qr?data=test&format=png&size=128&style=invalid-style')
    );
    expect(badStyle.status).toBe(400);
    await expect(badStyle.text()).resolves.toContain('Invalid "style"');
  });

  it('returns 400 for payloads over max length', async () => {
    const veryLong = `https://anqr.link/${'a'.repeat(10000)}`;
    const url = `https://anqr.link/api/qr?data=${encodeURIComponent(veryLong)}&format=png`;
    const res = await handler(new Request(url));
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toContain('Data too long');
  });

  it('generates a scannable PNG', async () => {
    const payload = 'https://anqr.link/netlify-test';
    const url = `https://anqr.link/api/qr?data=${encodeURIComponent(payload)}&format=png&size=256&ec=H`;
    const res = await handler(new Request(url));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('Cache-Control')).toContain('immutable');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('ETag')).toMatch(/^".+"$/);
    const buffer = Buffer.from(await res.arrayBuffer());
    const imageData = await bufferToImageData(buffer);
    const decoded = decodeQR(imageData as ImageData);

    expect(decoded?.data).toBe(payload);
  });

  it('returns correct Content-Type for WEBP', async () => {
    const payload = 'https://anqr.link/netlify-format-test';

    const webpRes = await handler(
      new Request(
        `https://anqr.link/api/qr?data=${encodeURIComponent(payload)}&format=webp&size=256&ec=H`
      )
    );
    expect(webpRes.status).toBe(200);
    expect(webpRes.headers.get('Content-Type')).toBe('image/webp');
  });

  it('supports default GIF output path', async () => {
    const payload = 'https://anqr.link/netlify-gif-default';

    const res = await handler(
      new Request(`https://anqr.link/api/qr?data=${encodeURIComponent(payload)}`)
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(100);
  });

  it('renders watermark and PNG metadata path successfully', async () => {
    const payload = 'https://anqr.link/netlify-watermark-metadata';
    const url =
      `https://anqr.link/api/qr?data=${encodeURIComponent(payload)}` +
      '&format=png&size=256&dpi=300&metaTitle=ANQR%20Test&metaAuthor=Tester' +
      '&wmEn=1&wmKind=text&wmText=SCAN%20ME&wmPos=center&wmOpacity=60&wmBlend=overlay';
    const res = await handler(new Request(url));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(0);
  });

  it('blocks private overlay URLs (SSRF protection) and still generates output', async () => {
    const payload = 'https://anqr.link/netlify-ssrf-protection';
    const url =
      `https://anqr.link/api/qr?data=${encodeURIComponent(payload)}` +
      '&format=png&size=256&mode=dithered&img=http%3A%2F%2F127.0.0.1%2Fprivate.png';
    const res = await handler(new Request(url));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    const buffer = Buffer.from(await res.arrayBuffer());
    const imageData = await bufferToImageData(buffer);
    const decoded = decodeQR(imageData as ImageData);
    expect(decoded?.data).toBe(payload);
  });

  it('produces stable ETag for identical requests', async () => {
    const payload = 'https://anqr.link/netlify-etag-test';
    const req = new Request(
      `https://anqr.link/api/qr?data=${encodeURIComponent(payload)}&format=png&size=256&ec=H`
    );

    const a = await handler(req);
    const b = await handler(req);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(a.headers.get('ETag')).toBeDefined();
    expect(a.headers.get('ETag')).toBe(b.headers.get('ETag'));
  });

  it('responds to CORS preflight OPTIONS requests', async () => {
    const res = await handler(
      new Request('https://anqr.link/api/qr?data=test', { method: 'OPTIONS' })
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
  });

  it('reproduces shared URL output with remote overlay params (CORS-safe image URL)', async () => {
    const payload = 'https://anqr.link/?data=https%3A%2F%2Fanqr.link';
    const overlayUrl = 'https://cdn.example.com/overlay.png';
    const overlayBuffer = makeOverlayPngBuffer();

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(overlayBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Content-Length': String(overlayBuffer.byteLength),
          },
        })
      )
      .mockResolvedValueOnce(
        new Response(overlayBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Content-Length': String(overlayBuffer.byteLength),
          },
        })
      );

    try {
      const sharedQuery = buildUrlParams({
        data: payload,
        ec: 'L',
        version: 6,
        mode: 'dithered',
        overlayUrl,
        intensity: 70,
        colorMode: 'grayscale',
        threshold: 120,
        cropEnabled: true,
        cropX: 0.45,
        cropY: 0.55,
        cropSize: 0.8,
        fit: 'cover',
        preserveFinders: true,
      });
      const reqUrl = `https://anqr.link/api/qr?${sharedQuery}&format=png&size=320`;

      const first = await handler(new Request(reqUrl));
      const second = await handler(new Request(reqUrl));

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(first.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(first.headers.get('ETag')).toBe(second.headers.get('ETag'));

      const firstBytes = Buffer.from(await first.arrayBuffer());
      const secondBytes = Buffer.from(await second.arrayBuffer());
      expect(firstBytes.equals(secondBytes)).toBe(true);

      const imageData = await bufferToImageData(firstBytes);
      const decoded = decodeQR(imageData as ImageData);
      expect(decoded?.data).toBe(payload);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('ignores non-image remote overlay responses and still returns deterministic output', async () => {
    const payload = 'https://anqr.link/non-image-overlay';
    const overlayUrl = 'https://cdn.example.com/not-image.txt';
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response('not-an-image', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        })
      )
      .mockResolvedValueOnce(
        new Response('not-an-image', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        })
      );

    try {
      const reqUrl =
        `https://anqr.link/api/qr?data=${encodeURIComponent(payload)}` +
        `&img=${encodeURIComponent(overlayUrl)}&mode=dithered&format=png&size=256`;
      const a = await handler(new Request(reqUrl));
      const b = await handler(new Request(reqUrl));
      expect(a.status).toBe(200);
      expect(b.status).toBe(200);
      expect(a.headers.get('ETag')).toBe(b.headers.get('ETag'));
      const imageData = await bufferToImageData(Buffer.from(await a.arrayBuffer()));
      expect(decodeQR(imageData as ImageData)?.data).toBe(payload);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('rejects oversized remote overlays and still serves QR response', async () => {
    const payload = 'https://anqr.link/oversized-overlay';
    const overlayUrl = 'https://cdn.example.com/huge.png';
    const tooLarge = Buffer.alloc(5 * 1024 * 1024 + 1024, 0xaa);
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(tooLarge, {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      })
    );
    try {
      const reqUrl =
        `https://anqr.link/api/qr?data=${encodeURIComponent(payload)}` +
        `&img=${encodeURIComponent(overlayUrl)}&mode=dithered&format=png&size=256`;
      const res = await handler(new Request(reqUrl));
      expect(res.status).toBe(200);
      const imageData = await bufferToImageData(Buffer.from(await res.arrayBuffer()));
      expect(decodeQR(imageData as ImageData)?.data).toBe(payload);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('supports explicit GIF output path', async () => {
    const payload = 'https://anqr.link/gif-success';
    const res = await handler(
      new Request(
        `https://anqr.link/api/qr?data=${encodeURIComponent(payload)}&format=gif&size=256&ec=H&animPattern=pulse&animFrames=6`
      )
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(100);
  });

  it('optional production contract: anqr.link reproduces shared URL payloads', async () => {
    if (process.env.RUN_PROD_API_CONTRACT !== '1') {
      return;
    }
    const shared = buildUrlParams({
      data: 'https://anqr.link',
      ec: 'L',
      version: 6,
      mode: 'dithered',
      overlayUrl: PROD_STATIC_OVERLAY_URL,
      intensity: 60,
      colorMode: 'grayscale',
      threshold: 120,
    });
    const url = `https://anqr.link/api/qr?${shared}&format=png&size=320`;
    const res = await fetch(url);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    const imageData = await bufferToImageData(Buffer.from(await res.arrayBuffer()));
    expect(decodeQR(imageData as ImageData)?.data).toBe('https://anqr.link');
  });

  it('optional production contract: anqr.link accepts animated overlay URL', async () => {
    if (process.env.RUN_PROD_API_CONTRACT !== '1') {
      return;
    }
    const shared = buildUrlParams({
      data: 'https://anqr.link',
      ec: 'L',
      version: 6,
      mode: 'dithered',
      overlayUrl: PROD_ANIM_OVERLAY_URL,
      intensity: 60,
      colorMode: 'grayscale',
    });
    const url = `https://anqr.link/api/qr?${shared}&format=gif&size=320`;
    const res = await fetch(url);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(100);
  });

  it('processes animated overlay gif frames and returns animated gif', async () => {
    const payload = 'https://anqr.link/anim-overlay-test';
    const overlayUrl = 'https://cdn.example.com/overlay.gif';
    const overlayGif = makeAnimatedGifBuffer();

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(overlayGif, {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Content-Length': String(overlayGif.byteLength),
        },
      })
    );
    try {
      const reqUrl =
        `https://anqr.link/api/qr?data=${encodeURIComponent(payload)}` +
        `&img=${encodeURIComponent(overlayUrl)}&mode=dithered&format=gif` +
        '&cropEn=1&cropSize=0.9&rot=15&flipX=1&gifMaxFps=12' +
        '&wmEn=1&wmKind=text&wmText=ANQR&wmOpacity=60&wmBlend=overlay';
      const res = await handler(new Request(reqUrl));
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('image/gif');
      expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(100);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('parses palette parameter and keeps QR scannable', async () => {
    const payload = 'https://anqr.link/palette-branch';
    const url =
      `https://anqr.link/api/qr?data=${encodeURIComponent(payload)}` +
      '&format=png&size=300&palette=ff0000,00ff00,0000ff&paletteMode=random';
    const res = await handler(new Request(url));
    expect(res.status).toBe(200);
    const imageData = await bufferToImageData(Buffer.from(await res.arrayBuffer()));
    expect(decodeQR(imageData as ImageData)?.data).toBe(payload);
  });
});
