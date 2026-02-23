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

// ========== optimizeSegments ==========

describe('optimizeSegments', () => {
  it('returns empty array for empty string', async () => {
    const { optimizeSegments } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(optimizeSegments('')).toEqual([]);
  });

  it('returns numeric segment for 4+ digits', async () => {
    const { optimizeSegments } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = optimizeSegments('12345678');
    expect(result.length).toBe(1);
    expect(result[0].mode).toBe('numeric');
    expect(result[0].data).toBe('12345678');
  });

  it('falls to byte for short numeric run (< 4 digits)', async () => {
    const { optimizeSegments } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = optimizeSegments('abc');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].mode).toBe('byte');
  });

  it('returns alphanumeric segment for 6+ uppercase chars', async () => {
    const { optimizeSegments } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = optimizeSegments('ABCDEF');
    expect(result.length).toBe(1);
    expect(result[0].mode).toBe('alphanumeric');
    expect(result[0].data).toBe('ABCDEF');
  });

  it('falls to byte for short alphanumeric run (< 6)', async () => {
    const { optimizeSegments } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = optimizeSegments('AB');
    expect(result[0].mode).toBe('byte');
  });

  it('creates mixed segments for numeric + text', async () => {
    const { optimizeSegments } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = optimizeSegments('hello12345678world');
    // Should have byte + numeric + byte segments
    expect(result.length).toBeGreaterThanOrEqual(2);
    const modes = result.map((s) => s.mode);
    expect(modes).toContain('numeric');
    expect(modes).toContain('byte');
  });

  it('merges adjacent same-mode segments', async () => {
    const { optimizeSegments } = await import('../../src/modules/qr-encoder/encoder-api');
    // 'ab' is byte, 'cd' is byte → merged
    const result = optimizeSegments('abcd');
    expect(result.length).toBe(1);
    expect(result[0].mode).toBe('byte');
  });

  it('handles URL-like input with mixed modes', async () => {
    const { optimizeSegments } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = optimizeSegments('HTTPS://EXAMPLE.COM/12345678');
    // Should optimize the URL prefix as alphanumeric and numbers as numeric
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles lowercase alphanumeric as byte (not uppercase)', async () => {
    const { optimizeSegments } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = optimizeSegments('abcdef');
    // lowercase is not QR alphanumeric → byte
    expect(result[0].mode).toBe('byte');
  });
});

// ========== calculateSegmentBits ==========

