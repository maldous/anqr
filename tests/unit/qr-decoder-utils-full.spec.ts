import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

// ======================== ARRAYS ========================

describe('Arrays utility class', () => {
  async function getArrays() {
    const mod = await import('../../src/modules/qr-decoder/util');
    return mod.Arrays;
  }

  it('fill fills Int32Array', async () => {
    const Arrays = await getArrays();
    const arr = new Int32Array(5);
    Arrays.fill(arr, 42);
    for (let i = 0; i < 5; i++) expect(arr[i]).toBe(42);
  });

  it('fill fills regular array', async () => {
    const Arrays = await getArrays();
    const arr = [0, 0, 0];
    Arrays.fill(arr, 7);
    expect(arr).toEqual([7, 7, 7]);
  });

  it('fill fills Uint8Array', async () => {
    const Arrays = await getArrays();
    const arr = new Uint8Array(3);
    Arrays.fill(arr, 255);
    expect(arr[0]).toBe(255);
    expect(arr[2]).toBe(255);
  });

  it('fillWithin fills range of Int32Array', async () => {
    const Arrays = await getArrays();
    const arr = new Int32Array(5);
    Arrays.fillWithin(arr, 1, 4, 99);
    expect(arr[0]).toBe(0);
    expect(arr[1]).toBe(99);
    expect(arr[2]).toBe(99);
    expect(arr[3]).toBe(99);
    expect(arr[4]).toBe(0);
  });

  it('asList creates array from args', async () => {
    const Arrays = await getArrays();
    const list = Arrays.asList(1, 2, 3);
    expect(list).toEqual([1, 2, 3]);
  });

  it('asList with strings', async () => {
    const Arrays = await getArrays();
    expect(Arrays.asList('a', 'b')).toEqual(['a', 'b']);
  });

  it('create makes 2D array', async () => {
    const Arrays = await getArrays();
    const arr = Arrays.create(2, 3, 0);
    expect(arr.length).toBe(2);
    expect(arr[0].length).toBe(3);
    expect(arr[1][2]).toBe(0);
  });

  it('create without default value', async () => {
    const Arrays = await getArrays();
    const arr = Arrays.create(2, 3);
    expect(arr.length).toBe(2);
    expect(arr[0].length).toBe(3);
  });

  it('createInt32Array makes 2D Int32Array', async () => {
    const Arrays = await getArrays();
    const arr = Arrays.createInt32Array(2, 3, 5);
    expect(arr.length).toBe(2);
    expect(arr[0] instanceof Int32Array).toBe(true);
    expect(arr[0].length).toBe(3);
    expect(arr[1][2]).toBe(5);
  });

  it('createInt32Array without default', async () => {
    const Arrays = await getArrays();
    const arr = Arrays.createInt32Array(2, 3);
    expect(arr[0][0]).toBe(0);
  });

  it('equals checks array equality', async () => {
    const Arrays = await getArrays();
    expect(Arrays.equals([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(Arrays.equals([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(Arrays.equals([1, 2], [1, 2, 3])).toBe(false);
  });

  it('equals returns false for null/empty', async () => {
    const Arrays = await getArrays();
    expect(Arrays.equals(null, [1])).toBe(false);
    expect(Arrays.equals([1], null)).toBe(false);
  });

  it('hashCode computes consistent hash', async () => {
    const Arrays = await getArrays();
    const h1 = Arrays.hashCode([1, 2, 3]);
    const h2 = Arrays.hashCode([1, 2, 3]);
    expect(h1).toBe(h2);
    expect(Arrays.hashCode([1, 2, 4])).not.toBe(h1);
  });

  it('hashCode returns 0 for null', async () => {
    const Arrays = await getArrays();
    expect(Arrays.hashCode(null)).toBe(0);
  });

  it('fillUint8Array fills Uint8Array', async () => {
    const Arrays = await getArrays();
    const arr = new Uint8Array(3);
    Arrays.fillUint8Array(arr, 128);
    expect(arr[0]).toBe(128);
    expect(arr[2]).toBe(128);
  });

  it('copyOf copies Int32Array to new length', async () => {
    const Arrays = await getArrays();
    const orig = Int32Array.from([1, 2, 3, 4, 5]);
    const shorter = Arrays.copyOf(orig, 3);
    expect(shorter.length).toBe(3);
    expect(shorter[0]).toBe(1);
    expect(shorter[2]).toBe(3);
  });

  it('copyOfUint8Array copies to larger', async () => {
    const Arrays = await getArrays();
    const orig = Uint8Array.from([10, 20, 30]);
    const larger = Arrays.copyOfUint8Array(orig, 5);
    expect(larger.length).toBe(5);
    expect(larger[0]).toBe(10);
    expect(larger[2]).toBe(30);
    expect(larger[3]).toBe(0);
  });

  it('copyOfUint8Array copies to smaller', async () => {
    const Arrays = await getArrays();
    const orig = Uint8Array.from([10, 20, 30]);
    const smaller = Arrays.copyOfUint8Array(orig, 2);
    expect(smaller.length).toBe(2);
    expect(smaller[0]).toBe(10);
    expect(smaller[1]).toBe(20);
  });

  it('copyOfRange copies subarray', async () => {
    const Arrays = await getArrays();
    const orig = Int32Array.from([10, 20, 30, 40, 50]);
    const sub = Arrays.copyOfRange(orig, 1, 4);
    expect(sub.length).toBe(3);
    expect(sub[0]).toBe(20);
    expect(sub[2]).toBe(40);
  });

  it('binarySearch finds element', async () => {
    const Arrays = await getArrays();
    const arr = Int32Array.from([10, 20, 30, 40, 50]);
    expect(Arrays.binarySearch(arr, 30)).toBe(2);
    expect(Arrays.binarySearch(arr, 10)).toBe(0);
    expect(Arrays.binarySearch(arr, 50)).toBe(4);
  });

  it('binarySearch returns negative for missing element', async () => {
    const Arrays = await getArrays();
    const arr = Int32Array.from([10, 20, 30, 40, 50]);
    const result = Arrays.binarySearch(arr, 25);
    expect(result).toBeLessThan(0);
  });

  it('binarySearch with custom comparator', async () => {
    const Arrays = await getArrays();
    const arr = Int32Array.from([50, 40, 30, 20, 10]); // reverse
    const result = Arrays.binarySearch(arr, 30, (a, b) => b - a);
    expect(result).toBe(2);
  });
});

// ======================== ARRAYCOPY ========================

describe('arraycopy', () => {
  it('copies forward between arrays', async () => {
    const { arraycopy } = await import('../../src/modules/qr-decoder/util');
    const src = [1, 2, 3, 4, 5];
    const dest = [0, 0, 0, 0, 0];
    arraycopy(src, 1, dest, 0, 3);
    expect(dest).toEqual([2, 3, 4, 0, 0]);
  });

  it('copies with overlap (backward)', async () => {
    const { arraycopy } = await import('../../src/modules/qr-decoder/util');
    const arr = [1, 2, 3, 4, 5];
    arraycopy(arr, 0, arr, 1, 4);
    expect(arr).toEqual([1, 1, 2, 3, 4]);
  });

  it('copies typed arrays', async () => {
    const { arraycopy } = await import('../../src/modules/qr-decoder/util');
    const src = Int32Array.from([10, 20, 30]);
    const dest = new Int32Array(5);
    arraycopy(src, 0, dest, 1, 3);
    expect(dest[0]).toBe(0);
    expect(dest[1]).toBe(10);
    expect(dest[3]).toBe(30);
  });
});

// ======================== INTEGER ========================

describe('Integer utility class', () => {
  async function getInteger() {
    const mod = await import('../../src/modules/qr-decoder/util');
    return mod.Integer;
  }

  it('numberOfTrailingZeros', async () => {
    const Integer = await getInteger();
    expect(Integer.numberOfTrailingZeros(0)).toBe(32);
    expect(Integer.numberOfTrailingZeros(1)).toBe(0);
    expect(Integer.numberOfTrailingZeros(2)).toBe(1);
    expect(Integer.numberOfTrailingZeros(4)).toBe(2);
    expect(Integer.numberOfTrailingZeros(8)).toBe(3);
    expect(Integer.numberOfTrailingZeros(0x80000000)).toBe(31);
  });

  it('numberOfLeadingZeros', async () => {
    const Integer = await getInteger();
    expect(Integer.numberOfLeadingZeros(0)).toBe(32);
    expect(Integer.numberOfLeadingZeros(1)).toBe(31);
    expect(Integer.numberOfLeadingZeros(0x80000000 >>> 0)).toBe(0);
    expect(Integer.numberOfLeadingZeros(0x40000000)).toBe(1);
  });

  it('toHexString', async () => {
    const Integer = await getInteger();
    expect(Integer.toHexString(255)).toBe('ff');
    expect(Integer.toHexString(0)).toBe('0');
    expect(Integer.toHexString(16)).toBe('10');
  });

  it('bitCount', async () => {
    const Integer = await getInteger();
    expect(Integer.bitCount(0)).toBe(0);
    expect(Integer.bitCount(1)).toBe(1);
    expect(Integer.bitCount(0b1111)).toBe(4);
    expect(Integer.bitCount(0b10101010)).toBe(4);
    expect(Integer.bitCount(0xffffffff >>> 0)).toBe(32);
  });

  it('truncDivision', async () => {
    const Integer = await getInteger();
    expect(Integer.truncDivision(7, 2)).toBe(3);
    expect(Integer.truncDivision(-7, 2)).toBe(-3);
    expect(Integer.truncDivision(10, 3)).toBe(3);
  });

  it('parseInt', async () => {
    const Integer = await getInteger();
    expect(Integer.parseInt('42')).toBe(42);
    expect(Integer.parseInt('ff', 16)).toBe(255);
    expect(Integer.parseInt('101', 2)).toBe(5);
  });

  it('constants', async () => {
    const Integer = await getInteger();
    expect(Integer.MIN_VALUE_32_BITS).toBe(-2147483648);
    expect(Integer.MAX_VALUE).toBe(Number.MAX_SAFE_INTEGER);
  });
});

// ======================== FLOAT ========================

describe('Float utility class', () => {
  it('floatToIntBits returns same value', async () => {
    const { Float } = await import('../../src/modules/qr-decoder/util');
    expect(Float.floatToIntBits(42.5)).toBe(42.5);
    expect(Float.MAX_VALUE).toBe(Number.MAX_SAFE_INTEGER);
  });
});

// ======================== LONG ========================

describe('Long utility class', () => {
  it('parseLong parses numbers', async () => {
    const { Long } = await import('../../src/modules/qr-decoder/util');
    expect(Long.parseLong('123')).toBe(123);
    expect(Long.parseLong('ff', 16)).toBe(255);
  });
});

// ======================== STRINGBUILDER ========================

describe('StringBuilder', () => {
  async function getSB() {
    const mod = await import('../../src/modules/qr-decoder/util');
    return mod.StringBuilder;
  }

  it('constructs empty', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder();
    expect(sb.toString()).toBe('');
    expect(sb.length()).toBe(0);
  });

  it('constructs with initial value', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder('hello');
    expect(sb.toString()).toBe('hello');
    expect(sb.length()).toBe(5);
  });

  it('append string', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder();
    sb.append('hello');
    sb.append(' ');
    sb.append('world');
    expect(sb.toString()).toBe('hello world');
  });

  it('append number (char code)', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder();
    sb.append(65); // 'A'
    sb.append(66); // 'B'
    expect(sb.toString()).toBe('AB');
  });

  it('appendChars appends from char array', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder();
    sb.appendChars(['a', 'b', 'c', 'd', 'e'], 1, 3);
    expect(sb.toString()).toBe('bcd');
  });

  it('charAt returns character', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder('abc');
    expect(sb.charAt(0)).toBe('a');
    expect(sb.charAt(2)).toBe('c');
  });

  it('deleteCharAt removes character', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder('abcd');
    sb.deleteCharAt(1);
    expect(sb.toString()).toBe('acd');
  });

  it('setCharAt replaces character', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder('abc');
    sb.setCharAt(1, 'X');
    expect(sb.toString()).toBe('aXc');
  });

  it('substring extracts range', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder('hello world');
    expect(sb.substring(0, 5)).toBe('hello');
    expect(sb.substring(6, 11)).toBe('world');
  });

  it('setLengthToZero clears content', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder('hello');
    sb.setLengthToZero();
    expect(sb.toString()).toBe('');
    expect(sb.length()).toBe(0);
  });

  it('insert inserts string at position', async () => {
    const StringBuilder = await getSB();
    const sb = new StringBuilder('ac');
    sb.insert(1, 'b');
    expect(sb.toString()).toBe('abc');
  });

  it('enableDecoding sets encoding for numeric append', async () => {
    const StringBuilder = await getSB();
    const { CharacterSetECI } = await import('../../src/modules/qr-decoder/util');
    const sb = new StringBuilder();
    sb.enableDecoding(CharacterSetECI.ISO8859_1);
    sb.append(65); // Should decode as ISO-8859-1 character
    expect(sb.length()).toBe(1);
  });
});

