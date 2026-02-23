import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// ========== output.ts ==========

describe('qr-encoder output', () => {
  describe('byteArrayOutputStream', () => {
    it('writes single bytes', async () => {
      const { byteArrayOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = byteArrayOutputStream();
      out.writeByte(0x41);
      out.writeByte(0x42);
      expect(out.toByteArray()).toEqual([0x41, 0x42]);
    });

    it('masks bytes to 8 bits', async () => {
      const { byteArrayOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = byteArrayOutputStream();
      out.writeByte(0x1ff);
      expect(out.toByteArray()).toEqual([0xff]);
    });

    it('writes shorts in little-endian', async () => {
      const { byteArrayOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = byteArrayOutputStream();
      out.writeShort(0x1234);
      expect(out.toByteArray()).toEqual([0x34, 0x12]);
    });

    it('writes byte arrays with offset and length', async () => {
      const { byteArrayOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = byteArrayOutputStream();
      out.writeBytes([10, 20, 30, 40, 50], 1, 3);
      expect(out.toByteArray()).toEqual([20, 30, 40]);
    });

    it('writes byte arrays without offset/length', async () => {
      const { byteArrayOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = byteArrayOutputStream();
      out.writeBytes([1, 2, 3]);
      expect(out.toByteArray()).toEqual([1, 2, 3]);
    });

    it('writes strings as ASCII bytes', async () => {
      const { byteArrayOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = byteArrayOutputStream();
      out.writeString('AB');
      expect(out.toByteArray()).toEqual([0x41, 0x42]);
    });

    it('toString produces bracket-delimited format', async () => {
      const { byteArrayOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = byteArrayOutputStream();
      out.writeByte(1);
      out.writeByte(2);
      expect(out.toString()).toBe('[1,2]');
    });

    it('toString handles empty stream', async () => {
      const { byteArrayOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = byteArrayOutputStream();
      expect(out.toString()).toBe('[]');
    });
  });

  describe('base64EncodeOutputStream', () => {
    it('encodes bytes to base64', async () => {
      const { base64EncodeOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = base64EncodeOutputStream();
      // Encode "Man" -> "TWFu"
      out.writeByte(0x4d); // M
      out.writeByte(0x61); // a
      out.writeByte(0x6e); // n
      out.flush();
      expect(out.toString()).toBe('TWFu');
    });

    it('pads correctly for 1 byte', async () => {
      const { base64EncodeOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = base64EncodeOutputStream();
      out.writeByte(0x4d); // M
      out.flush();
      expect(out.toString()).toBe('TQ==');
    });

    it('pads correctly for 2 bytes', async () => {
      const { base64EncodeOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = base64EncodeOutputStream();
      out.writeByte(0x4d); // M
      out.writeByte(0x61); // a
      out.flush();
      expect(out.toString()).toBe('TWE=');
    });

    it('handles empty input', async () => {
      const { base64EncodeOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = base64EncodeOutputStream();
      out.flush();
      expect(out.toString()).toBe('');
    });

    it('handles various byte values including edge chars', async () => {
      const { base64EncodeOutputStream } = await import('../../src/modules/qr-encoder/output');
      const out = base64EncodeOutputStream();
      // Write bytes that exercise all base64 char ranges
      for (let i = 0; i < 6; i++) {
        out.writeByte(i * 40);
      }
      out.flush();
      const result = out.toString();
      expect(result.length).toBeGreaterThan(0);
      expect(/^[A-Za-z0-9+/=]+$/.test(result)).toBe(true);
    });
  });

  describe('gifImage', () => {
    it('creates a valid GIF data structure', async () => {
      const { gifImage, byteArrayOutputStream } =
        await import('../../src/modules/qr-encoder/output');
      const gif = gifImage(2, 2);
      gif.setPixel(0, 0, 0); // black
      gif.setPixel(1, 0, 1); // white
      gif.setPixel(0, 1, 1); // white
      gif.setPixel(1, 1, 0); // black

      const out = byteArrayOutputStream();
      gif.write(out);
      const bytes = out.toByteArray();
      expect(bytes.length).toBeGreaterThan(0);
      // GIF87a header
      expect(String.fromCharCode(...bytes.slice(0, 6))).toBe('GIF87a');
      // GIF terminator
      expect(String.fromCharCode(bytes[bytes.length - 1])).toBe(';');
    });

    it('handles larger images', async () => {
      const { gifImage, byteArrayOutputStream } =
        await import('../../src/modules/qr-encoder/output');
      const gif = gifImage(8, 8);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          gif.setPixel(x, y, (x + y) % 2);
        }
      }
      const out = byteArrayOutputStream();
      gif.write(out);
      const bytes = out.toByteArray();
      expect(bytes.length).toBeGreaterThan(6);
    });
  });

  describe('createDataURL', () => {
    it('creates a valid data URL', async () => {
      const { createDataURL } = await import('../../src/modules/qr-encoder/output');
      const url = createDataURL(2, 2, (x, y) => (x + y) % 2);
      expect(url).toMatch(/^data:image\/gif;base64,/);
      const base64Part = url.replace('data:image/gif;base64,', '');
      expect(base64Part.length).toBeGreaterThan(0);
      expect(/^[A-Za-z0-9+/=]+$/.test(base64Part)).toBe(true);
    });

    it('produces different output for different pixel patterns', async () => {
      const { createDataURL } = await import('../../src/modules/qr-encoder/output');
      const allBlack = createDataURL(2, 2, () => 0);
      const allWhite = createDataURL(2, 2, () => 1);
      expect(allBlack).not.toBe(allWhite);
    });
  });
});

// ========== string-bytes.ts ==========

describe('qr-encoder string-bytes', () => {
  afterEach(async () => {
    const mod = await import('../../src/modules/qr-encoder/string-bytes');
    mod.resetStringToBytes();
  });

  describe('stringToBytes', () => {
    it('converts ASCII string to bytes', async () => {
      const { stringToBytes } = await import('../../src/modules/qr-encoder/string-bytes');
      expect(stringToBytes('ABC')).toEqual([0x41, 0x42, 0x43]);
    });

    it('masks to lower 8 bits', async () => {
      const { stringToBytes } = await import('../../src/modules/qr-encoder/string-bytes');
      const result = stringToBytes('\u00ff');
      expect(result).toEqual([0xff]);
    });

    it('handles empty string', async () => {
      const { stringToBytes } = await import('../../src/modules/qr-encoder/string-bytes');
      expect(stringToBytes('')).toEqual([]);
    });
  });

  describe('stringToBytesFn', () => {
    it('uses the current encoder function', async () => {
      const { stringToBytesFn } = await import('../../src/modules/qr-encoder/string-bytes');
      const result = stringToBytesFn('Hi');
      expect(result).toEqual([0x48, 0x69]);
    });
  });

  describe('getStringToBytes / setStringToBytes / resetStringToBytes', () => {
    it('gets the current function', async () => {
      const { getStringToBytes } = await import('../../src/modules/qr-encoder/string-bytes');
      const fn = getStringToBytes();
      expect(typeof fn).toBe('function');
      expect(fn('A')).toEqual([0x41]);
    });

    it('sets a custom function', async () => {
      const { setStringToBytes, stringToBytesFn } =
        await import('../../src/modules/qr-encoder/string-bytes');
      setStringToBytes(() => [99, 100]);
      expect(stringToBytesFn('anything')).toEqual([99, 100]);
    });

    it('resets to default function', async () => {
      const { setStringToBytes, resetStringToBytes, stringToBytesFn } =
        await import('../../src/modules/qr-encoder/string-bytes');
      setStringToBytes(() => [1, 2, 3]);
      expect(stringToBytesFn('x')).toEqual([1, 2, 3]);
      resetStringToBytes();
      expect(stringToBytesFn('A')).toEqual([0x41]);
    });
  });

  describe('createStringToBytes', () => {
    it('creates encoder from unicode data', async () => {
      const { createStringToBytes } = await import('../../src/modules/qr-encoder/string-bytes');
      // Create a minimal unicode mapping: Unicode 0x3041 -> bytes 0x829F (hiragana ぁ -> Shift-JIS)
      // Format: [16bit Unicode][16bit Bytes] base64 encoded
      // 0x3041 = 0x30,0x41 and 0x829F = 0x82,0x9F
      // So bytes: [0x30, 0x41, 0x82, 0x9F]
      // Base64 of [0x30, 0x41, 0x82, 0x9F] = "MEGCAJ+f" hmm let me calculate manually
      // Actually the base64DecodeInputStream reads from a base64 string
      // Let's encode [0x30, 0x41, 0x82, 0x9F] to base64
      // Using btoa equivalent:
      const bytes = [0x30, 0x41, 0x82, 0x9f];
      const b64 = btoa(String.fromCharCode(...bytes));

      const encoder = createStringToBytes(b64, 1);
      // ASCII should pass through
      expect(encoder('A')).toEqual([0x41]);
      // The mapped character should produce 2 bytes
      const result = encoder('\u3041');
      expect(result).toEqual([0x82, 0x9f]);
    });

    it('uses ? for unmapped characters', async () => {
      const { createStringToBytes } = await import('../../src/modules/qr-encoder/string-bytes');
      // Create encoder with just one mapping
      const bytes = [0x30, 0x41, 0x82, 0x9f];
      const b64 = btoa(String.fromCharCode(...bytes));
      const encoder = createStringToBytes(b64, 1);
      // Unmapped unicode char should produce '?'
      const result = encoder('\u4e00'); // Chinese character not in map
      expect(result).toEqual(['?'.charCodeAt(0)]);
    });

    it('throws on count mismatch', async () => {
      const { createStringToBytes } = await import('../../src/modules/qr-encoder/string-bytes');
      const bytes = [0x30, 0x41, 0x82, 0x9f];
      const b64 = btoa(String.fromCharCode(...bytes));
      expect(() => createStringToBytes(b64, 2)).toThrow('1 != 2');
    });

    it('handles single-byte mappings', async () => {
      const { createStringToBytes } = await import('../../src/modules/qr-encoder/string-bytes');
      // Map Unicode 0xFF61 -> byte 0x00A1 (single byte: high byte is 0)
      const bytes = [0xff, 0x61, 0x00, 0xa1];
      const b64 = btoa(String.fromCharCode(...bytes));
      const encoder = createStringToBytes(b64, 1);
      const result = encoder('\uFF61');
      expect(result).toEqual([0xa1]);
    });
  });
});

// ========== data-modes.ts ==========

describe('qr-encoder data-modes', () => {
  // Mock QRBitBuffer to record put() calls
  function createMockBuffer(): {
    put: (num: number, length: number) => void;
    calls: Array<{ num: number; length: number }>;
  } {
    const calls: Array<{ num: number; length: number }> = [];
    return {
      put: (num: number, length: number) => {
        calls.push({ num, length });
      },
      calls,
    };
  }

  describe('qrNumber', () => {
    it('returns correct mode and length', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrNumber('12345');
      expect(segment.getMode()).toBe(1); // QRMode.MODE_NUMBER = 1 << 0
      expect(segment.getLength()).toBe(5);
    });

    it('encodes groups of 3 digits as 10-bit', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrNumber('123');
      const buf = createMockBuffer();
      segment.write(buf as never);
      // 123 -> 10 bits
      expect(buf.calls).toEqual([{ num: 123, length: 10 }]);
    });

    it('encodes remainder of 2 digits as 7-bit', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrNumber('12345');
      const buf = createMockBuffer();
      segment.write(buf as never);
      // 123 -> 10 bits, 45 -> 7 bits
      expect(buf.calls).toEqual([
        { num: 123, length: 10 },
        { num: 45, length: 7 },
      ]);
    });

    it('encodes remainder of 1 digit as 4-bit', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrNumber('1234');
      const buf = createMockBuffer();
      segment.write(buf as never);
      // 123 -> 10 bits, 4 -> 4 bits
      expect(buf.calls).toEqual([
        { num: 123, length: 10 },
        { num: 4, length: 4 },
      ]);
    });

    it('encodes single digit', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrNumber('7');
      const buf = createMockBuffer();
      segment.write(buf as never);
      expect(buf.calls).toEqual([{ num: 7, length: 4 }]);
    });

    it('encodes two digits', async () => {
      const { qrNumber } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrNumber('42');
      const buf = createMockBuffer();
      segment.write(buf as never);
      expect(buf.calls).toEqual([{ num: 42, length: 7 }]);
    });
  });

  describe('qrAlphaNum', () => {
    it('returns correct mode and length', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrAlphaNum('AB');
      expect(segment.getMode()).toBe(2); // QRMode.MODE_ALPHA_NUM = 1 << 1
      expect(segment.getLength()).toBe(2);
    });

    it('encodes pairs of chars as 11-bit', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrAlphaNum('AB');
      const buf = createMockBuffer();
      segment.write(buf as never);
      // A=10, B=11 -> 10*45+11 = 461
      expect(buf.calls).toEqual([{ num: 461, length: 11 }]);
    });

    it('encodes odd char as 6-bit', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrAlphaNum('ABC');
      const buf = createMockBuffer();
      segment.write(buf as never);
      // AB -> 11 bits, C=12 -> 6 bits
      expect(buf.calls).toEqual([
        { num: 461, length: 11 },
        { num: 12, length: 6 },
      ]);
    });

    it('handles digits', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrAlphaNum('01');
      const buf = createMockBuffer();
      segment.write(buf as never);
      // 0=0, 1=1 -> 0*45+1 = 1
      expect(buf.calls).toEqual([{ num: 1, length: 11 }]);
    });

    it('handles special characters', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      // Space=36, $=37, %=38, *=39, +=40, -=41, .=42, /=43, :=44
      const segment = qrAlphaNum(' $');
      const buf = createMockBuffer();
      segment.write(buf as never);
      expect(buf.calls).toEqual([{ num: 36 * 45 + 37, length: 11 }]);
    });

    it('throws for invalid characters', async () => {
      const { qrAlphaNum } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qrAlphaNum('a'); // lowercase not valid in alphanumeric
      const buf = createMockBuffer();
      expect(() => segment.write(buf as never)).toThrow('illegal char');
    });
  });

  describe('qr8BitByte', () => {
    it('returns correct mode and length', async () => {
      const { qr8BitByte } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qr8BitByte('Hello');
      expect(segment.getMode()).toBe(4); // QRMode.MODE_8BIT_BYTE = 1 << 2
      expect(segment.getLength()).toBe(5);
    });

    it('writes each byte as 8-bit', async () => {
      const { qr8BitByte } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qr8BitByte('AB');
      const buf = createMockBuffer();
      segment.write(buf as never);
      expect(buf.calls).toEqual([
        { num: 0x41, length: 8 },
        { num: 0x42, length: 8 },
      ]);
    });

    it('handles empty string', async () => {
      const { qr8BitByte } = await import('../../src/modules/qr-encoder/data-modes');
      const segment = qr8BitByte('');
      expect(segment.getLength()).toBe(0);
      const buf = createMockBuffer();
      segment.write(buf as never);
      expect(buf.calls).toEqual([]);
    });
  });
});