describe('calculateSegmentBits', () => {
  it('calculates numeric bits for version < 10', async () => {
    const { calculateSegmentBits } = await import('../../src/modules/qr-encoder/encoder-api');
    // 6 digits: mode(4) + count(10) + floor(6/3)*10 = 4 + 10 + 20 = 34
    expect(calculateSegmentBits([{ data: '123456', mode: 'numeric' }], 1)).toBe(34);
  });

  it('calculates numeric bits with remainder 2', async () => {
    const { calculateSegmentBits } = await import('../../src/modules/qr-encoder/encoder-api');
    // 5 digits: mode(4) + count(10) + floor(5/3)*10 + 7 = 4 + 10 + 10 + 7 = 31
    expect(calculateSegmentBits([{ data: '12345', mode: 'numeric' }], 1)).toBe(31);
  });

  it('calculates numeric bits with remainder 1', async () => {
    const { calculateSegmentBits } = await import('../../src/modules/qr-encoder/encoder-api');
    // 4 digits: mode(4) + count(10) + floor(4/3)*10 + 4 = 4 + 10 + 10 + 4 = 28
    expect(calculateSegmentBits([{ data: '1234', mode: 'numeric' }], 1)).toBe(28);
  });

  it('calculates alphanumeric bits', async () => {
    const { calculateSegmentBits } = await import('../../src/modules/qr-encoder/encoder-api');
    // 5 chars: mode(4) + count(9) + floor(5/2)*11 + 6 = 4 + 9 + 22 + 6 = 41
    expect(calculateSegmentBits([{ data: 'ABCDE', mode: 'alphanumeric' }], 1)).toBe(41);
  });

  it('calculates alphanumeric bits even count', async () => {
    const { calculateSegmentBits } = await import('../../src/modules/qr-encoder/encoder-api');
    // 4 chars: mode(4) + count(9) + floor(4/2)*11 = 4 + 9 + 22 = 35
    expect(calculateSegmentBits([{ data: 'ABCD', mode: 'alphanumeric' }], 1)).toBe(35);
  });

  it('calculates byte bits', async () => {
    const { calculateSegmentBits } = await import('../../src/modules/qr-encoder/encoder-api');
    // 3 chars: mode(4) + count(8) + 3*8 = 4 + 8 + 24 = 36
    expect(calculateSegmentBits([{ data: 'abc', mode: 'byte' }], 1)).toBe(36);
  });

  it('calculates kanji bits', async () => {
    const { calculateSegmentBits } = await import('../../src/modules/qr-encoder/encoder-api');
    // 2 chars: mode(4) + count(8) + 2*13 = 4 + 8 + 26 = 38
    expect(calculateSegmentBits([{ data: 'ab', mode: 'kanji' }], 1)).toBe(38);
  });

  it('uses larger count indicator for version >= 10', async () => {
    const { calculateSegmentBits } = await import('../../src/modules/qr-encoder/encoder-api');
    // 3 digits v10: mode(4) + count(12) + 10 = 26
    const v10 = calculateSegmentBits([{ data: '123', mode: 'numeric' }], 10);
    // 3 digits v1:  mode(4) + count(10) + 10 = 24
    const v1 = calculateSegmentBits([{ data: '123', mode: 'numeric' }], 1);
    expect(v10).toBeGreaterThan(v1);
  });

  it('uses even larger count indicator for version >= 27', async () => {
    const { calculateSegmentBits } = await import('../../src/modules/qr-encoder/encoder-api');
    const v27 = calculateSegmentBits([{ data: '123', mode: 'numeric' }], 27);
    const v10 = calculateSegmentBits([{ data: '123', mode: 'numeric' }], 10);
    expect(v27).toBeGreaterThan(v10);
  });

  it('sums bits for multiple segments', async () => {
    const { calculateSegmentBits } = await import('../../src/modules/qr-encoder/encoder-api');
    const segs = [
      { data: '1234', mode: 'numeric' as const },
      { data: 'AB', mode: 'byte' as const },
    ];
    const total = calculateSegmentBits(segs, 1);
    const numericBits = calculateSegmentBits([segs[0]], 1);
    const byteBits = calculateSegmentBits([segs[1]], 1);
    expect(total).toBe(numericBits + byteBits);
  });
});

// ========== getCompatibleMode ==========

describe('getCompatibleMode', () => {
  it('auto-detects numeric', async () => {
    const { getCompatibleMode } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(getCompatibleMode('12345', 'auto')).toBe('numeric');
  });

  it('auto-detects alphanumeric', async () => {
    const { getCompatibleMode } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(getCompatibleMode('HELLO WORLD', 'auto')).toBe('alphanumeric');
  });

  it('auto-detects byte for lowercase', async () => {
    const { getCompatibleMode } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(getCompatibleMode('hello', 'auto')).toBe('byte');
  });

  it('validates numeric mode with valid content', async () => {
    const { getCompatibleMode } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(getCompatibleMode('12345', 'numeric')).toBe('numeric');
  });

  it('falls back to byte for numeric mode with non-numeric content', async () => {
    const { getCompatibleMode } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(getCompatibleMode('hello', 'numeric')).toBe('byte');
  });

  it('validates alphanumeric mode with valid content', async () => {
    const { getCompatibleMode } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(getCompatibleMode('HELLO', 'alphanumeric')).toBe('alphanumeric');
  });

  it('falls back to byte for alphanumeric mode with lowercase', async () => {
    const { getCompatibleMode } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(getCompatibleMode('hello', 'alphanumeric')).toBe('byte');
  });

  it('returns kanji for kanji mode', async () => {
    const { getCompatibleMode } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(getCompatibleMode('anything', 'kanji')).toBe('kanji');
  });

  it('returns byte for byte mode', async () => {
    const { getCompatibleMode } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(getCompatibleMode('anything', 'byte')).toBe('byte');
  });

  it('falls back to byte for unknown mode', async () => {
    const { getCompatibleMode } = await import('../../src/modules/qr-encoder/encoder-api');
    expect(getCompatibleMode('test', 'unknown')).toBe('byte');
  });
});

