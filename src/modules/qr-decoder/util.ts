/**
 * QR Decoder Utilities
 * Native JavaScript implementations replacing Java utility classes
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DECODER');

/**
 * Array utility functions
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class Arrays {
  /**
   * Fill array with a value
   */
  static fill(a: Int32Array | Uint8Array | any[], val: number): void {
    for (let i = 0; i < a.length; i++) {
      a[i] = val;
    }
  }

  /**
   * Fill array range with a value
   */
  static fillWithin(a: Int32Array, fromIndex: number, toIndex: number, val: number): void {
    for (let i = fromIndex; i < toIndex; i++) {
      a[i] = val;
    }
  }

  /**
   * Create a list from arguments
   */
  static asList<T>(...args: T[]): T[] {
    return args;
  }

  /**
   * Create a 2D array
   */
  static create<T>(rows: number, cols: number, value?: T): T[][] {
    return Array.from({ length: rows }, () => Array.from({ length: cols }).fill(value) as T[]);
  }

  /**
   * Create a 2D Int32Array
   */
  static createInt32Array(rows: number, cols: number, value?: number): Int32Array[] {
    return Array.from({ length: rows }, () => {
      const arr = new Int32Array(cols);
      if (value !== undefined) arr.fill(value);
      return arr;
    });
  }

  /**
   * Check array equality
   */
  static equals(first: any, second: any): boolean {
    if (!(first && second)) return false;
    if (!(first.length && second.length)) return false;
    if (first.length !== second.length) return false;
    for (let i = 0; i < first.length; i++) {
      if (first[i] !== second[i]) return false;
    }
    return true;
  }

  /**
   * Compute hash code for array
   */
  static hashCode(a: any): number {
    if (a === null) return 0;
    let result = 1;
    for (const element of a) {
      result = 31 * result + element;
    }
    return result;
  }

  /**
   * Fill Uint8Array with value
   */
  static fillUint8Array(a: Uint8Array, value: number): void {
    for (let i = 0; i < a.length; i++) {
      a[i] = value;
    }
  }

  /**
   * Copy array to new length
   */
  static copyOf(original: Int32Array, newLength: number): Int32Array {
    return original.slice(0, newLength);
  }

  /**
   * Copy Uint8Array to new length
   */
  static copyOfUint8Array(original: Uint8Array, newLength: number): Uint8Array {
    if (original.length <= newLength) {
      const newArray = new Uint8Array(newLength);
      newArray.set(original);
      return newArray;
    }
    return original.slice(0, newLength);
  }

  /**
   * Copy range of array
   */
  static copyOfRange(original: Int32Array, from: number, to: number): Int32Array {
    const newLength = to - from;
    const copy = new Int32Array(newLength);
    arraycopy(original, from, copy, 0, newLength);
    return copy;
  }

  /**
   * Binary search in sorted array
   */
  static binarySearch(
    ar: Int32Array,
    el: number,
    comparator?: (a: number, b: number) => number
  ): number {
    if (comparator === undefined) {
      comparator = (a, b) => a - b;
    }
    let m = 0;
    let n = ar.length - 1;
    while (m <= n) {
      const k = (n + m) >> 1;
      const cmp = comparator(el, ar[k]);
      if (cmp > 0) {
        m = k + 1;
      } else if (cmp < 0) {
        n = k - 1;
      } else {
        return k;
      }
    }
    return -m - 1;
  }
}

/**
 * Copy array elements (like System.arraycopy in Java)
 */
export function arraycopy(
  src: any,
  srcPos: number,
  dest: any,
  destPos: number,
  length: number
): void {
  if (src === dest && srcPos < destPos) {
    // Copy backwards to avoid overwriting
    destPos += length - 1;
    srcPos += length - 1;
    while (length--) {
      dest[destPos--] = src[srcPos--];
    }
  } else {
    while (length--) {
      dest[destPos++] = src[srcPos++];
    }
  }
}

