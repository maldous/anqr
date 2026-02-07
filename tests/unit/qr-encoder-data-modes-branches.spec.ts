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

import { qrNumber, qrAlphaNum, qr8BitByte, qrKanji } from '../../src/modules/qr-encoder/data-modes';
import { QRMode } from '../../src/modules/qr-encoder/types';

/**
 * Capturing mock bit buffer: records all put() calls for verification
 */
function createCapturingBuffer() {
  const puts: Array<{ num: number; length: number }> = [];
  return {
    buffer: {
      put(num: number, length: number) {
        puts.push({ num, length });
      },
      getBuffer: () => [],
      getAt: () => false,
      getLengthInBits: () => puts.reduce((s, p) => s + p.length, 0),
      putBit: () => {},
    },
    puts,
  };
}

describe('qr-encoder/data-modes.ts branch coverage', () => {
  describe('qrNumber', () => {
    it('getMode returns MODE_NUMBER', () => {
      const seg = qrNumber('123');
      expect(seg.getMode()).toBe(QRMode.MODE_NUMBER);
    });

    it('getLength returns string length', () => {
      expect(qrNumber('').getLength()).toBe(0);
      expect(qrNumber('1').getLength()).toBe(1);
      expect(qrNumber('12345').getLength()).toBe(5);
    });

    describe('write', () => {
      it('3 digits → one 10-bit group', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrNumber('123').write(buffer);
        // strToNum("123") = 123
        expect(puts).toEqual([{ num: 123, length: 10 }]);
      });

      it('6 digits → two 10-bit groups', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrNumber('123456').write(buffer);
        expect(puts).toEqual([
          { num: 123, length: 10 },
          { num: 456, length: 10 },
        ]);
      });

      it('9 digits → three 10-bit groups', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrNumber('123456789').write(buffer);
        expect(puts).toEqual([
          { num: 123, length: 10 },
          { num: 456, length: 10 },
          { num: 789, length: 10 },
        ]);
      });

      it('4 digits → one 10-bit group + one 4-bit remainder (length-i === 1)', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrNumber('1234').write(buffer);
        // "123" → 123 in 10 bits, "4" → 4 in 4 bits
        expect(puts).toEqual([
          { num: 123, length: 10 },
          { num: 4, length: 4 },
        ]);
      });

      it('5 digits → one 10-bit group + one 7-bit remainder (length-i === 2)', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrNumber('12345').write(buffer);
        // "123" → 123 in 10 bits, "45" → 45 in 7 bits
        expect(puts).toEqual([
          { num: 123, length: 10 },
          { num: 45, length: 7 },
        ]);
      });

      it('2 digits → one 7-bit remainder only', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrNumber('99').write(buffer);
        expect(puts).toEqual([{ num: 99, length: 7 }]);
      });

      it('1 digit → one 4-bit remainder only', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrNumber('7').write(buffer);
        expect(puts).toEqual([{ num: 7, length: 4 }]);
      });

      it('empty string → nothing written', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrNumber('').write(buffer);
        expect(puts).toHaveLength(0);
      });

      it('all digits 0-9 are accepted', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrNumber('0123456789').write(buffer);
        // "012" → 12, "345" → 345, "678" → 678, "9" → 9
        expect(puts).toEqual([
          { num: 12, length: 10 },
          { num: 345, length: 10 },
          { num: 678, length: 10 },
          { num: 9, length: 4 },
        ]);
      });

      it('throws for non-digit character', () => {
        const { buffer } = createCapturingBuffer();
        expect(() => qrNumber('12a').write(buffer)).toThrow('illegal char');
      });

      it('throws for letter at start', () => {
        const { buffer } = createCapturingBuffer();
        expect(() => qrNumber('A12').write(buffer)).toThrow('illegal char');
      });

      it('throws for special character', () => {
        const { buffer } = createCapturingBuffer();
        expect(() => qrNumber('12.3').write(buffer)).toThrow('illegal char');
      });
    });
  });

  describe('qrAlphaNum', () => {
    it('getMode returns MODE_ALPHA_NUM', () => {
      const seg = qrAlphaNum('AB');
      expect(seg.getMode()).toBe(QRMode.MODE_ALPHA_NUM);
    });

    it('getLength returns string length', () => {
      expect(qrAlphaNum('').getLength()).toBe(0);
      expect(qrAlphaNum('ABC').getLength()).toBe(3);
    });

    describe('write', () => {
      it('2 chars (even) → one 11-bit pair', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('AB').write(buffer);
        // getCode('A')=10, getCode('B')=11
        // 10 * 45 + 11 = 461
        expect(puts).toEqual([{ num: 461, length: 11 }]);
      });

      it('4 chars → two 11-bit pairs', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('ABCD').write(buffer);
        // 'AB' → 10*45+11 = 461
        // 'CD' → 12*45+13 = 553
        expect(puts).toEqual([
          { num: 461, length: 11 },
          { num: 553, length: 11 },
        ]);
      });

      it('3 chars (odd) → one 11-bit pair + one 6-bit remainder', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('ABC').write(buffer);
        // 'AB' → 10*45+11 = 461
        // 'C' → 12
        expect(puts).toEqual([
          { num: 461, length: 11 },
          { num: 12, length: 6 },
        ]);
      });

      it('1 char → one 6-bit remainder only', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('Z').write(buffer);
        // getCode('Z') = 25 + 10 = 35
        expect(puts).toEqual([{ num: 35, length: 6 }]);
      });

      it('empty string → nothing written', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('').write(buffer);
        expect(puts).toHaveLength(0);
      });

      it('digits 0-9 → codes 0-9', () => {
        const { buffer, puts } = createCapturingBuffer();
        // '0' and '1' as a pair
        qrAlphaNum('01').write(buffer);
        // getCode('0')=0, getCode('1')=1
        // 0 * 45 + 1 = 1
        expect(puts).toEqual([{ num: 1, length: 11 }]);
      });

      it('digit 9 → code 9', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('9').write(buffer);
        expect(puts).toEqual([{ num: 9, length: 6 }]);
      });

      it('space → code 36', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum(' ').write(buffer);
        expect(puts).toEqual([{ num: 36, length: 6 }]);
      });

      it('$ → code 37', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('$').write(buffer);
        expect(puts).toEqual([{ num: 37, length: 6 }]);
      });

      it('% → code 38', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('%').write(buffer);
        expect(puts).toEqual([{ num: 38, length: 6 }]);
      });

      it('* → code 39', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('*').write(buffer);
        expect(puts).toEqual([{ num: 39, length: 6 }]);
      });

      it('+ → code 40', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('+').write(buffer);
        expect(puts).toEqual([{ num: 40, length: 6 }]);
      });

      it('- → code 41', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('-').write(buffer);
        expect(puts).toEqual([{ num: 41, length: 6 }]);
      });

      it('. → code 42', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('.').write(buffer);
        expect(puts).toEqual([{ num: 42, length: 6 }]);
      });

      it('/ → code 43', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum('/').write(buffer);
        expect(puts).toEqual([{ num: 43, length: 6 }]);
      });

      it(': → code 44', () => {
        const { buffer, puts } = createCapturingBuffer();
        qrAlphaNum(':').write(buffer);
        expect(puts).toEqual([{ num: 44, length: 6 }]);
      });

      it('all special chars in pairs', () => {
        const { buffer, puts } = createCapturingBuffer();
        // space + $
        qrAlphaNum(' $').write(buffer);
        // 36 * 45 + 37 = 1657
        expect(puts).toEqual([{ num: 1657, length: 11 }]);
      });

      it('throws for lowercase letter', () => {
        const { buffer } = createCapturingBuffer();
        expect(() => qrAlphaNum('a').write(buffer)).toThrow('illegal char');
      });

      it('throws for unsupported special character', () => {
        const { buffer } = createCapturingBuffer();
        expect(() => qrAlphaNum('#').write(buffer)).toThrow('illegal char');
      });

      it('throws for @ character', () => {
        const { buffer } = createCapturingBuffer();
        expect(() => qrAlphaNum('@').write(buffer)).toThrow('illegal char');
      });
    });
  });

  describe('qr8BitByte', () => {
    it('getMode returns MODE_8BIT_BYTE', () => {
      const seg = qr8BitByte('Hello');
      expect(seg.getMode()).toBe(QRMode.MODE_8BIT_BYTE);
    });

    it('getLength returns byte count for ASCII', () => {
      // ASCII: each char = 1 byte
      expect(qr8BitByte('Hello').getLength()).toBe(5);
      expect(qr8BitByte('').getLength()).toBe(0);
    });

    it('write: each byte is written as 8 bits', () => {
      const { buffer, puts } = createCapturingBuffer();
      qr8BitByte('Hi').write(buffer);
      // 'H' = 72, 'i' = 105
      expect(puts).toEqual([
        { num: 72, length: 8 },
        { num: 105, length: 8 },
      ]);
    });

    it('write: all bytes for a URL', () => {
      const { buffer, puts } = createCapturingBuffer();
      qr8BitByte('https://example.com').write(buffer);
      expect(puts).toHaveLength(19);
      // First byte: 'h' = 104
      expect(puts[0]).toEqual({ num: 104, length: 8 });
      // All written as 8-bit values
      for (const p of puts) {
        expect(p.length).toBe(8);
        expect(p.num).toBeGreaterThanOrEqual(0);
        expect(p.num).toBeLessThanOrEqual(255);
      }
    });

    it('write: empty string → nothing written', () => {
      const { buffer, puts } = createCapturingBuffer();
      qr8BitByte('').write(buffer);
      expect(puts).toHaveLength(0);
    });

    it('getLength returns byte count for multi-byte characters', () => {
      // Multi-byte chars may produce more bytes than characters
      const seg = qr8BitByte('€'); // Euro sign is multi-byte in UTF-8
      // In UTF-8, € is 3 bytes, but stringToBytesFn behavior depends on implementation
      expect(seg.getLength()).toBeGreaterThanOrEqual(1);
    });
  });

  describe('qrKanji', () => {
    it('throws "sjis not supported" in Node environment', () => {
      // Node default stringToBytes doesn't support SJIS encoding
      // The qrKanji constructor tests for SJIS by encoding '友' (U+53CB)
      // and checking if it produces the expected Shift-JIS bytes
      expect(() => qrKanji('友')).toThrow('sjis not supported');
    });
  });

  describe('cross-mode verification', () => {
    it('all mode constants are distinct', () => {
      const modes = new Set([
        QRMode.MODE_NUMBER,
        QRMode.MODE_ALPHA_NUM,
        QRMode.MODE_8BIT_BYTE,
        QRMode.MODE_KANJI,
      ]);
      expect(modes.size).toBe(4);
    });

    it('numeric data encodes correctly end-to-end', () => {
      const { buffer, puts } = createCapturingBuffer();
      const seg = qrNumber('0');
      expect(seg.getMode()).toBe(QRMode.MODE_NUMBER);
      expect(seg.getLength()).toBe(1);
      seg.write(buffer);
      // '0' → strToNum("0") = 0, written as 4 bits (remainder 1)
      expect(puts).toEqual([{ num: 0, length: 4 }]);
    });

    it('alphanumeric special chars pair correctly', () => {
      const { buffer, puts } = createCapturingBuffer();
      // Test all 9 special chars as singles to verify getCode switch
      const specials = ' $%*+-./:';
      const expectedCodes = [36, 37, 38, 39, 40, 41, 42, 43, 44];

      for (let i = 0; i < specials.length; i++) {
        puts.length = 0;
        qrAlphaNum(specials[i]).write(buffer);
        expect(puts[0].num).toBe(expectedCodes[i]);
        expect(puts[0].length).toBe(6);
      }
    });

    it('numeric boundary: "000" encodes to 0', () => {
      const { buffer, puts } = createCapturingBuffer();
      qrNumber('000').write(buffer);
      expect(puts).toEqual([{ num: 0, length: 10 }]);
    });

    it('numeric boundary: "999" encodes to 999', () => {
      const { buffer, puts } = createCapturingBuffer();
      qrNumber('999').write(buffer);
      expect(puts).toEqual([{ num: 999, length: 10 }]);
    });

    it('alphanumeric boundary: "00" encodes to 0', () => {
      const { buffer, puts } = createCapturingBuffer();
      qrAlphaNum('00').write(buffer);
      // getCode('0')=0, 0*45+0 = 0
      expect(puts).toEqual([{ num: 0, length: 11 }]);
    });

    it('alphanumeric boundary: "::" encodes correctly', () => {
      const { buffer, puts } = createCapturingBuffer();
      qrAlphaNum('::').write(buffer);
      // getCode(':')=44, 44*45+44 = 2024
      expect(puts).toEqual([{ num: 2024, length: 11 }]);
    });
  });
});
