export const packBooleanMatrix = (matrix: boolean[][]): Uint8Array => {
  const moduleCount = matrix.length;
  const packed = new Uint8Array(moduleCount * moduleCount);

  let idx = 0;
  for (let row = 0; row < moduleCount; row++) {
    const rowData = matrix[row];
    for (let col = 0; col < moduleCount; col++) {
      packed[idx++] = rowData?.[col] ? 1 : 0;
    }
  }

  return packed;
};
