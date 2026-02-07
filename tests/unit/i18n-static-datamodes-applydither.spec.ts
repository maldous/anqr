import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// ImageData polyfill for node
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace: string;
  constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = dataOrWidth;
      this.width = widthOrHeight;
      this.height = height!;
    }
    this.colorSpace = 'srgb';
  }
}
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = MockImageData;
}

// ============================================================================
// i18n/static/index.ts tests
// ============================================================================

describe('i18n/static/index.ts', () => {
  describe('hasStaticTranslation', () => {
    it('returns true for direct-match language codes', async () => {
      const { hasStaticTranslation } = await import('../../src/i18n/static/index');
      expect(hasStaticTranslation('en-GB')).toBe(true);
      expect(hasStaticTranslation('de-DE')).toBe(true);
      expect(hasStaticTranslation('ja-JP')).toBe(true);
      expect(hasStaticTranslation('zh-CN')).toBe(true);
    });

    it('returns true for browser code that maps to supported language', async () => {
      const { hasStaticTranslation } = await import('../../src/i18n/static/index');
      // 'en' maps to 'en-GB' which is supported
      expect(hasStaticTranslation('en')).toBe(true);
      // 'hi' maps to 'hi-IN'
      expect(hasStaticTranslation('hi')).toBe(true);
      // 'fr' maps to 'fr-FR'
      expect(hasStaticTranslation('fr')).toBe(true);
    });

    it('returns true for base language direct match', async () => {
      const { hasStaticTranslation } = await import('../../src/i18n/static/index');
      // 'af' is directly in supportedLanguages
      expect(hasStaticTranslation('af')).toBe(true);
      // 'bg' is directly supported
      expect(hasStaticTranslation('bg')).toBe(true);
    });

    it('resolves via base language mapping for regional variants', async () => {
      const { hasStaticTranslation } = await import('../../src/i18n/static/index');
      // 'de-AT' → base 'de' → maps to 'de-DE'
      expect(hasStaticTranslation('de-AT')).toBe(true);
      // 'es-MX' → maps to 'es-419'
      expect(hasStaticTranslation('es-MX')).toBe(true);
    });

    it('falls back to en-GB for unknown language (which is supported)', async () => {
      const { hasStaticTranslation } = await import('../../src/i18n/static/index');
      // Unknown language → resolves to 'en-GB' → true
      expect(hasStaticTranslation('xx-YY')).toBe(true);
    });
  });

  describe('getStaticContent (sync)', () => {
    it('returns English content for en-GB directly from cache', async () => {
      const { getStaticContent } = await import('../../src/i18n/static/index');
      const content = getStaticContent('en-GB', 'privacy');
      expect(content).toBeDefined();
      expect(content.title).toBeDefined();
    });

    it('returns English content for various page types', async () => {
      const { getStaticContent } = await import('../../src/i18n/static/index');
      const privacy = getStaticContent('en-GB', 'privacy');
      expect(privacy.title).toBeDefined();
      const terms = getStaticContent('en-GB', 'terms');
      expect(terms.title).toBeDefined();
      const about = getStaticContent('en-GB', 'about');
      expect(about.title).toBeDefined();
    });

    it('falls back to English for unknown language (sync)', async () => {
      const { getStaticContent } = await import('../../src/i18n/static/index');
      // Unknown language → triggers async load, returns English fallback immediately
      const content = getStaticContent('xx-YY', 'privacy');
      expect(content).toBeDefined();
      expect(content.title).toBeDefined();
    });

    it('resolves browser code and returns cached content if available', async () => {
      const { getStaticContent } = await import('../../src/i18n/static/index');
      // 'en' → 'en-GB' which is cached
      const content = getStaticContent('en', 'privacy');
      expect(content).toBeDefined();
    });
  });

  describe('getStaticContentAsync', () => {
    it('returns English content for en-GB', async () => {
      const { getStaticContentAsync } = await import('../../src/i18n/static/index');
      const content = await getStaticContentAsync('en-GB', 'privacy');
      expect(content).toBeDefined();
      expect(content.title).toBeDefined();
    });

    it('returns content for language with valid module', async () => {
      const { getStaticContentAsync } = await import('../../src/i18n/static/index');
      // en-US should map to en-GB (via base 'en' mapping)
      const content = await getStaticContentAsync('en-US', 'privacy');
      expect(content).toBeDefined();
    });

    it('falls back to English for unknown language', async () => {
      const { getStaticContentAsync } = await import('../../src/i18n/static/index');
      const content = await getStaticContentAsync('xx-YY', 'about');
      expect(content).toBeDefined();
      expect(content.title).toBeDefined();
    });
  });

  describe('preloadStaticContent', () => {
    it('does not throw for English (already cached)', async () => {
      const { preloadStaticContent } = await import('../../src/i18n/static/index');
      await expect(preloadStaticContent('en-GB')).resolves.not.toThrow();
    });

    it('does not throw for unknown language', async () => {
      const { preloadStaticContent } = await import('../../src/i18n/static/index');
      // Falls back to English
      await expect(preloadStaticContent('xx-YY')).resolves.not.toThrow();
    });
  });
});

