import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

import {
  calculateCrc32,
  createPngPhysChunk,
  createPngTextChunk,
  embedPngDpi,
  embedPngMetadata,
} from '../../src/modules/exporter/png-metadata';

function oneByOnePngBlob(): Blob {
  const b64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7+f44AAAAASUVORK5CYII=';
  return new Blob([Buffer.from(b64, 'base64')], { type: 'image/png' });
}

describe('exporter png metadata', () => {
  it('calculates crc32 and creates pHYs/iTXt chunks', () => {
    const crc = calculateCrc32(new TextEncoder().encode('123456789'));
    expect(crc).toBe(0xcbf43926);

    const phys = createPngPhysChunk(300);
    expect(phys.length).toBe(21);
    expect(new TextDecoder().decode(phys.slice(4, 8))).toBe('pHYs');

    const txt = createPngTextChunk('Title', 'ANQR');
    expect(new TextDecoder().decode(txt.slice(4, 8))).toBe('iTXt');
    expect(txt.length).toBeGreaterThan(20);
  });

  it('embeds dpi and metadata into png and handles invalid cases', async () => {
    const png = oneByOnePngBlob();

    const unchanged = await embedPngDpi(png, 0);
    expect(unchanged).toBe(png);

    const withDpi = await embedPngDpi(png, 300);
    expect(withDpi.size).toBeGreaterThan(png.size);

    const withMeta = await embedPngMetadata(png, {
      title: 'T',
      author: 'A',
      description: 'D',
    });
    expect(withMeta.size).toBeGreaterThan(png.size);

    const noMeta = await embedPngMetadata(png, {});
    expect(noMeta).toBe(png);

    const invalidSig = new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/png' });
    const invalidResult = await embedPngMetadata(invalidSig, { title: 'X' });
    expect(invalidResult).toBe(invalidSig);

    const noIend = new Blob([new Uint8Array(Buffer.from('89504e470d0a1a0a', 'hex'))], { type: 'image/png' });
    const noIendResult = await embedPngMetadata(noIend, { title: 'X' });
    expect(noIendResult).toBe(noIend);
  });
});
