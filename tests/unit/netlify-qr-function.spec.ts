import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { decodeQR } from '../../src/modules/qr-decoder';
import handler from '../../netlify/functions/qr';

function bufferToImageData(buffer: Buffer) {
  return sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => ({
      data: new Uint8ClampedArray(data),
      width: info.width,
      height: info.height,
    }));
}

describe('netlify qr function', () => {
  it('returns 400 for missing data parameter', async () => {
    const res = await handler(new Request('https://example.com/api/qr?format=png&size=256'));
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toContain('Missing required "data" parameter');
  });

  it('returns 400 for invalid ec/style parameters', async () => {
    const badEc = await handler(
      new Request('https://example.com/api/qr?data=test&format=png&size=128&ec=Z')
    );
    expect(badEc.status).toBe(400);
    await expect(badEc.text()).resolves.toContain('Invalid "ec"');

    const badStyle = await handler(
      new Request('https://example.com/api/qr?data=test&format=png&size=128&style=invalid-style')
    );
    expect(badStyle.status).toBe(400);
    await expect(badStyle.text()).resolves.toContain('Invalid "style"');
  });

  it('returns 400 for payloads over max length', async () => {
    const veryLong = `https://example.com/${'a'.repeat(10000)}`;
    const url = `https://example.com/api/qr?data=${encodeURIComponent(veryLong)}&format=png`;
    const res = await handler(new Request(url));
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toContain('Data too long');
  });

  it('generates a scannable PNG', async () => {
    const payload = 'https://example.com/netlify-test';
    const url = `https://example.com/api/qr?data=${encodeURIComponent(payload)}&format=png&size=256&ec=H`;
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
    const payload = 'https://example.com/netlify-format-test';

    const webpRes = await handler(
      new Request(
        `https://example.com/api/qr?data=${encodeURIComponent(payload)}&format=webp&size=256&ec=H`
      )
    );
    expect(webpRes.status).toBe(200);
    expect(webpRes.headers.get('Content-Type')).toBe('image/webp');
  });

  it('produces stable ETag for identical requests', async () => {
    const payload = 'https://example.com/netlify-etag-test';
    const req = new Request(
      `https://example.com/api/qr?data=${encodeURIComponent(payload)}&format=png&size=256&ec=H`
    );

    const a = await handler(req);
    const b = await handler(req);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(a.headers.get('ETag')).toBeDefined();
    expect(a.headers.get('ETag')).toBe(b.headers.get('ETag'));
  });
});
