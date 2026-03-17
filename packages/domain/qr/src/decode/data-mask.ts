import { BitMatrix } from "./bit-matrix";

/**
 * Data mask patterns for QR codes
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class DataMask {
  private static readonly DATA_MASKS: ((i: number, j: number) => boolean)[] = [
    (i, j) => ((i + j) & 0x01) === 0,
    (i, _j) => (i & 0x01) === 0,
    (_i, j) => j % 3 === 0,
    (i, j) => (i + j) % 3 === 0,
    (i, j) => ((Math.trunc(i / 2) + Math.trunc(j / 3)) & 0x01) === 0,
    (i, j) => ((i * j) & 0x01) + ((i * j) % 3) === 0,
    (i, j) => ((((i * j) & 0x01) + ((i * j) % 3)) & 0x01) === 0,
    (i, j) => ((((i + j) & 0x01) + ((i * j) % 3)) & 0x01) === 0,
  ];

  static values(): ((i: number, j: number) => boolean)[] {
    return DataMask.DATA_MASKS;
  }

  static isMasked(reference: number, i: number, j: number): boolean {
    return DataMask.DATA_MASKS[reference](i, j);
  }

  static unmaskBitMatrix(bits: BitMatrix, dimension: number, reference: number): void {
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        if (DataMask.isMasked(reference, i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
}
