/**
 * QR Decoder Luminance
 * LuminanceSource and BinaryBitmap for image processing
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DECODER');

import type { BitArray, BitMatrix } from './bit-matrix';
import { IllegalArgumentException, UnsupportedOperationException } from './exceptions';
import { StringBuilder } from './util';

/**
 * Abstract luminance source for grayscale image data
 */
export abstract class LuminanceSource {
  protected constructor(
    private width: number,
    private height: number
  ) {}

  abstract getRow(y: number, row?: Uint8ClampedArray): Uint8ClampedArray;
  abstract getMatrix(): Uint8ClampedArray;
  abstract invert(): LuminanceSource;

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  isCropSupported(): boolean {
    return false;
  }

  crop(_left: number, _top: number, _width: number, _height: number): LuminanceSource {
    throw new UnsupportedOperationException('This luminance source does not support cropping.');
  }

  isRotateSupported(): boolean {
    return false;
  }

  rotateCounterClockwise(): LuminanceSource {
    throw new UnsupportedOperationException(
      'This luminance source does not support rotation by 90 degrees.'
    );
  }

  rotateCounterClockwise45(): LuminanceSource {
    throw new UnsupportedOperationException(
      'This luminance source does not support rotation by 45 degrees.'
    );
  }

  toString(): string {
    const row = new Uint8ClampedArray(this.width);
    const result = new StringBuilder();
    for (let y = 0; y < this.height; y++) {
      const sourceRow = this.getRow(y, row);
      for (let x = 0; x < this.width; x++) {
        const luminance = sourceRow[x] & 0xff;
        let c: string;
        if (luminance < 0x40) c = '#';
        else if (luminance < 0x80) c = '+';
        else if (luminance < 0xc0) c = '.';
        else c = ' ';
        result.append(c);
      }
      result.append('\n');
    }
    return result.toString();
  }
}

/**
 * Inverted luminance source wrapper
 */
export class InvertedLuminanceSource extends LuminanceSource {
  constructor(private delegate: LuminanceSource) {
    super(delegate.getWidth(), delegate.getHeight());
  }

  getRow(y: number, row?: Uint8ClampedArray): Uint8ClampedArray {
    const sourceRow = this.delegate.getRow(y, row);
    const width = this.getWidth();
    for (let i = 0; i < width; i++) {
      sourceRow[i] = 255 - (sourceRow[i] & 0xff);
    }
    return sourceRow;
  }

  getMatrix(): Uint8ClampedArray {
    const matrix = this.delegate.getMatrix();
    const length = this.getWidth() * this.getHeight();
    const invertedMatrix = new Uint8ClampedArray(length);
    for (let i = 0; i < length; i++) {
      invertedMatrix[i] = 255 - (matrix[i] & 0xff);
    }
    return invertedMatrix;
  }

  isCropSupported(): boolean {
    return this.delegate.isCropSupported();
  }

  crop(left: number, top: number, width: number, height: number): LuminanceSource {
    return new InvertedLuminanceSource(this.delegate.crop(left, top, width, height));
  }

  isRotateSupported(): boolean {
    return this.delegate.isRotateSupported();
  }

  invert(): LuminanceSource {
    return this.delegate;
  }

  rotateCounterClockwise(): LuminanceSource {
    return new InvertedLuminanceSource(this.delegate.rotateCounterClockwise());
  }

  rotateCounterClockwise45(): LuminanceSource {
    return new InvertedLuminanceSource(this.delegate.rotateCounterClockwise45());
  }
}

/**
 * RGBA luminance source from canvas/ImageData
 */
export class RGBALuminanceSource extends LuminanceSource {
  private luminances: Uint8ClampedArray;

  constructor(luminances: Uint8ClampedArray, width: number, height: number) {
    super(width, height);
    this.luminances = luminances;
  }

  static createFromImageData(imageData: ImageData): RGBALuminanceSource {
    const { data, width, height } = imageData;
    const luminances = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Use standard luminance formula
        luminances[y * width + x] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      }
    }
    return new RGBALuminanceSource(luminances, width, height);
  }

  getRow(y: number, row?: Uint8ClampedArray): Uint8ClampedArray {
    const width = this.getWidth();
    if (row === undefined || row === null || row.length < width) {
      row = new Uint8ClampedArray(width);
    }
    const offset = y * width;
    for (let x = 0; x < width; x++) {
      row[x] = this.luminances[offset + x];
    }
    return row;
  }

  getMatrix(): Uint8ClampedArray {
    return this.luminances;
  }

  invert(): LuminanceSource {
    return new InvertedLuminanceSource(this);
  }
}

/**
 * Abstract binarizer for converting luminance to bits
 */
export abstract class Binarizer {
  protected constructor(private source: LuminanceSource) {}

  getLuminanceSource(): LuminanceSource {
    return this.source;
  }

  abstract getBlackRow(y: number, row: BitArray): BitArray;
  abstract getBlackMatrix(): BitMatrix;
  abstract createBinarizer(source: LuminanceSource): Binarizer;

  getWidth(): number {
    return this.source.getWidth();
  }

  getHeight(): number {
    return this.source.getHeight();
  }
}

/**
 * Binary bitmap combining luminance source and binarizer
 */
export class BinaryBitmap {
  private matrix: BitMatrix | null = null;

  constructor(private binarizer: Binarizer) {
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
    if (this.matrix === null) {
      this.matrix = this.binarizer.getBlackMatrix();
    }
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
    } catch (_e) {
      return '';
    }
  }
}