// ============================================================================
// qr-encoder/data-modes.ts tests
// ============================================================================

describe('qr-encoder data-modes.ts', () => {
  // Simple bit buffer mock to capture writes
  interface BufferEntry {
    value: number;
    length: number;
  }

  function createMockBuffer() {
    const entries: BufferEntry[] = [];
    return {
      put(num: number, length: number) {
        entries.push({ value: num, length });
      },
      getEntries() {
        return entries;
      },
    };
  }

  describe('qrNumber', () => {
    it('returns correct mode and length', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrNumber('12345');
      // QRMode.MODE_NUMBER = 1 << 0 = 1
      expect(seg.getMode()).toBe(1);
      expect(seg.getLength()).toBe(5);
    });

    it('writes 3-digit groups in 10 bits', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrNumber('123');
      const buf = createMockBuffer();
      seg.write(buf);
      // "123" → one 3-digit group: value 123, 10 bits
      expect(buf.getEntries()).toEqual([{ value: 123, length: 10 }]);
    });

    it('writes 2-digit remainder in 7 bits', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrNumber('12');
      const buf = createMockBuffer();
      seg.write(buf);
      // "12" → 2-digit remainder: value 12, 7 bits
      expect(buf.getEntries()).toEqual([{ value: 12, length: 7 }]);
    });

    it('writes 1-digit remainder in 4 bits', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrNumber('9');
      const buf = createMockBuffer();
      seg.write(buf);
      // "9" → 1-digit: value 9, 4 bits
      expect(buf.getEntries()).toEqual([{ value: 9, length: 4 }]);
    });

    it('writes multiple groups + remainder', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrNumber('1234567');
      const buf = createMockBuffer();
      seg.write(buf);
      // "123" (10 bits) + "456" (10 bits) + "7" (4 bits)
      expect(buf.getEntries()).toHaveLength(3);
      expect(buf.getEntries()[0]).toEqual({ value: 123, length: 10 });
      expect(buf.getEntries()[1]).toEqual({ value: 456, length: 10 });
      expect(buf.getEntries()[2]).toEqual({ value: 7, length: 4 });
    });

    it('writes 6 digits as two 3-digit groups', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrNumber('123456');
      const buf = createMockBuffer();
      seg.write(buf);
      expect(buf.getEntries()).toHaveLength(2);
      expect(buf.getEntries()[0]).toEqual({ value: 123, length: 10 });
      expect(buf.getEntries()[1]).toEqual({ value: 456, length: 10 });
    });

    it('writes empty string with no entries', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrNumber('');
      const buf = createMockBuffer();
      seg.write(buf);
      expect(buf.getEntries()).toHaveLength(0);
    });

    it('handles leading zeros', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrNumber('007');
      const buf = createMockBuffer();
      seg.write(buf);
      expect(buf.getEntries()).toEqual([{ value: 7, length: 10 }]);
    });
  });

  describe('qrAlphaNum', () => {
    it('returns correct mode and length', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrAlphaNum('HELLO');
      // QRMode.MODE_ALPHA_NUM = 1 << 1 = 2
      expect(seg.getMode()).toBe(2);
      expect(seg.getLength()).toBe(5);
    });

    it('writes pairs in 11 bits', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrAlphaNum('AB');
      const buf = createMockBuffer();
      seg.write(buf);
      // A=10, B=11, pair = 10*45 + 11 = 461
      expect(buf.getEntries()).toEqual([{ value: 461, length: 11 }]);
    });

    it('writes odd character in 6 bits', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrAlphaNum('A');
      const buf = createMockBuffer();
      seg.write(buf);
      // A=10, single char in 6 bits
      expect(buf.getEntries()).toEqual([{ value: 10, length: 6 }]);
    });

    it('handles pairs + remainder', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrAlphaNum('ABC');
      const buf = createMockBuffer();
      seg.write(buf);
      // AB pair = 461 (11 bits), C=12 single (6 bits)
      expect(buf.getEntries()).toHaveLength(2);
      expect(buf.getEntries()[0]).toEqual({ value: 461, length: 11 });
      expect(buf.getEntries()[1]).toEqual({ value: 12, length: 6 });
    });

    it('encodes digits correctly (0-9)', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qrAlphaNum('01');
      const buf = createMockBuffer();
      seg.write(buf);
      // '0'=0, '1'=1, pair = 0*45 + 1 = 1
      expect(buf.getEntries()).toEqual([{ value: 1, length: 11 }]);
    });

    it('encodes special characters', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      // Space(36), $(37), %(38), *(39), +(40), -(41), .(42), /(43), :(44)
      const seg = qrAlphaNum(' $');
      const buf = createMockBuffer();
      seg.write(buf);
      // space=36, $=37, pair = 36*45 + 37 = 1657
      expect(buf.getEntries()).toEqual([{ value: 1657, length: 11 }]);
    });

    it('encodes each special character solo (6 bits)', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const specialChars = [' ', '$', '%', '*', '+', '-', '.', '/', ':'];
      const expectedCodes = [36, 37, 38, 39, 40, 41, 42, 43, 44];
      for (let i = 0; i < specialChars.length; i++) {
        const seg = qrAlphaNum(specialChars[i]);
        const buf = createMockBuffer();
        seg.write(buf);
        expect(buf.getEntries()).toEqual([{ value: expectedCodes[i], length: 6 }]);
      }
    });
  });

  describe('qr8BitByte', () => {
    it('returns correct mode and length', async () => {
      const { qr8BitByte } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qr8BitByte('Hello');
      // QRMode.MODE_8BIT_BYTE = 1 << 2 = 4
      expect(seg.getMode()).toBe(4);
      // Length is byte count (UTF-8 for ASCII = same as char count)
      expect(seg.getLength()).toBe(5);
    });

    it('writes each byte in 8 bits', async () => {
      const { qr8BitByte } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qr8BitByte('Hi');
      const buf = createMockBuffer();
      seg.write(buf);
      // 'H'=0x48, 'i'=0x69
      expect(buf.getEntries()).toHaveLength(2);
      expect(buf.getEntries()[0]).toEqual({ value: 0x48, length: 8 });
      expect(buf.getEntries()[1]).toEqual({ value: 0x69, length: 8 });
    });

    it('handles empty string', async () => {
      const { qr8BitByte } = await import('../../src/modules/qr-encoder/data-modes');
      const seg = qr8BitByte('');
      const buf = createMockBuffer();
      seg.write(buf);
      expect(buf.getEntries()).toHaveLength(0);
    });

    it('handles multi-byte UTF-8 characters', async () => {
      const { qr8BitByte } = await import('../../src/modules/qr-encoder/data-modes');
      // UTF-8: each character may produce multiple bytes
      const seg = qr8BitByte('é'); // 2 bytes in UTF-8: 0xC3, 0xA9
      expect(seg.getLength()).toBeGreaterThanOrEqual(1);
      const buf = createMockBuffer();
      seg.write(buf);
      expect(buf.getEntries().length).toBeGreaterThanOrEqual(1);
      // Each entry should be 8 bits
      for (const entry of buf.getEntries()) {
        expect(entry.length).toBe(8);
      }
    });
  });

  describe('qrKanji', () => {
    it('throws for non-kanji data (sjis not supported in Node)', async () => {
      const { qrKanji } = await import('../../src/modules/qr-encoder/data-modes');
      // In Node, stringToBytesFn likely doesn't produce Shift-JIS
      // The self-test for 友 should fail
      expect(() => qrKanji('test')).toThrow('sjis not supported');
    });
  });
});

