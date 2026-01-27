/**
 * QR Decoder Bit Structures
 * BitMatrix and BitArray classes for QR code data representation
 */

import { Arrays, arraycopy, Integer, StringBuilder } from './util';
import { IllegalArgumentException } from './exceptions';

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
    return (this.bits[Math.floor(i / 32)] & (1 << (i & 0x1F))) !== 0;
  }

  set(i: number): void {
    this.bits[Math.floor(i / 32)] |= 1 << (i & 0x1F);
  }

  flip(i: number): void {
    this.bits[Math.floor(i / 32)] ^= 1 << (i & 0x1F);
  }

  getNextSet(from: number): number {
    const size = this.size;
    if (from >= size) return size;
    const bits = this.bits;
    let bitsOffset = Math.floor(from / 32);
    let currentBits = bits[bitsOffset];
    currentBits &= ~((1 << (from & 0x1F)) - 1);
    const length = bits.length;
    while (currentBits === 0) {
      if (++bitsOffset === length) return size;
      currentBits = bits[bitsOffset];
    }
    const result = (bitsOffset * 32) + Integer.numberOfTrailingZeros(currentBits);
    return result > size ? size : result;
  }

  getNextUnset(from: number): number {
    const size = this.size;
    if (from >= size) return size;
    const bits = this.bits;
    let bitsOffset = Math.floor(from / 32);
    let currentBits = ~bits[bitsOffset];
    currentBits &= ~((1 << (from & 0x1F)) - 1);
    const length = bits.length;
    while (currentBits === 0) {
      if (++bitsOffset === length) return size;
      currentBits = ~bits[bitsOffset];
    }
    const result = (bitsOffset * 32) + Integer.numberOfTrailingZeros(currentBits);
    return result > size ? size : result;
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
      const firstBit = i > firstInt ? 0 : start & 0x1F;
      const lastBit = i < lastInt ? 31 : end & 0x1F;
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
      const firstBit = i > firstInt ? 0 : start & 0x1F;
      const lastBit = i < lastInt ? 31 : end & 0x1F;
      const mask = (2 << lastBit) - (1 << firstBit) & 0xFFFFFFFF;
      if ((bits[i] & mask) !== (value ? mask : 0)) return false;
    }
    return true;
  }

  appendBit(bit: boolean): void {
    this.ensureCapacity(this.size + 1);
    if (bit) {
      this.bits[Math.floor(this.size / 32)] |= 1 << (this.size & 0x1F);
    }
    this.size++;
  }

  appendBits(value: number, numBits: number): void {
    if (numBits < 0 || numBits > 32) {
      throw new IllegalArgumentException('Num bits must be between 0 and 32');
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
      throw new IllegalArgumentException('Sizes don\'t match');
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

  equals(o: any): boolean {
    if (!(o instanceof BitArray)) return false;
    return this.size === o.size && Arrays.equals(this.bits, o.bits);
  }

  hashCode(): number {
    return 31 * this.size + Arrays.hashCode(this.bits);
  }

  toString(): string {
    let result = '';
    for (let i = 0; i < this.size; i++) {
      if ((i & 0x07) === 0) result += ' ';
      result += this.get(i) ? 'X' : '.';
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

/**
 * Represents a 2D matrix of bits.
 */
export class BitMatrix {
  private width: number;
  private height: number;
  private rowSize: number;
  private bits: Int32Array;

  constructor(width: number, height?: number, rowSize?: number, bits?: Int32Array) {
    this.width = width;
    this.height = height ?? width;
    if (width < 1 || this.height < 1) {
      throw new IllegalArgumentException('Both dimensions must be greater than 0');
    }
    this.rowSize = rowSize ?? Math.floor((width + 31) / 32);
    this.bits = bits ?? new Int32Array(this.rowSize * this.height);
  }

  static parseFromBooleanArray(image: boolean[][]): BitMatrix {
    const height = image.length;
    const width = image[0].length;
    const bits = new BitMatrix(width, height);
    for (let i = 0; i < height; i++) {
      const imageI = image[i];
      for (let j = 0; j < width; j++) {
        if (imageI[j]) bits.set(j, i);
      }
    }
    return bits;
  }

  static parseFromString(stringRepresentation: string, setString: string, unsetString: string): BitMatrix {
    if (stringRepresentation === null) {
      throw new IllegalArgumentException('stringRepresentation cannot be null');
    }
    const bits: boolean[] = [];
    let bitsPos = 0;
    let rowStartPos = 0;
    let rowLength = -1;
    let nRows = 0;
    let pos = 0;
    while (pos < stringRepresentation.length) {
      if (stringRepresentation.charAt(pos) === '\n' || stringRepresentation.charAt(pos) === '\r') {
        if (bitsPos > rowStartPos) {
          if (rowLength === -1) {
            rowLength = bitsPos - rowStartPos;
          } else if (bitsPos - rowStartPos !== rowLength) {
            throw new IllegalArgumentException('row lengths do not match');
          }
          rowStartPos = bitsPos;
          nRows++;
        }
        pos++;
      } else if (stringRepresentation.substring(pos, pos + setString.length) === setString) {
        pos += setString.length;
        bits[bitsPos] = true;
        bitsPos++;
      } else if (stringRepresentation.substring(pos, pos + unsetString.length) === unsetString) {
        pos += unsetString.length;
        bits[bitsPos] = false;
        bitsPos++;
      } else {
        throw new IllegalArgumentException('illegal character encountered: ' + stringRepresentation.substring(pos));
      }
    }
    if (bitsPos > rowStartPos) {
      if (rowLength === -1) {
        rowLength = bitsPos - rowStartPos;
      } else if (bitsPos - rowStartPos !== rowLength) {
        throw new IllegalArgumentException('row lengths do not match');
      }
      nRows++;
    }
    const matrix = new BitMatrix(rowLength, nRows);
    for (let i = 0; i < bitsPos; i++) {
      if (bits[i]) matrix.set(Math.floor(i % rowLength), Math.floor(i / rowLength));
    }
    return matrix;
  }

  get(x: number, y: number): boolean {
    const offset = y * this.rowSize + Math.floor(x / 32);
    return ((this.bits[offset] >>> (x & 0x1f)) & 1) !== 0;
  }

  set(x: number, y: number): void {
    const offset = y * this.rowSize + Math.floor(x / 32);
    this.bits[offset] |= (1 << (x & 0x1f)) & 0xFFFFFFFF;
  }

  unset(x: number, y: number): void {
    const offset = y * this.rowSize + Math.floor(x / 32);
    this.bits[offset] &= ~((1 << (x & 0x1f)) & 0xFFFFFFFF);
  }

  flip(x: number, y: number): void {
    const offset = y * this.rowSize + Math.floor(x / 32);
    this.bits[offset] ^= ((1 << (x & 0x1f)) & 0xFFFFFFFF);
  }

  xor(mask: BitMatrix): void {
    if (this.width !== mask.getWidth() || this.height !== mask.getHeight() || this.rowSize !== mask.getRowSize()) {
      throw new IllegalArgumentException('input matrix dimensions do not match');
    }
    const rowArray = new BitArray(Math.floor(this.width / 32) + 1);
    for (let y = 0; y < this.height; y++) {
      const offset = y * this.rowSize;
      const row = mask.getRow(y, rowArray).getBitArray();
      for (let x = 0; x < this.rowSize; x++) {
        this.bits[offset + x] ^= row[x];
      }
    }
  }

  clear(): void {
    for (let i = 0; i < this.bits.length; i++) {
      this.bits[i] = 0;
    }
  }

  setRegion(left: number, top: number, width: number, height: number): void {
    if (top < 0 || left < 0) {
      throw new IllegalArgumentException('Left and top must be nonnegative');
    }
    if (height < 1 || width < 1) {
      throw new IllegalArgumentException('Height and width must be at least 1');
    }
    const right = left + width;
    const bottom = top + height;
    if (bottom > this.height || right > this.width) {
      throw new IllegalArgumentException('The region must fit inside the matrix');
    }
    for (let y = top; y < bottom; y++) {
      const offset = y * this.rowSize;
      for (let x = left; x < right; x++) {
        this.bits[offset + Math.floor(x / 32)] |= ((1 << (x & 0x1f)) & 0xFFFFFFFF);
      }
    }
  }

  getRow(y: number, row?: BitArray): BitArray {
    if (row === null || row === undefined || row.getSize() < this.width) {
      row = new BitArray(this.width);
    } else {
      row.clear();
    }
    const offset = y * this.rowSize;
    for (let x = 0; x < this.rowSize; x++) {
      row.setBulk(x * 32, this.bits[offset + x]);
    }
    return row;
  }

  setRow(y: number, row: BitArray): void {
    arraycopy(row.getBitArray(), 0, this.bits, y * this.rowSize, this.rowSize);
  }

  rotate180(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    let topRow = new BitArray(width);
    let bottomRow = new BitArray(width);
    for (let i = 0; i < Math.floor((height + 1) / 2); i++) {
      topRow = this.getRow(i, topRow);
      bottomRow = this.getRow(height - 1 - i, bottomRow);
      topRow.reverse();
      bottomRow.reverse();
      this.setRow(i, bottomRow);
      this.setRow(height - 1 - i, topRow);
    }
  }

  getEnclosingRectangle(): Int32Array | null {
    let left = this.width;
    let top = this.height;
    let right = -1;
    let bottom = -1;
    for (let y = 0; y < this.height; y++) {
      for (let x32 = 0; x32 < this.rowSize; x32++) {
        const theBits = this.bits[y * this.rowSize + x32];
        if (theBits !== 0) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x32 * 32 < left) {
            let bit = 0;
            while (((theBits << (31 - bit)) & 0xFFFFFFFF) === 0) bit++;
            if ((x32 * 32 + bit) < left) left = x32 * 32 + bit;
          }
          if (x32 * 32 + 31 > right) {
            let bit = 31;
            while ((theBits >>> bit) === 0) bit--;
            if ((x32 * 32 + bit) > right) right = x32 * 32 + bit;
          }
        }
      }
    }
    if (right < left || bottom < top) return null;
    return Int32Array.from([left, top, right - left + 1, bottom - top + 1]);
  }

  getTopLeftOnBit(): Int32Array | null {
    let bitsOffset = 0;
    while (bitsOffset < this.bits.length && this.bits[bitsOffset] === 0) bitsOffset++;
    if (bitsOffset === this.bits.length) return null;
    const y = bitsOffset / this.rowSize;
    let x = (bitsOffset % this.rowSize) * 32;
    const theBits = this.bits[bitsOffset];
    let bit = 0;
    while (((theBits << (31 - bit)) & 0xFFFFFFFF) === 0) bit++;
    x += bit;
    return Int32Array.from([x, y]);
  }

  getBottomRightOnBit(): Int32Array | null {
    let bitsOffset = this.bits.length - 1;
    while (bitsOffset >= 0 && this.bits[bitsOffset] === 0) bitsOffset--;
    if (bitsOffset < 0) return null;
    const y = Math.floor(bitsOffset / this.rowSize);
    let x = Math.floor(bitsOffset % this.rowSize) * 32;
    const theBits = this.bits[bitsOffset];
    let bit = 31;
    while ((theBits >>> bit) === 0) bit--;
    x += bit;
    return Int32Array.from([x, y]);
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getRowSize(): number {
    return this.rowSize;
  }

  equals(o: any): boolean {
    if (!(o instanceof BitMatrix)) return false;
    return this.width === o.width && this.height === o.height && this.rowSize === o.rowSize && Arrays.equals(this.bits, o.bits);
  }

  hashCode(): number {
    let hash = this.width;
    hash = 31 * hash + this.width;
    hash = 31 * hash + this.height;
    hash = 31 * hash + this.rowSize;
    hash = 31 * hash + Arrays.hashCode(this.bits);
    return hash;
  }

  toString(setString: string = 'X ', unsetString: string = '  ', lineSeparator: string = '\n'): string {
    const result = new StringBuilder();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        result.append(this.get(x, y) ? setString : unsetString);
      }
      result.append(lineSeparator);
    }
    return result.toString();
  }

  clone(): BitMatrix {
    return new BitMatrix(this.width, this.height, this.rowSize, this.bits.slice());
  }
}
