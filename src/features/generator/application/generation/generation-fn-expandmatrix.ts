/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Expand packed Uint8Array into boolean matrix.
 */

export function expandPackedQArtMatrix(packed: Uint8Array, moduleCount: number): boolean[][] {
  const expectedLength = moduleCount * moduleCount;
  if (packed.length !== expectedLength) {
    throw new Error(
      `Invalid packed matrix length ${packed.length}, expected ${expectedLength} for ${moduleCount}x${moduleCount}`
    );
  }

  const matrix: boolean[][] = new Array(moduleCount);
  let idx = 0;
  for (let row = 0; row < moduleCount; row++) {
    const rowData = new Array<boolean>(moduleCount);
    for (let col = 0; col < moduleCount; col++) {
      rowData[col] = packed[idx++] === 1;
    }
    matrix[row] = rowData;
  }
  return matrix;
}
