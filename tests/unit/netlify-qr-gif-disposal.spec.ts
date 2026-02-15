// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

const parseGIF = vi.fn();
const decompressFrames = vi.fn();

vi.mock('@sentry/node', () => ({ init: vi.fn(), captureException: vi.fn() }));
vi.mock('gifuct-js', () => ({ parseGIF, decompressFrames }));

describe('netlify qr gif disposal handling', () => {
  it('respects disposal=3 and supports simplify mode', { timeout: 30000 }, async () => {
    parseGIF.mockReturnValue({ lsd: { width: 2, height: 2 } });
    decompressFrames.mockReturnValue([
      {
        dims: { left: 0, top: 0, width: 2, height: 2 },
        patch: new Uint8Array(16 * 1),
        disposalType: 3,
        delay: 5,
      },
    ]);

    const { __test } = await import('../../netlify/functions/qr');
    const input = new Uint8Array([71, 73, 70, 56, 57, 97]).buffer;

    const respected = __test.parseGifFramesServer(input, 'respect');
    expect(respected).toHaveLength(1);
    expect(respected[0]?.disposalType).toBe(3);

    const simplified = __test.parseGifFramesServer(input, 'simplify');
    expect(simplified).toHaveLength(1);
    expect(simplified[0]?.disposalType).toBe(2);
  });
});