// ========== createQRInstance + generateQR ==========

describe('createQRInstance', () => {
  it('creates QR with default byte mode', async () => {
    const { createQRInstance } = await import('../../src/modules/qr-encoder/encoder-api');
    const qr = createQRInstance('Hello World', 'M');
    expect(qr.getModuleCount()).toBeGreaterThan(0);
  });

  it('creates QR with auto mode (triggers optimization)', async () => {
    const { createQRInstance } = await import('../../src/modules/qr-encoder/encoder-api');
    const qr = createQRInstance('HTTPS://EXAMPLE.COM/12345678', 'M', 0, { mode: 'auto' });
    expect(qr.getModuleCount()).toBeGreaterThan(0);
  });

  it('creates QR with mixed mode', async () => {
    const { createQRInstance } = await import('../../src/modules/qr-encoder/encoder-api');
    const qr = createQRInstance('HELLO12345678', 'M', 0, { mode: 'mixed' });
    expect(qr.getModuleCount()).toBeGreaterThan(0);
  });

  it('creates QR with explicit version', async () => {
    const { createQRInstance } = await import('../../src/modules/qr-encoder/encoder-api');
    const qr = createQRInstance('Test', 'M', 5);
    // v5 → module count = 5*4+17 = 37
    expect(qr.getModuleCount()).toBe(37);
  });

  it('creates QR with explicit mask pattern', async () => {
    const { createQRInstance } = await import('../../src/modules/qr-encoder/encoder-api');
    const qr = createQRInstance('Test', 'M', 0, { maskPattern: 3 });
    expect(qr.getModuleCount()).toBeGreaterThan(0);
  });

  it('creates QR with explicit numeric mode', async () => {
    const { createQRInstance } = await import('../../src/modules/qr-encoder/encoder-api');
    const qr = createQRInstance('12345', 'M', 0, { mode: 'numeric' });
    expect(qr.getModuleCount()).toBeGreaterThan(0);
  });
});

describe('createQRInstanceWithSegments', () => {
  it('creates QR with multiple segments', async () => {
    const { createQRInstanceWithSegments } =
      await import('../../src/modules/qr-encoder/encoder-api');
    const qr = createQRInstanceWithSegments(
      [
        { data: 'HELLO', mode: 'alphanumeric' },
        { data: '12345678', mode: 'numeric' },
      ],
      'M'
    );
    expect(qr.getModuleCount()).toBeGreaterThan(0);
  });

  it('creates QR with explicit version and mask', async () => {
    const { createQRInstanceWithSegments } =
      await import('../../src/modules/qr-encoder/encoder-api');
    const qr = createQRInstanceWithSegments([{ data: 'Test', mode: 'byte' }], 'L', 5, {
      maskPattern: 2,
    });
    expect(qr.getModuleCount()).toBe(37);
  });
});

