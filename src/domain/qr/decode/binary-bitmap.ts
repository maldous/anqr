import type { BitArray, BitMatrix } from './bit-matrix';
import { IllegalArgumentException } from './exceptions';
import { Binarizer } from './binarizer-2';

/**
 * Binary bitmap combining luminance source and binarizer
 */
export class BinaryBitmap {
  private matrix: BitMatrix | null = null;

  constructor(private readonly binarizer: Binarizer) {
    if (binarizer === null) {
      throw new IllegalArgumentException('Binarizer must be non-null.');
    }
  }

  getWidth(): number {
    return this.binarizer.getWidth();
  }

  getHeight(): number {
    return this.binarizer.getHeight();
  }

  getBlackRow(y: number, row: BitArray): BitArray {
    return this.binarizer.getBlackRow(y, row);
  }

  getBlackMatrix(): BitMatrix {
    this.matrix ??= this.binarizer.getBlackMatrix();
    return this.matrix;
  }

  isCropSupported(): boolean {
    return this.binarizer.getLuminanceSource().isCropSupported();
  }

  crop(left: number, top: number, width: number, height: number): BinaryBitmap {
    const newSource = this.binarizer.getLuminanceSource().crop(left, top, width, height);
    return new BinaryBitmap(this.binarizer.createBinarizer(newSource));
  }

  isRotateSupported(): boolean {
    return this.binarizer.getLuminanceSource().isRotateSupported();
  }

  rotateCounterClockwise(): BinaryBitmap {
    const newSource = this.binarizer.getLuminanceSource().rotateCounterClockwise();
    return new BinaryBitmap(this.binarizer.createBinarizer(newSource));
  }

  rotateCounterClockwise45(): BinaryBitmap {
    const newSource = this.binarizer.getLuminanceSource().rotateCounterClockwise45();
    return new BinaryBitmap(this.binarizer.createBinarizer(newSource));
  }

  toString(): string {
    try {
      return this.getBlackMatrix().toString();
    } catch {
      return '';
    }
  }
}