/**
 * Integer utility functions
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class Integer {
  static readonly MIN_VALUE_32_BITS = -2147483648;
  static readonly MAX_VALUE = Number.MAX_SAFE_INTEGER;

  /**
   * Count trailing zeros
   */
  static numberOfTrailingZeros(i: number): number {
    if (i === 0) return 32;
    let n = 31;
    let y = i << 16;
    if (y !== 0) {
      n -= 16;
      i = y;
    }
    y = i << 8;
    if (y !== 0) {
      n -= 8;
      i = y;
    }
    y = i << 4;
    if (y !== 0) {
      n -= 4;
      i = y;
    }
    y = i << 2;
    if (y !== 0) {
      n -= 2;
      i = y;
    }
    return n - ((i << 1) >>> 31);
  }

  /**
   * Count leading zeros
   */
  static numberOfLeadingZeros(i: number): number {
    if (i === 0) return 32;
    let n = 1;
    if (i >>> 16 === 0) {
      n += 16;
      i <<= 16;
    }
    if (i >>> 24 === 0) {
      n += 8;
      i <<= 8;
    }
    if (i >>> 28 === 0) {
      n += 4;
      i <<= 4;
    }
    if (i >>> 30 === 0) {
      n += 2;
      i <<= 2;
    }
    n -= i >>> 31;
    return n;
  }

  /**
   * Convert to hex string
   */
  static toHexString(i: number): string {
    return i.toString(16);
  }

  /**
   * Count set bits (population count)
   */
  static bitCount(i: number): number {
    i = i - ((i >>> 1) & 0x55555555);
    i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
    i = (i + (i >>> 4)) & 0x0f0f0f0f;
    i = i + (i >>> 8);
    i = i + (i >>> 16);
    return i & 0x3f;
  }

  /**
   * Truncated integer division
   */
  static truncDivision(dividend: number, divisor: number): number {
    return Math.trunc(dividend / divisor);
  }

  /**
   * Parse integer
   */
  static parseInt(num: string, radix?: number): number {
    return Number.parseInt(num, radix);
  }
}

/**
 * Float utility functions
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class Float {
  static readonly MAX_VALUE = Number.MAX_SAFE_INTEGER;

  static floatToIntBits(f: number): number {
    return f;
  }
}

/**
 * Long utility functions
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class Long {
  static parseLong(num: string, radix?: number): number {
    return Number.parseInt(num, radix);
  }
}

/**
 * StringBuilder for string building operations
 */
export class StringBuilder {
  private value: string;
  private encoding: CharacterSetECI | null = null;

  constructor(value: string = '') {
    this.value = value;
  }

  enableDecoding(encoding: CharacterSetECI): this {
    this.encoding = encoding;
    return this;
  }

  append(s: string | number): this {
    if (typeof s === 'string') {
      this.value += s;
    } else if (this.encoding) {
      this.value += StringUtils.castAsNonUtf8Char(s, this.encoding);
    } else {
      this.value += String.fromCodePoint(s);
    }
    return this;
  }

  appendChars(str: string[], offset: number, len: number): this {
    for (let i = offset; i < offset + len; i++) {
      this.append(str[i]);
    }
    return this;
  }

  length(): number {
    return this.value.length;
  }

  charAt(n: number): string {
    return this.value.charAt(n);
  }

  deleteCharAt(n: number): void {
    this.value = this.value.substring(0, n) + this.value.substring(n + 1);
  }

  setCharAt(n: number, c: string): void {
    this.value = this.value.substring(0, n) + c + this.value.substring(n + 1);
  }

  substring(start: number, end: number): string {
    return this.value.substring(start, end);
  }

  setLengthToZero(): void {
    this.value = '';
  }

  toString(): string {
    return this.value;
  }

  insert(n: number, c: string): void {
    this.value = this.value.substring(0, n) + c + this.value.substring(n);
  }
}

/**
 * Character set ECI (Extended Channel Interpretation)
 */
export class CharacterSetECI {
  private static readonly VALUE_TO_ECI = new Map<number, CharacterSetECI>();
  private static readonly NAME_TO_ECI = new Map<string, CharacterSetECI>();