// ======================== CHARACTERSETECI ========================

describe('CharacterSetECI', () => {
  async function getECI() {
    const mod = await import('../../src/modules/qr-decoder/util');
    return mod.CharacterSetECI;
  }

  it('getName returns encoding name', async () => {
    const ECI = await getECI();
    expect(ECI.UTF8.getName()).toBe('UTF-8');
    expect(ECI.ISO8859_1.getName()).toBe('ISO-8859-1');
    expect(ECI.SJIS.getName()).toBe('SJIS');
    expect(ECI.ASCII.getName()).toBe('ASCII');
  });

  it('getValue returns first ECI value', async () => {
    const ECI = await getECI();
    expect(ECI.UTF8.getValue()).toBe(26);
    expect(ECI.ISO8859_1.getValue()).toBe(1);
    expect(ECI.Cp437.getValue()).toBe(0);
  });

  it('getCharacterSetECIByValue looks up by value', async () => {
    const ECI = await getECI();
    const utf8 = ECI.getCharacterSetECIByValue(26);
    expect(utf8).not.toBeNull();
    expect(utf8!.getName()).toBe('UTF-8');
    const iso = ECI.getCharacterSetECIByValue(1);
    expect(iso).not.toBeNull();
    expect(iso!.getName()).toBe('ISO-8859-1');
  });

  it('getCharacterSetECIByValue returns null for invalid', async () => {
    const ECI = await getECI();
    expect(ECI.getCharacterSetECIByValue(-1)).toBeNull();
    expect(ECI.getCharacterSetECIByValue(900)).toBeNull();
    expect(ECI.getCharacterSetECIByValue(999)).toBeNull();
  });

  it('getCharacterSetECIByName looks up by name', async () => {
    const ECI = await getECI();
    const utf8 = ECI.getCharacterSetECIByName('UTF-8');
    expect(utf8).not.toBeNull();
    expect(utf8!.getValue()).toBe(26);
    const sjis = ECI.getCharacterSetECIByName('Shift_JIS');
    expect(sjis).not.toBeNull();
    expect(sjis!.getName()).toBe('SJIS');
  });

  it('getCharacterSetECIByName returns null for unknown', async () => {
    const ECI = await getECI();
    expect(ECI.getCharacterSetECIByName('UNKNOWN')).toBeNull();
  });

  it('equals compares names', async () => {
    const ECI = await getECI();
    expect(ECI.UTF8.equals(ECI.UTF8)).toBe(true);
    expect(ECI.UTF8.equals(ECI.ISO8859_1)).toBe(false);
    expect(ECI.UTF8.equals(null as any)).toBe(false);
  });

  it('covers all ECI constants', async () => {
    const ECI = await getECI();
    const ecis = [
      ECI.Cp437, ECI.ISO8859_1, ECI.ISO8859_2, ECI.ISO8859_3,
      ECI.ISO8859_4, ECI.ISO8859_5, ECI.ISO8859_6, ECI.ISO8859_7,
      ECI.ISO8859_8, ECI.ISO8859_9, ECI.ISO8859_10, ECI.ISO8859_11,
      ECI.ISO8859_13, ECI.ISO8859_14, ECI.ISO8859_15, ECI.ISO8859_16,
      ECI.SJIS, ECI.Cp1250, ECI.Cp1251, ECI.Cp1252, ECI.Cp1256,
      ECI.UnicodeBigUnmarked, ECI.UTF8, ECI.ASCII, ECI.Big5,
      ECI.GB18030, ECI.EUC_KR,
    ];
    for (const eci of ecis) {
      expect(eci.getName().length).toBeGreaterThan(0);
      expect(typeof eci.getValue()).toBe('number');
    }
  });

  it('ASCII has dual ECI values', async () => {
    const ECI = await getECI();
    const v27 = ECI.getCharacterSetECIByValue(27);
    const v170 = ECI.getCharacterSetECIByValue(170);
    expect(v27).not.toBeNull();
    expect(v170).not.toBeNull();
    expect(v27!.getName()).toBe(v170!.getName());
  });
});

