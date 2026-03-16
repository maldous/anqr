export interface RSBasisVector {
  dataBitIndex: number;
  rsBlockIndex: number;
  posInBlock: number;
  bitInByte: number;
  blockBits: Uint8Array;
  affectedPixels: number[];
  pivotPixel: number;
  nonZeroByteIndices?: Uint16Array;
  nonZeroByteValues?: Uint8Array;
}
