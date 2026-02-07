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
  it('generates a scannable PNG', async () => {
    const payload = 'https://example.com/netlify-test';
    const url = `https://example.com/api/qr?data=${encodeURIComponent(payload)}&format=png&size=256&ec=H`;
    const res = await handler(new Request(url));

    expect(res.status).toBe(200);
    const buffer = Buffer.from(await res.arrayBuffer());
    const imageData = await bufferToImageData(buffer);
    const decoded = decodeQR(imageData as ImageData);

    expect(decoded?.data).toBe(payload);
  });
});