  static readonly Cp437 = new CharacterSetECI([0, 2], 'Cp437');
  static readonly ISO8859_1 = new CharacterSetECI([1, 3], 'ISO-8859-1', 'ISO8859_1');
  static readonly ISO8859_2 = new CharacterSetECI([4], 'ISO-8859-2', 'ISO8859_2');
  static readonly ISO8859_3 = new CharacterSetECI([5], 'ISO-8859-3', 'ISO8859_3');
  static readonly ISO8859_4 = new CharacterSetECI([6], 'ISO-8859-4', 'ISO8859_4');
  static readonly ISO8859_5 = new CharacterSetECI([7], 'ISO-8859-5', 'ISO8859_5');
  static readonly ISO8859_6 = new CharacterSetECI([8], 'ISO-8859-6', 'ISO8859_6');
  static readonly ISO8859_7 = new CharacterSetECI([9], 'ISO-8859-7', 'ISO8859_7');
  static readonly ISO8859_8 = new CharacterSetECI([10], 'ISO-8859-8', 'ISO8859_8');
  static readonly ISO8859_9 = new CharacterSetECI([11], 'ISO-8859-9', 'ISO8859_9');
  static readonly ISO8859_10 = new CharacterSetECI([12], 'ISO-8859-10', 'ISO8859_10');
  static readonly ISO8859_11 = new CharacterSetECI([13], 'ISO-8859-11', 'ISO8859_11');
  static readonly ISO8859_13 = new CharacterSetECI([15], 'ISO-8859-13', 'ISO8859_13');
  static readonly ISO8859_14 = new CharacterSetECI([16], 'ISO-8859-14', 'ISO8859_14');
  static readonly ISO8859_15 = new CharacterSetECI([17], 'ISO-8859-15', 'ISO8859_15');
  static readonly ISO8859_16 = new CharacterSetECI([18], 'ISO-8859-16', 'ISO8859_16');
  static readonly SJIS = new CharacterSetECI([20], 'SJIS', 'Shift_JIS');
  static readonly Cp1250 = new CharacterSetECI([21], 'Cp1250', 'windows-1250');
  static readonly Cp1251 = new CharacterSetECI([22], 'Cp1251', 'windows-1251');
  static readonly Cp1252 = new CharacterSetECI([23], 'Cp1252', 'windows-1252');
  static readonly Cp1256 = new CharacterSetECI([24], 'Cp1256', 'windows-1256');
  static readonly UnicodeBigUnmarked = new CharacterSetECI(
    [25],
    'UnicodeBigUnmarked',
    'UTF-16BE',
    'UnicodeBig'
  );
  static readonly UTF8 = new CharacterSetECI([26], 'UTF-8', 'UTF8');
  static readonly ASCII = new CharacterSetECI([27, 170], 'ASCII', 'US-ASCII');
  static readonly Big5 = new CharacterSetECI([28], 'Big5');
  static readonly GB18030 = new CharacterSetECI([29], 'GB18030', 'GB2312', 'EUC_CN', 'GBK');
  static readonly EUC_KR = new CharacterSetECI([30], 'EUC-KR', 'EUC_KR');

  private constructor(
    private readonly values: number[],
    private readonly name: string,
    ...otherNames: string[]
  ) {
    for (const value of values) {
      CharacterSetECI.VALUE_TO_ECI.set(value, this);
    }
    CharacterSetECI.NAME_TO_ECI.set(name, this);
    for (const otherName of otherNames) {
      CharacterSetECI.NAME_TO_ECI.set(otherName, this);
    }
  }

  getName(): string {
    return this.name;
  }

  getValue(): number {
    return this.values[0];
  }

  equals(other: CharacterSetECI): boolean {
    if (!other) return false;
    return this.name === other.name;
  }

  static getCharacterSetECIByValue(value: number): CharacterSetECI | null {
    if (value < 0 || value >= 900) return null;
    return CharacterSetECI.VALUE_TO_ECI.get(value) || null;
  }

  static getCharacterSetECIByName(name: string): CharacterSetECI | null {
    return CharacterSetECI.NAME_TO_ECI.get(name) || null;
  }
}

