export function placeOneDataModule(
  modules: (boolean | null)[][],
  row: number,
  col: number,
  interleaved: number[],
  byteIndex: number,
  bitIndex: number,
  maskFunc: (r: number, c: number) => boolean
): { byteIndex: number; bitIndex: number } {
  if (modules[row][col] !== null) {
    return { byteIndex, bitIndex };
  }

  let dark = false;
  if (byteIndex < interleaved.length) {
    dark = ((interleaved[byteIndex] >>> bitIndex) & 1) === 1;
  }
  if (maskFunc(row, col)) {
    dark = !dark;
  }
  modules[row][col] = dark;
  bitIndex--;
  if (bitIndex === -1) {
    byteIndex++;
    bitIndex = 7;
  }
  return { byteIndex, bitIndex };
}