describe('generateQR', () => {
  it('generates QR matrix with default options', async () => {
    const { generateQR } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = generateQR('Hello');
    expect(result.modules.length).toBe(result.size);
    expect(result.modules[0].length).toBe(result.size);
    expect(result.version).toBeGreaterThanOrEqual(1);
  });

  it('generates QR matrix with explicit version and ECC', async () => {
    const { generateQR } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = generateQR('Test', { version: 3, errorCorrectionLevel: 'H' });
    expect(result.version).toBe(3);
    expect(result.size).toBe(3 * 4 + 17); // 29
  });

  it('generates QR with mode option', async () => {
    const { generateQR } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = generateQR('12345', { mode: 'numeric' });
    expect(result.modules.length).toBeGreaterThan(0);
  });

  it('generates QR with mask pattern', async () => {
    const { generateQR } = await import('../../src/modules/qr-encoder/encoder-api');
    const result = generateQR('Test', { maskPattern: 5 });
    expect(result.modules.length).toBeGreaterThan(0);
  });
});

describe('calculateOptimalVersion', () => {
  it('returns small version for short text', async () => {
    const { calculateOptimalVersion } = await import('../../src/modules/qr-encoder/encoder-api');
    const version = calculateOptimalVersion('Hi', 'L');
    expect(version).toBe(1);
  });

  it('returns larger version for longer text', async () => {
    const { calculateOptimalVersion } = await import('../../src/modules/qr-encoder/encoder-api');
    const longText = 'A'.repeat(500);
    const version = calculateOptimalVersion(longText, 'H');
    expect(version).toBeGreaterThan(5);
  });

  it('uses M as default ECC level', async () => {
    const { calculateOptimalVersion } = await import('../../src/modules/qr-encoder/encoder-api');
    const version = calculateOptimalVersion('Hello World');
    expect(version).toBeGreaterThanOrEqual(1);
  });
});

// ========== Shift-JIS ==========

describe('createShiftJISEncoder', () => {
  it('encodes ASCII characters as single bytes', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    const bytes = encode('ABC');
    expect(bytes).toEqual([0x41, 0x42, 0x43]);
  });

  it('encodes half-width katakana as single bytes', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // U+FF61 (｡) → 0xA1
    const bytes = encode('\uFF61');
    expect(bytes).toEqual([0xa1]);
  });

  it('encodes hiragana as two bytes', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // U+3041 (ぁ) → Shift-JIS 0x829F
    const bytes = encode('\u3041');
    expect(bytes.length).toBe(2);
    expect(bytes[0]).toBe(0x82);
  });

  it('encodes katakana as two bytes', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // U+30A1 (ァ) → Shift-JIS 0x8340
    const bytes = encode('\u30A1');
    expect(bytes.length).toBe(2);
    expect(bytes[0]).toBe(0x83);
  });

  it('encodes fullwidth punctuation from map', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // U+3000 (ideographic space) → 0x8140
    const bytes = encode('\u3000');
    expect(bytes).toEqual([0x81, 0x40]);
  });

  it('encodes fullwidth ASCII digits', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // U+FF10 (０) is fullwidth 0 → 0x824F
    const bytes = encode('\uFF10');
    expect(bytes).toEqual([0x82, 0x4f]);
  });

  it('encodes fullwidth uppercase letters', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // U+FF21 (Ａ) → 0x8260
    const bytes = encode('\uFF21');
    expect(bytes).toEqual([0x82, 0x60]);
  });

  it('encodes fullwidth lowercase letters', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // U+FF41 (ａ) → 0x8281
    const bytes = encode('\uFF41');
    expect(bytes).toEqual([0x82, 0x81]);
  });

  it('encodes kanji from mapping table', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // U+4E00 (一) → 0x88EA
    const bytes = encode('\u4E00');
    expect(bytes).toEqual([0x88, 0xea]);
  });

  it('uses 0x3f replacement for unmapped characters', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // Thai character - not in Shift-JIS
    const bytes = encode('\u0E01');
    expect(bytes).toEqual([0x3f]);
  });

  it('handles surrogate pairs (emoji) with 0x3f', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // Emoji 😀 (U+1F600) - surrogate pair
    const bytes = encode('😀');
    expect(bytes).toEqual([0x3f]);
  });

  it('encodes mixed ASCII and Japanese text', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    const bytes = encode('A\u3042'); // 'A' + hiragana あ
    expect(bytes[0]).toBe(0x41); // ASCII 'A'
    expect(bytes.length).toBe(3); // 1 byte ASCII + 2 bytes hiragana
  });

  it('handles fullwidth exclamation mark', async () => {
    const { createShiftJISEncoder } = await import('../../src/modules/qr-encoder/shift-jis');
    const encode = createShiftJISEncoder();
    // U+FF01 (！) → offset 0, mapped to [0x81, 0x49]
    const bytes = encode('\uFF01');
    expect(bytes).toEqual([0x81, 0x49]);
  });
});

