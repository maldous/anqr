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

describe('BitArray', () => {
  async function getBitArray() {
    const mod = await import('../../src/modules/qr-decoder/bit-matrix');
    return mod.BitArray;
  }

  it('constructs empty', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray();
    expect(ba.getSize()).toBe(0);
  });

  it('constructs with size', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(32);
    expect(ba.getSize()).toBe(32);
    expect(ba.getSizeInBytes()).toBe(4);
  });

  it('constructs with size and bits', async () => {
    const BitArray = await getBitArray();
    const bits = new Int32Array([0b1010]);
    const ba = new BitArray(4, bits);
    expect(ba.get(1)).toBe(true);
    expect(ba.get(0)).toBe(false);
  });

  it('getSizeInBytes rounds up', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(33);
    expect(ba.getSizeInBytes()).toBe(5);
  });

  it('get/set/flip', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    expect(ba.get(5)).toBe(false);
    ba.set(5);
    expect(ba.get(5)).toBe(true);
    ba.flip(5);
    expect(ba.get(5)).toBe(false);
    ba.flip(5);
    expect(ba.get(5)).toBe(true);
  });

  it('getNextSet finds next set bit', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    ba.set(10);
    ba.set(40);
    expect(ba.getNextSet(0)).toBe(10);
    expect(ba.getNextSet(11)).toBe(40);
    expect(ba.getNextSet(41)).toBe(64);
    expect(ba.getNextSet(100)).toBe(64);
  });

  it('getNextUnset finds next unset bit', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    for (let i = 0; i < 64; i++) ba.set(i);
    ba.flip(10);
    ba.flip(40);
    expect(ba.getNextUnset(0)).toBe(10);
    expect(ba.getNextUnset(11)).toBe(40);
    expect(ba.getNextUnset(41)).toBe(64);
    expect(ba.getNextUnset(100)).toBe(64);
  });

  it('setBulk replaces int', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    ba.setBulk(0, 0xffffffff);
    for (let i = 0; i < 32; i++) {
      expect(ba.get(i)).toBe(true);
    }
    expect(ba.get(32)).toBe(false);
  });

  it('setRange sets range of bits', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    ba.setRange(4, 12);
    expect(ba.get(3)).toBe(false);
    for (let i = 4; i < 12; i++) {
      expect(ba.get(i)).toBe(true);
    }
    expect(ba.get(12)).toBe(false);
  });

  it('setRange throws on invalid range', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    expect(() => ba.setRange(10, 5)).toThrow();
    expect(() => ba.setRange(-1, 5)).toThrow();
    expect(() => ba.setRange(0, 65)).toThrow();
  });

  it('setRange with start === end is no-op', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    ba.setRange(5, 5);
    expect(ba.get(5)).toBe(false);
  });

  it('setRange spanning multiple ints', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(128);
    ba.setRange(30, 66);
    expect(ba.get(29)).toBe(false);
    for (let i = 30; i < 66; i++) {
      expect(ba.get(i)).toBe(true);
    }
    expect(ba.get(66)).toBe(false);
  });

  it('clear resets all bits', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    ba.set(5);
    ba.set(33);
    ba.clear();
    expect(ba.get(5)).toBe(false);
    expect(ba.get(33)).toBe(false);
  });

  it('isRange checks values in range', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    ba.setRange(4, 12);
    expect(ba.isRange(4, 12, true)).toBe(true);
    expect(ba.isRange(4, 12, false)).toBe(false);
    expect(ba.isRange(0, 4, false)).toBe(true);
    expect(ba.isRange(12, 64, false)).toBe(true);
  });

  it('isRange throws on invalid range', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    expect(() => ba.isRange(10, 5, true)).toThrow();
    expect(() => ba.isRange(-1, 5, true)).toThrow();
    expect(() => ba.isRange(0, 65, true)).toThrow();
  });

  it('isRange with start === end returns true', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(64);
    expect(ba.isRange(5, 5, true)).toBe(true);
  });

  it('appendBit grows array', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray();
    ba.appendBit(true);
    ba.appendBit(false);
    ba.appendBit(true);
    expect(ba.getSize()).toBe(3);
    expect(ba.get(0)).toBe(true);
    expect(ba.get(1)).toBe(false);
    expect(ba.get(2)).toBe(true);
  });

  it('appendBits adds multiple bits', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray();
    ba.appendBits(0b1010, 4);
    expect(ba.getSize()).toBe(4);
    expect(ba.get(0)).toBe(true);
    expect(ba.get(1)).toBe(false);
    expect(ba.get(2)).toBe(true);
    expect(ba.get(3)).toBe(false);
  });

  it('appendBits throws for invalid numBits', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray();
    expect(() => ba.appendBits(0, -1)).toThrow();
    expect(() => ba.appendBits(0, 33)).toThrow();
  });

  it('appendBitArray concatenates arrays', async () => {
    const BitArray = await getBitArray();
    const ba1 = new BitArray();
    ba1.appendBit(true);
    ba1.appendBit(false);
    const ba2 = new BitArray();
    ba2.appendBit(false);
    ba2.appendBit(true);
    ba1.appendBitArray(ba2);
    expect(ba1.getSize()).toBe(4);
    expect(ba1.get(0)).toBe(true);
    expect(ba1.get(1)).toBe(false);
    expect(ba1.get(2)).toBe(false);
    expect(ba1.get(3)).toBe(true);
  });

  it('xor combines two arrays', async () => {
    const BitArray = await getBitArray();
    const ba1 = new BitArray(32);
    ba1.set(0);
    ba1.set(1);
    const ba2 = new BitArray(32);
    ba2.set(1);
    ba2.set(2);
    ba1.xor(ba2);
    expect(ba1.get(0)).toBe(true);
    expect(ba1.get(1)).toBe(false);
    expect(ba1.get(2)).toBe(true);
  });

  it('xor throws for mismatched sizes', async () => {
    const BitArray = await getBitArray();
    const ba1 = new BitArray(32);
    const ba2 = new BitArray(64);
    expect(() => ba1.xor(ba2)).toThrow();
  });

  it('toBytes extracts byte data', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray();
    ba.appendBits(0b11001010, 8);
    const bytes = new Uint8Array(1);
    ba.toBytes(0, bytes, 0, 1);
    expect(bytes[0]).toBe(0b11001010);
  });

  it('getBitArray returns internal array', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(32);
    ba.set(0);
    const arr = ba.getBitArray();
    expect(arr instanceof Int32Array).toBe(true);
    expect(arr[0] & 1).toBe(1);
  });

  it('reverse flips bit order', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(8);
    ba.set(0); // bit 0 set
    ba.reverse();
    expect(ba.get(7)).toBe(true);
    expect(ba.get(0)).toBe(false);
  });

  it('equals checks structural equality', async () => {
    const BitArray = await getBitArray();
    const ba1 = new BitArray(32);
    ba1.set(5);
    const ba2 = new BitArray(32);
    ba2.set(5);
    expect(ba1.equals(ba2)).toBe(true);
    ba2.set(6);
    expect(ba1.equals(ba2)).toBe(false);
  });

  it('equals returns false for non-BitArray', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(32);
    expect(ba.equals('not a bitarray')).toBe(false);
    expect(ba.equals(null)).toBe(false);
  });

  it('hashCode returns consistent value', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(32);
    ba.set(5);
    const h1 = ba.hashCode();
    const h2 = ba.hashCode();
    expect(h1).toBe(h2);
    expect(typeof h1).toBe('number');
  });

  it('toString returns string representation', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(8);
    ba.set(0);
    ba.set(2);
    const str = ba.toString();
    expect(str).toContain('X');
    expect(str).toContain('.');
  });

  it('clone creates independent copy', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(32);
    ba.set(5);
    const clone = ba.clone();
    expect(clone.get(5)).toBe(true);
    clone.flip(5);
    expect(ba.get(5)).toBe(true);
    expect(clone.get(5)).toBe(false);
  });

  it('toArray converts to boolean array', async () => {
    const BitArray = await getBitArray();
    const ba = new BitArray(4);
    ba.set(0);
    ba.set(2);
    const arr = ba.toArray();
    expect(arr).toEqual([true, false, true, false]);
  });
});

