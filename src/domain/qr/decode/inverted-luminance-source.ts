import { LuminanceSource } from './luminance-source';

/**
 * Inverted luminance source wrapper
 */
export class InvertedLuminanceSource extends LuminanceSource {
  constructor(private readonly delegate: LuminanceSource) {
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