// ============================================================================
// dither-algorithms/apply-dither.ts tests
// ============================================================================

describe('dither-algorithms apply-dither.ts', () => {
  function createTestImageData(width: number, height: number): InstanceType<typeof MockImageData> {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.floor(((i / 4) / (width * height)) * 255);
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
      data[i + 3] = 255;
    }
    return new MockImageData(data, width, height);
  }

  describe('applyDither', () => {
    it('applies ordered_bayer dither with bayer4 matrix', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(8, 8) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'ordered_bayer',
        orderedMatrix: 'bayer4',
        levels: 2,
        strength: 1,
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(8);
      expect(result.matrix[0]).toHaveLength(8);
    });

    it('applies ordered_bayer with bayer2 matrix', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'ordered_bayer',
        orderedMatrix: 'bayer2',
        levels: 2,
        strength: 1,
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('applies ordered_bayer with bayer8 matrix', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(8, 8) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'ordered_bayer',
        orderedMatrix: 'bayer8',
        levels: 2,
        strength: 1,
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(8);
    });

    it('applies ordered_bayer with unknown matrix (defaults to 4)', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'ordered_bayer',
        orderedMatrix: 'unknown',
        levels: 2,
        strength: 1,
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('applies ordered_clustered dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(8, 8) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'ordered_clustered',
        levels: 2,
        strength: 1,
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(8);
    });

    it('applies ordered_void_cluster dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(8, 8) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'ordered_void_cluster',
        levels: 2,
        strength: 1,
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(8);
    });

    it('applies blue_noise dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(8, 8) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'blue_noise',
        blueNoiseTileSize: 32,
        blueNoiseSeed: 0,
        levels: 2,
        strength: 1,
        colorMode: 'bw',
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(8);
    });

    it('applies blue_noise_threshold dither (same path as blue_noise)', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'blue_noise_threshold',
        blueNoiseTileSize: 32,
        blueNoiseSeed: 0,
        levels: 2,
        strength: 1,
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('applies white_noise dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'white_noise',
        blueNoiseSeed: 42,
        strength: 1,
        colorMode: 'bw',
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('applies gaussian_noise dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'gaussian_noise',
        blueNoiseSeed: 42,
        strength: 1,
        colorMode: 'bw',
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('applies triangular_noise dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'triangular_noise',
        blueNoiseSeed: 42,
        strength: 1,
        colorMode: 'bw',
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('applies blue_noise_error_diffusion dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'blue_noise_error_diffusion',
        diffusionKernel: 'floyd_steinberg',
        serpentine: false,
        levels: 2,
        strength: 1,
        colorMode: 'bw',
        blueNoiseTileSize: 32,
        blueNoiseSeed: 0,
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('applies screened_blue_noise dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'screened_blue_noise',
        blueNoiseTileSize: 32,
        blueNoiseSeed: 0,
        levels: 2,
        strength: 1,
        colorMode: 'bw',
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('applies perceptual dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'perceptual',
        diffusionKernel: 'floyd_steinberg',
        serpentine: true,
        levels: 2,
        strength: 1,
        colorMode: 'bw',
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('applies edge_aware dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'edge_aware',
        diffusionKernel: 'floyd_steinberg',
        serpentine: false,
        levels: 2,
        strength: 1,
        colorMode: 'bw',
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('applies adaptive_threshold dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(8, 8) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'adaptive_threshold',
        strength: 1,
        colorMode: 'bw',
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(8);
    });

    it('applies temporal_blue_noise dither', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'temporal_blue_noise',
        blueNoiseTileSize: 32,
        blueNoiseSeed: 0,
        colorMode: 'bw',
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('falls back to error diffusion for unknown kind', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const result = applyDither(img, {
        kind: 'error_diffusion' as string,
        diffusionKernel: 'floyd_steinberg',
        serpentine: false,
        levels: 2,
        strength: 1,
        colorMode: 'bw',
      } as Parameters<typeof applyDither>[1]);
      expect(result.matrix).toHaveLength(4);
    });

    it('all dither results have matrix and colors arrays', async () => {
      const { applyDither } = await import('../../src/modules/dither-algorithms/apply-dither');
      const img = createTestImageData(4, 4) as unknown as ImageData;
      const kinds = [
        'ordered_bayer',
        'blue_noise',
        'white_noise',
        'adaptive_threshold',
        'temporal_blue_noise',
      ];
      for (const kind of kinds) {
        const result = applyDither(img, {
          kind,
          orderedMatrix: 'bayer4',
          levels: 2,
          strength: 1,
          blueNoiseTileSize: 32,
          blueNoiseSeed: 0,
          colorMode: 'bw',
        } as Parameters<typeof applyDither>[1]);
        expect(result.matrix).toBeDefined();
        expect(result.colors).toBeDefined();
        expect(result.matrix).toHaveLength(4);
        expect(result.colors).toHaveLength(4);
      }
    });
  });
});