/**
 * String encoding/decoding utilities
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class StringEncoding {
  static readonly customDecoder: ((bytes: Uint8Array, encodingName: string) => string) | null =
    null;
  static readonly customEncoder: ((s: string, encodingName: string) => Uint8Array) | null = null;

  static decode(bytes: Uint8Array, encoding: string | CharacterSetECI): string {
    const encodingName = StringEncoding.encodingName(encoding);

    if (StringEncoding.customDecoder) {
      return StringEncoding.customDecoder(bytes, encodingName);
    }

    if (typeof TextDecoder === 'undefined' || StringEncoding.shouldDecodeOnFallback(encodingName)) {
      return StringEncoding.decodeFallback(bytes, encodingName);
    }

    return new TextDecoder(encodingName).decode(bytes);
  }

  private static shouldDecodeOnFallback(encodingName: string): boolean {
    return !StringEncoding.isBrowser() && encodingName === 'ISO-8859-1';
  }

  static encode(s: string, encoding: string | CharacterSetECI): Uint8Array {
    const encodingName = StringEncoding.encodingName(encoding);

    if (StringEncoding.customEncoder) {
      return StringEncoding.customEncoder(s, encodingName);
    }

    if (typeof TextEncoder === 'undefined') {
      return StringEncoding.encodeFallback(s);
    }

    return new TextEncoder().encode(s);
  }

  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && {}.toString.call(window) === '[object Window]';
  }

  static encodingName(encoding: string | CharacterSetECI): string {
    return typeof encoding === 'string' ? encoding : encoding.getName();
  }

  static encodingCharacterSet(encoding: string | CharacterSetECI): CharacterSetECI | null {
    if (encoding instanceof CharacterSetECI) {
      return encoding;
    }
    return CharacterSetECI.getCharacterSetECIByName(encoding);
  }

  private static decodeFallback(bytes: Uint8Array, encoding: string | CharacterSetECI): string {
    const characterSet = StringEncoding.encodingCharacterSet(encoding);

    if (characterSet && StringEncoding.isDecodeFallbackSupported(characterSet)) {
      let s = '';
      for (let i = 0; i < bytes.length; i++) {
        let h = bytes[i].toString(16);
        if (h.length < 2) h = `0${h}`;
        s += `%${h}`;
      }
      return decodeURIComponent(s);
    }

    if (characterSet?.equals(CharacterSetECI.UnicodeBigUnmarked)) {
      return String.fromCharCode.apply(null, Array.from(new Uint16Array(bytes.buffer)));
    }

    throw new Error(`Encoding ${StringEncoding.encodingName(encoding)} not supported by fallback.`);
  }

  private static isDecodeFallbackSupported(characterSet: CharacterSetECI): boolean {
    return (
      characterSet.equals(CharacterSetECI.UTF8) ||
      characterSet.equals(CharacterSetECI.ISO8859_1) ||
      characterSet.equals(CharacterSetECI.ASCII)
    );
  }

  private static encodeFallback(s: string): Uint8Array {
    const encodedURIstring = btoa(unescape(encodeURIComponent(s)));
    const charList = encodedURIstring.split('');
    const uintArray: number[] = [];
    for (let i = 0; i < charList.length; i++) {
      uintArray.push(charList[i].codePointAt(0)!);
    }
    return new Uint8Array(uintArray);
  }
}

/**
 * String utilities
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class StringUtils {
  static readonly SHIFT_JIS = 'SJIS';
  static readonly GB2312 = 'GB2312';
  static readonly ISO88591 = CharacterSetECI.ISO8859_1;
  private static readonly UTF8 = CharacterSetECI.UTF8;

  static castAsNonUtf8Char(code: number, encoding: CharacterSetECI): string {
    const bytes = new Uint8Array([code]);
    return StringEncoding.decode(bytes, encoding);
  }

  static guessEncoding(bytes: Uint8Array, _hints?: Map<number, any>): string {
    // Check for BOM
    if (bytes.length > 2 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
      return CharacterSetECI.UTF8.getName();
    }

    // Simple heuristic: check for high bytes which would indicate non-ASCII
    let hasHighBytes = false;
    for (let i = 0; i < bytes.length; i++) {
      if ((bytes[i] & 0x80) !== 0) {
        hasHighBytes = true;
        break;
      }
    }

    if (!hasHighBytes) {
      return CharacterSetECI.ISO8859_1.getName();
    }

    // Default to UTF-8
    return CharacterSetECI.UTF8.getName();
  }
}

/**
 * Get current time in milliseconds
 */
export function currentTimeMillis(): number {
  return Date.now();
}
