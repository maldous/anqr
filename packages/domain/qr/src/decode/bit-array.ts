import { IllegalArgumentException } from "./exceptions";
import { Arrays, arraycopy, Integer } from "./util";

/**
 * A simple, fast array of bits, represented compactly by an array of ints internally.
 */
export class BitArray {
  private size: number;
  private bits: Int32Array;

  constructor(size?: number, bits?: Int32Array) {
    if (size === undefined) {
      this.size = 0;
      this.bits = new Int32Array(1);
    } else {
      this.size = size;
      this.bits = bits ?? BitArray.makeArray(size);
    }
  }

  getSize(): number {
    return this.size;
  }

  getSizeInBytes(): number {
    return Math.floor((this.size + 7) / 8);
  }

  private ensureCapacity(size: number): void {
    if (size > this.bits.length * 32) {
      const newBits = BitArray.makeArray(size);
      arraycopy(this.bits, 0, newBits, 0, this.bits.length);
      this.bits = newBits;
    }
  }

  get(i: number): boolean {
    return (this.bits[Math.floor(i / 32)] & (1 << (i & 0x1f))) !== 0;
  }

  set(i: number): void {
    this.bits[Math.floor(i / 32)] |= 1 << (i & 0x1f);
  }

  flip(i: number): void {
    this.bits[Math.floor(i / 32)] ^= 1 << (i & 0x1f);
  }

  getNextSet(from: number): number {
    const size = this.size;
    if (from >= size) return size;
    const bits = this.bits;
    let bitsOffset = Math.floor(from / 32);
    let currentBits = bits[bitsOffset];
    currentBits &= ~((1 << (from & 0x1f)) - 1);
    const length = bits.length;
    while (currentBits === 0) {
      if (++bitsOffset === length) return size;
      currentBits = bits[bitsOffset];
    }
    const result = bitsOffset * 32 + Integer.numberOfTrailingZeros(currentBits);
    return Math.min(result, size);
  }

  getNextUnset(from: number): number {
    const size = this.size;
    if (from >= size) return size;
    const bits = this.bits;
    let bitsOffset = Math.floor(from / 32);
    let currentBits = ~bits[bitsOffset];
    currentBits &= ~((1 << (from & 0x1f)) - 1);
    const length = bits.length;
    while (currentBits === 0) {
      if (++bitsOffset === length) return size;
      currentBits = ~bits[bitsOffset];
    }
    const result = bitsOffset * 32 + Integer.numberOfTrailingZeros(currentBits);
    return Math.min(result, size);
  }

  setBulk(i: number, newBits: number): void {
    this.bits[Math.floor(i / 32)] = newBits;
  }

  setRange(start: number, end: number): void {
    if (end < start || start < 0 || end > this.size) {
      throw new IllegalArgumentException();
    }
    if (end === start) return;
    end--;
    const firstInt = Math.floor(start / 32);
    const lastInt = Math.floor(end / 32);
    const bits = this.bits;
    for (let i = firstInt; i <= lastInt; i++) {
      const firstBit = i > firstInt ? 0 : start & 0x1f;
      const lastBit = i < lastInt ? 31 : end & 0x1f;
      const mask = (2 << lastBit) - (1 << firstBit);
      bits[i] |= mask;
    }
  }

  clear(): void {
    const bits = this.bits;
    for (let i = 0; i < bits.length; i++) {
      bits[i] = 0;
    }
  }

  isRange(start: number, end: number, value: boolean): boolean {
    if (end < start || start < 0 || end > this.size) {
      throw new IllegalArgumentException();
    }
    if (end === start) return true;
    end--;
    const firstInt = Math.floor(start / 32);
    const lastInt = Math.floor(end / 32);
    const bits = this.bits;
    for (let i = firstInt; i <= lastInt; i++) {
      const firstBit = i > firstInt ? 0 : start & 0x1f;
      const lastBit = i < lastInt ? 31 : end & 0x1f;
      const mask = ((2 << lastBit) - (1 << firstBit)) & 0xffffffff;
      if ((bits[i] & mask) !== (value ? mask : 0)) return false;
    }
    return true;
  }

