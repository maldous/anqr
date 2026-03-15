export function drawSingleAlignmentPattern(
  modules: (boolean | null)[][],
  row: number,
  col: number
): void {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
        modules[row + r][col + c] = true;
      } else {
        modules[row + r][col + c] = false;
      }
    }
  }
}
