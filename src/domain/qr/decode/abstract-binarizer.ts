import type { BitArray, BitMatrix } from "./bit-matrix";
import { LuminanceSource } from "./luminance-source";

/**
 * Abstract binarizer for converting luminance to bits
 */
export abstract class Binarizer {
  protected constructor(private readonly source: LuminanceSource) {}

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
