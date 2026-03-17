/**
 * Convert a binary matrix row back to block bytes
 */
export function matrixRowToBytes(row: boolean[], byteCount: number): Uint8Array {
  const bytes = new Uint8Array(byteCount);
  for (let byteIdx = 0; byteIdx < byteCount; byteIdx++) {
    let byte = 0;
    for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
      const rowIdx = byteIdx * 8 + bitIdx;
      if (rowIdx < row.length && row[rowIdx]) {
        byte |= 1 << (7 - bitIdx);
      }
    }
    bytes[byteIdx] = byte;
  }
  return bytes;
}
