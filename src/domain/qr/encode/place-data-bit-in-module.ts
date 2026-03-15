export function placeDataBitInModule(
  modules: (boolean | null)[][],
  row: number,
  col: number,
  data: number[],
  maskFunc: (r: number, c: number) => boolean,
  state: { bitIndex: number; byteIndex: number }
): void {
  if (modules[row][col] != null) return;

  let dark = false;
  if (state.byteIndex < data.length) {
    dark = ((data[state.byteIndex] >>> state.bitIndex) & 1) === 1;
  }
  if (maskFunc(row, col)) {
    dark = !dark;
  }
  modules[row][col] = dark;
  state.bitIndex -= 1;
  if (state.bitIndex === -1) {
    state.byteIndex += 1;
    state.bitIndex = 7;
  }
}