// ======================== STRINGENCODING ========================

describe('StringEncoding', () => {
  async function getSE() {
    const mod = await import('../../src/modules/qr-decoder/util');
    return mod.StringEncoding;
  }

  it('decode UTF-8 bytes', async () => {
    const SE = await getSE();
    const bytes = new TextEncoder().encode('Hello');
    const result = SE.decode(bytes, 'UTF-8');
    expect(result).toBe('Hello');
  });

  it('encode string to bytes', async () => {
    const SE = await getSE();
    const bytes = SE.encode('Hello', 'UTF-8');
    expect(bytes instanceof Uint8Array).toBe(true);
    expect(bytes.length).toBe(5);
  });

  it('encodingName handles string input', async () => {
    const SE = await getSE();
    expect(SE.encodingName('UTF-8')).toBe('UTF-8');
  });

  it('encodingName handles CharacterSetECI input', async () => {
    const SE = await getSE();
    const { CharacterSetECI } = await import('../../src/modules/qr-decoder/util');
    expect(SE.encodingName(CharacterSetECI.UTF8)).toBe('UTF-8');
  });

  it('encodingCharacterSet looks up by name string', async () => {
    const SE = await getSE();
    const result = SE.encodingCharacterSet('UTF-8');
    expect(result).not.toBeNull();
    expect(result!.getName()).toBe('UTF-8');
  });

  it('encodingCharacterSet passes through CharacterSetECI', async () => {
    const SE = await getSE();
    const { CharacterSetECI } = await import('../../src/modules/qr-decoder/util');
    const result = SE.encodingCharacterSet(CharacterSetECI.UTF8);
    expect(result).toBe(CharacterSetECI.UTF8);
  });

  it('decode with CharacterSetECI object', async () => {
    const SE = await getSE();
    const { CharacterSetECI } = await import('../../src/modules/qr-decoder/util');
    const bytes = new TextEncoder().encode('test');
    const result = SE.decode(bytes, CharacterSetECI.UTF8);
    expect(result).toBe('test');
  });

  it('customDecoder overrides default', async () => {
    const SE = await getSE();
    const original = SE.customDecoder;
    SE.customDecoder = (_bytes: Uint8Array, _enc: string) => 'custom';
    const bytes = new Uint8Array([65]);
    expect(SE.decode(bytes, 'UTF-8')).toBe('custom');
    SE.customDecoder = original;
  });

  it('customEncoder overrides default', async () => {
    const SE = await getSE();
    const original = SE.customEncoder;
    SE.customEncoder = (_s: string, _enc: string) => new Uint8Array([1, 2, 3]);
    const result = SE.encode('test', 'UTF-8');
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
    SE.customEncoder = original;
  });
});