  appendBit(bit: boolean): void {
    this.ensureCapacity(this.size + 1);
    if (bit) {
      this.bits[Math.floor(this.size / 32)] |= 1 << (this.size & 0x1f);
    }
    this.size++;
  }

  appendBits(value: number, numBits: number): void {
    if (numBits < 0 || numBits > 32) {
      throw new IllegalArgumentException("Num bits must be between 0 and 32");
    }
    this.ensureCapacity(this.size + numBits);
    for (let numBitsLeft = numBits; numBitsLeft > 0; numBitsLeft--) {
      this.appendBit(((value >> (numBitsLeft - 1)) & 0x01) === 1);
    }
  }

  appendBitArray(other: BitArray): void {
    const otherSize = other.size;
    this.ensureCapacity(this.size + otherSize);
    for (let i = 0; i < otherSize; i++) {
      this.appendBit(other.get(i));
    }
  }

  xor(other: BitArray): void {
    if (this.size !== other.size) {
      throw new IllegalArgumentException("Sizes don't match");
    }
    const bits = this.bits;
    for (let i = 0; i < bits.length; i++) {
      bits[i] ^= other.bits[i];
    }
  }

  toBytes(bitOffset: number, array: Uint8Array, offset: number, numBytes: number): void {
    for (let i = 0; i < numBytes; i++) {
      let theByte = 0;
      for (let j = 0; j < 8; j++) {
        if (this.get(bitOffset)) {
          theByte |= 1 << (7 - j);
        }
        bitOffset++;
      }
      array[offset + i] = theByte;
    }
  }

  getBitArray(): Int32Array {
    return this.bits;
  }

  reverse(): void {
    const newBits = new Int32Array(this.bits.length);
    const len = Math.floor((this.size - 1) / 32);
    const oldBitsLen = len + 1;
    const bits = this.bits;
    for (let i = 0; i < oldBitsLen; i++) {
      let x = bits[i];
      x = ((x >> 1) & 0x55555555) | ((x & 0x55555555) << 1);
      x = ((x >> 2) & 0x33333333) | ((x & 0x33333333) << 2);
      x = ((x >> 4) & 0x0f0f0f0f) | ((x & 0x0f0f0f0f) << 4);
      x = ((x >> 8) & 0x00ff00ff) | ((x & 0x00ff00ff) << 8);
      x = ((x >> 16) & 0x0000ffff) | ((x & 0x0000ffff) << 16);
      newBits[len - i] = x;
    }
    if (this.size !== oldBitsLen * 32) {
      const leftOffset = oldBitsLen * 32 - this.size;
      let currentInt = newBits[0] >>> leftOffset;
      for (let i = 1; i < oldBitsLen; i++) {
        const nextInt = newBits[i];
        currentInt |= nextInt << (32 - leftOffset);
        newBits[i - 1] = currentInt;
        currentInt = nextInt >>> leftOffset;
      }
      newBits[oldBitsLen - 1] = currentInt;
    }
    this.bits = newBits;
  }

  private static makeArray(size: number): Int32Array {
    return new Int32Array(Math.floor((size + 31) / 32));
  }

  equals(o: unknown): boolean {
    if (!(o instanceof BitArray)) return false;
    return this.size === o.size && Arrays.equals(this.bits, o.bits);
  }

  hashCode(): number {
    return 31 * this.size + Arrays.hashCode(this.bits);
  }

  toString(): string {
    let result = "";
    for (let i = 0; i < this.size; i++) {
      if ((i & 0x07) === 0) result += " ";
      result += this.get(i) ? "X" : ".";
    }
    return result;
  }

  clone(): BitArray {
    return new BitArray(this.size, this.bits.slice());
  }

  toArray(): boolean[] {
    const result: boolean[] = [];
    for (let i = 0; i < this.size; i++) {
      result.push(this.get(i));
    }
    return result;
  }
}