describe('BitMatrix', () => {
  async function getBitMatrix() {
    const mod = await import('../../src/modules/qr-decoder/bit-matrix');
    return mod.BitMatrix;
  }

  it('constructs square matrix', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    expect(bm.getWidth()).toBe(8);
    expect(bm.getHeight()).toBe(8);
  });

  it('constructs rectangular matrix', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8, 4);
    expect(bm.getWidth()).toBe(8);
    expect(bm.getHeight()).toBe(4);
  });

  it('throws for zero dimensions', async () => {
    const BitMatrix = await getBitMatrix();
    expect(() => new BitMatrix(0)).toThrow();
    expect(() => new BitMatrix(1, 0)).toThrow();
  });

  it('get/set/unset/flip', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    expect(bm.get(3, 4)).toBe(false);
    bm.set(3, 4);
    expect(bm.get(3, 4)).toBe(true);
    bm.unset(3, 4);
    expect(bm.get(3, 4)).toBe(false);
    bm.flip(3, 4);
    expect(bm.get(3, 4)).toBe(true);
    bm.flip(3, 4);
    expect(bm.get(3, 4)).toBe(false);
  });

  it('parseFromBooleanArray', async () => {
    const BitMatrix = await getBitMatrix();
    const image = [
      [true, false, true],
      [false, true, false],
    ];
    const bm = BitMatrix.parseFromBooleanArray(image);
    expect(bm.getWidth()).toBe(3);
    expect(bm.getHeight()).toBe(2);
    expect(bm.get(0, 0)).toBe(true);
    expect(bm.get(1, 0)).toBe(false);
    expect(bm.get(2, 0)).toBe(true);
    expect(bm.get(0, 1)).toBe(false);
    expect(bm.get(1, 1)).toBe(true);
  });

  it('parseFromString', async () => {
    const BitMatrix = await getBitMatrix();
    const str = 'X.X\n.X.\n';
    const bm = BitMatrix.parseFromString(str, 'X', '.');
    expect(bm.getWidth()).toBe(3);
    expect(bm.getHeight()).toBe(2);
    expect(bm.get(0, 0)).toBe(true);
    expect(bm.get(1, 0)).toBe(false);
    expect(bm.get(2, 0)).toBe(true);
    expect(bm.get(1, 1)).toBe(true);
  });

  it('parseFromString throws for null', async () => {
    const BitMatrix = await getBitMatrix();
    expect(() => BitMatrix.parseFromString(null as any, 'X', '.')).toThrow();
  });

  it('parseFromString throws for mismatched row lengths', async () => {
    const BitMatrix = await getBitMatrix();
    expect(() => BitMatrix.parseFromString('XX\nX\n', 'X', '.')).toThrow('row lengths');
  });

  it('parseFromString throws for illegal character', async () => {
    const BitMatrix = await getBitMatrix();
    expect(() => BitMatrix.parseFromString('XZ\n', 'X', '.')).toThrow('illegal character');
  });

  it('xor with another matrix', async () => {
    const BitMatrix = await getBitMatrix();
    const a = new BitMatrix(8);
    a.set(0, 0);
    a.set(1, 0);
    const b = new BitMatrix(8);
    b.set(1, 0);
    b.set(2, 0);
    a.xor(b);
    expect(a.get(0, 0)).toBe(true);
    expect(a.get(1, 0)).toBe(false);
    expect(a.get(2, 0)).toBe(true);
  });

  it('xor throws for mismatched dimensions', async () => {
    const BitMatrix = await getBitMatrix();
    const a = new BitMatrix(8);
    const b = new BitMatrix(16);
    expect(() => a.xor(b)).toThrow('dimensions');
  });

  it('clear zeroes all bits', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    bm.set(3, 4);
    bm.set(5, 6);
    bm.clear();
    expect(bm.get(3, 4)).toBe(false);
    expect(bm.get(5, 6)).toBe(false);
  });

  it('setRegion sets rectangular region', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(16);
    bm.setRegion(2, 3, 4, 5);
    expect(bm.get(2, 3)).toBe(true);
    expect(bm.get(5, 7)).toBe(true);
    expect(bm.get(6, 3)).toBe(false);
    expect(bm.get(1, 3)).toBe(false);
  });

  it('setRegion throws for invalid parameters', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    expect(() => bm.setRegion(-1, 0, 4, 4)).toThrow('nonnegative');
    expect(() => bm.setRegion(0, -1, 4, 4)).toThrow('nonnegative');
    expect(() => bm.setRegion(0, 0, 0, 4)).toThrow('at least 1');
    expect(() => bm.setRegion(0, 0, 4, 0)).toThrow('at least 1');
    expect(() => bm.setRegion(0, 0, 9, 4)).toThrow('fit inside');
    expect(() => bm.setRegion(0, 0, 4, 9)).toThrow('fit inside');
  });

  it('getRow and setRow', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    bm.set(3, 0);
    const row = bm.getRow(0);
    expect(row.get(3)).toBe(true);
    expect(row.get(0)).toBe(false);

    const { BitArray } = await import('../../src/modules/qr-decoder/bit-matrix');
    const newRow = new BitArray(8);
    newRow.set(7);
    bm.setRow(1, newRow);
    expect(bm.get(7, 1)).toBe(true);
  });

  it('getRow reuses existing row', async () => {
    const BitMatrix = await getBitMatrix();
    const { BitArray } = await import('../../src/modules/qr-decoder/bit-matrix');
    const bm = new BitMatrix(8);
    bm.set(3, 0);
    const existing = new BitArray(8);
    const row = bm.getRow(0, existing);
    expect(row.get(3)).toBe(true);
  });

  it('rotate180', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(4);
    bm.set(0, 0);
    bm.rotate180();
    expect(bm.get(3, 3)).toBe(true);
    expect(bm.get(0, 0)).toBe(false);
  });

  it('getEnclosingRectangle', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(16);
    bm.set(3, 4);
    bm.set(10, 8);
    const rect = bm.getEnclosingRectangle();
    expect(rect).not.toBeNull();
    expect(rect![0]).toBe(3); // left
    expect(rect![1]).toBe(4); // top
    expect(rect![2]).toBe(8); // width
    expect(rect![3]).toBe(5); // height
  });

  it('getEnclosingRectangle returns null for empty matrix', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    expect(bm.getEnclosingRectangle()).toBeNull();
  });

  it('getTopLeftOnBit', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(16);
    bm.set(5, 3);
    const pt = bm.getTopLeftOnBit();
    expect(pt).not.toBeNull();
    expect(pt![0]).toBe(5);
  });

  it('getTopLeftOnBit returns null for empty', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    expect(bm.getTopLeftOnBit()).toBeNull();
  });

  it('getBottomRightOnBit', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(16);
    bm.set(5, 3);
    bm.set(10, 12);
    const pt = bm.getBottomRightOnBit();
    expect(pt).not.toBeNull();
    expect(pt![0]).toBe(10);
  });

  it('getBottomRightOnBit returns null for empty', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    expect(bm.getBottomRightOnBit()).toBeNull();
  });

  it('equals checks structural equality', async () => {
    const BitMatrix = await getBitMatrix();
    const a = new BitMatrix(8);
    a.set(3, 4);
    const b = new BitMatrix(8);
    b.set(3, 4);
    expect(a.equals(b)).toBe(true);
    b.set(5, 6);
    expect(a.equals(b)).toBe(false);
  });

  it('equals returns false for non-BitMatrix', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    expect(bm.equals('not a matrix')).toBe(false);
  });

  it('hashCode is consistent', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    bm.set(3, 4);
    const h1 = bm.hashCode();
    const h2 = bm.hashCode();
    expect(h1).toBe(h2);
  });

  it('toString produces readable output', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(3);
    bm.set(0, 0);
    bm.set(2, 2);
    const str = bm.toString();
    expect(str).toContain('X');
  });

  it('toString with custom strings', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(2);
    bm.set(0, 0);
    const str = bm.toString('1', '0', '\n');
    expect(str).toContain('1');
    expect(str).toContain('0');
  });

  it('clone creates independent copy', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(8);
    bm.set(3, 4);
    const clone = bm.clone();
    expect(clone.get(3, 4)).toBe(true);
    clone.flip(3, 4);
    expect(bm.get(3, 4)).toBe(true);
    expect(clone.get(3, 4)).toBe(false);
  });

  it('getRowSize returns correct value', async () => {
    const BitMatrix = await getBitMatrix();
    const bm = new BitMatrix(33);
    expect(bm.getRowSize()).toBe(2); // ceil(33/32)
  });
});