// ======================== STRINGUTILS ========================

describe('StringUtils', () => {
  it('constants exist', async () => {
    const { StringUtils } = await import('../../src/modules/qr-decoder/util');
    expect(StringUtils.SHIFT_JIS).toBe('SJIS');
    expect(StringUtils.GB2312).toBe('GB2312');
  });

  it('guessEncoding returns UTF-8 for BOM', async () => {
    const { StringUtils } = await import('../../src/modules/qr-decoder/util');
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 65, 66, 67]);
    expect(StringUtils.guessEncoding(bytes)).toBe('UTF-8');
  });

  it('guessEncoding returns ISO-8859-1 for ASCII bytes', async () => {
    const { StringUtils } = await import('../../src/modules/qr-decoder/util');
    const bytes = new Uint8Array([65, 66, 67]); // ABC
    expect(StringUtils.guessEncoding(bytes)).toBe('ISO-8859-1');
  });

  it('guessEncoding returns UTF-8 for high bytes', async () => {
    const { StringUtils } = await import('../../src/modules/qr-decoder/util');
    const bytes = new Uint8Array([0xc3, 0xa9]); // é in UTF-8
    expect(StringUtils.guessEncoding(bytes)).toBe('UTF-8');
  });

  it('castAsNonUtf8Char converts byte to char', async () => {
    const { StringUtils, CharacterSetECI } = await import('../../src/modules/qr-decoder/util');
    const result = StringUtils.castAsNonUtf8Char(65, CharacterSetECI.ISO8859_1);
    expect(result).toBe('A');
  });
});

