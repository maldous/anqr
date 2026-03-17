import { arraycopy } from "./arraycopy";

/**
 * Array utility functions
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class Arrays {
  /**
   * Fill array with a value
   */
  static fill(a: Int32Array | Uint8Array | number[], val: number): void {
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
  static equals(first: ArrayLike<unknown> | null, second: ArrayLike<unknown> | null): boolean {
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
  static hashCode(a: Iterable<number> | null): number {
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
    comparator?: (a: number, b: number) => number,
  ): number {
    comparator ??= (a, b) => a - b;
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