describe('canEncodeAsShiftJIS', () => {
  it('returns true for ASCII-only text', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('Hello World 123')).toBe(true);
  });

  it('returns true for hiragana text', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('\u3042\u3044\u3046')).toBe(true);
  });

  it('returns true for katakana text', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('\u30A1\u30A2')).toBe(true);
  });

  it('returns true for half-width katakana', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('\uFF61\uFF62')).toBe(true);
  });

  it('returns true for mapped kanji', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('\u4E00\u4E8C')).toBe(true);
  });

  it('returns true for fullwidth ASCII', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('\uFF21\uFF22')).toBe(true); // Ａ Ｂ
  });

  it('returns true for fullwidth punctuation in map', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('\u3000')).toBe(true); // ideographic space
  });

  it('returns false for unmapped character', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('\u0E01')).toBe(false); // Thai
  });

  it('returns false for emoji (surrogate pair)', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('😀')).toBe(false);
  });

  it('returns false for mixed with unmapped character', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('Hello\u0E01World')).toBe(false);
  });

  it('returns true for empty string', async () => {
    const { canEncodeAsShiftJIS } = await import('../../src/modules/qr-encoder/shift-jis');
    expect(canEncodeAsShiftJIS('')).toBe(true);
  });
});

// ========== qrcode encoder (basic coverage) ==========

describe('qrcode encoder', () => {
  it('creates and encodes a basic QR code', async () => {
    const { qrcode } = await import('../../src/modules/qr-encoder/encoder');
    const qr = qrcode(0, 'M');
    qr.addData('Hello');
    qr.make();
    expect(qr.getModuleCount()).toBeGreaterThan(0);
  });

  it('creates QR with explicit version', async () => {
    const { qrcode } = await import('../../src/modules/qr-encoder/encoder');
    const qr = qrcode(5, 'L');
    qr.addData('Test');
    qr.make();
    expect(qr.getModuleCount()).toBe(37);
  });

  it('isDark returns boolean for valid coordinates', async () => {
    const { qrcode } = await import('../../src/modules/qr-encoder/encoder');
    const qr = qrcode(1, 'L');
    qr.addData('Hi');
    qr.make();
    const mc = qr.getModuleCount();
    expect(typeof qr.isDark(0, 0)).toBe('boolean');
    expect(typeof qr.isDark(mc - 1, mc - 1)).toBe('boolean');
  });

  it('works with all ECC levels', async () => {
    const { qrcode } = await import('../../src/modules/qr-encoder/encoder');
    for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
      const qr = qrcode(0, ecc);
      qr.addData('Test');
      qr.make();
      expect(qr.getModuleCount()).toBeGreaterThan(0);
    }
  });

  it('handles numeric data', async () => {
    const { qrcode } = await import('../../src/modules/qr-encoder/encoder');
    const qr = qrcode(0, 'M');
    qr.addData('1234567890', 'Numeric');
    qr.make();
    expect(qr.getModuleCount()).toBeGreaterThan(0);
  });

  it('handles alphanumeric data', async () => {
    const { qrcode } = await import('../../src/modules/qr-encoder/encoder');
    const qr = qrcode(0, 'M');
    qr.addData('HELLO WORLD', 'Alphanumeric');
    qr.make();
    expect(qr.getModuleCount()).toBeGreaterThan(0);
  });
});