// ======================== CURRENTTIMEMILLIS ========================

describe('currentTimeMillis', () => {
  it('returns a timestamp', async () => {
    const { currentTimeMillis } = await import('../../src/modules/qr-decoder/util');
    const t1 = currentTimeMillis();
    expect(typeof t1).toBe('number');
    expect(t1).toBeGreaterThan(0);
  });
});

// ======================== POINT DISTANCE ========================

describe('pointDistance', () => {
  it('calculates distance if exported', async () => {
    const mod = await import('../../src/modules/qr-decoder/util');
    if ('pointDistance' in mod && typeof (mod as Record<string, unknown>).pointDistance === 'function') {
      const fn = (mod as Record<string, unknown>).pointDistance as (
        p1: { x: number; y: number },
        p2: { x: number; y: number }
      ) => number;
      expect(fn({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5, 5);
    }
  });
});

// ======================== EXCEPTIONS ========================

describe('Decoder Exceptions', () => {
  async function getExceptions() {
    return await import('../../src/modules/qr-decoder/exceptions');
  }

  it('DecoderException base class', async () => {
    const { DecoderException } = await getExceptions();
    const err = new DecoderException('test error');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('test error');
    expect(err.getKind()).toBe('DecoderException');
  });

  it('DecoderException without message', async () => {
    const { DecoderException } = await getExceptions();
    const err = new DecoderException();
    expect(err).toBeInstanceOf(Error);
  });

  it('NotFoundException', async () => {
    const { NotFoundException, DecoderException } = await getExceptions();
    const err = NotFoundException.getNotFoundInstance();
    expect(err).toBeInstanceOf(DecoderException);
    expect(err).toBeInstanceOf(NotFoundException);
    expect(err.getKind()).toBe('NotFoundException');
  });

  it('FormatException', async () => {
    const { FormatException, DecoderException } = await getExceptions();
    const err = FormatException.getFormatInstance();
    expect(err).toBeInstanceOf(DecoderException);
    expect(err).toBeInstanceOf(FormatException);
    expect(err.getKind()).toBe('FormatException');
  });

  it('ChecksumException', async () => {
    const { ChecksumException, DecoderException } = await getExceptions();
    const err = ChecksumException.getChecksumInstance();
    expect(err).toBeInstanceOf(DecoderException);
    expect(err.getKind()).toBe('ChecksumException');
  });

  it('IllegalArgumentException', async () => {
    const { IllegalArgumentException, DecoderException } = await getExceptions();
    const err = new IllegalArgumentException('bad arg');
    expect(err).toBeInstanceOf(DecoderException);
    expect(err.message).toBe('bad arg');
    expect(err.getKind()).toBe('IllegalArgumentException');
  });

  it('IllegalStateException', async () => {
    const { IllegalStateException, DecoderException } = await getExceptions();
    const err = new IllegalStateException('bad state');
    expect(err).toBeInstanceOf(DecoderException);
    expect(err.getKind()).toBe('IllegalStateException');
  });

  it('ArithmeticException', async () => {
    const { ArithmeticException, DecoderException } = await getExceptions();
    const err = new ArithmeticException('div by zero');
    expect(err).toBeInstanceOf(DecoderException);
    expect(err.getKind()).toBe('ArithmeticException');
  });

  it('ReedSolomonException', async () => {
    const { ReedSolomonException, DecoderException } = await getExceptions();
    const err = new ReedSolomonException('rs error');
    expect(err).toBeInstanceOf(DecoderException);
    expect(err.getKind()).toBe('ReedSolomonException');
  });

  it('UnsupportedOperationException', async () => {
    const { UnsupportedOperationException, DecoderException } = await getExceptions();
    const err = new UnsupportedOperationException('not supported');
    expect(err).toBeInstanceOf(DecoderException);
    expect(err.getKind()).toBe('UnsupportedOperationException');
  });

  it('ArrayIndexOutOfBoundsException with index', async () => {
    const { ArrayIndexOutOfBoundsException, DecoderException } = await getExceptions();
    const err = new ArrayIndexOutOfBoundsException(5);
    expect(err).toBeInstanceOf(DecoderException);
    expect(err.message).toBe('Index: 5');
    expect(err.getKind()).toBe('ArrayIndexOutOfBoundsException');
  });

  it('ArrayIndexOutOfBoundsException with string', async () => {
    const { ArrayIndexOutOfBoundsException } = await getExceptions();
    const err = new ArrayIndexOutOfBoundsException('custom message');
    expect(err.message).toBe('custom message');
  });

  it('ArrayIndexOutOfBoundsException without arg', async () => {
    const { ArrayIndexOutOfBoundsException } = await getExceptions();
    const err = new ArrayIndexOutOfBoundsException();
    expect(err).toBeInstanceOf(Error);
  });
});
