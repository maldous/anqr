import type { RSBasisVector } from "./rs-basis";

export function attachNonZeroBytes(vectors: RSBasisVector[]): void {
  for (const v of vectors) {
    const bits = v.blockBits;
    let nonZeroCount = 0;
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] !== 0) nonZeroCount++;
    }

    if (nonZeroCount === 0) {
      v.nonZeroByteIndices = new Uint16Array(0);
      v.nonZeroByteValues = new Uint8Array(0);
      continue;
    }

    const indices = new Uint16Array(nonZeroCount);
    const values = new Uint8Array(nonZeroCount);
    let writeIndex = 0;
    for (let i = 0; i < bits.length; i++) {
      const byte = bits[i];
      if (byte === 0) continue;
      indices[writeIndex] = i;
      values[writeIndex] = byte;
      writeIndex++;
    }

    v.nonZeroByteIndices = indices;
    v.nonZeroByteValues = values;
  }
}
