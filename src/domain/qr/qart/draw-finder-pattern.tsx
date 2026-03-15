export function drawFinderPattern(
  modules: (boolean | null)[][],
  moduleCount: number,
  centerRow: number,
  centerCol: number
): void {
  for (let r = -1; r <= 7; r++) {
    if (centerRow + r < 0 || centerRow + r >= moduleCount) continue;
    for (let c = -1; c <= 7; c++) {
      if (centerCol + c < 0 || centerCol + c >= moduleCount) continue;
      if (
        (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
        (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
        (2 <= r && r <= 4 && 2 <= c && c <= 4)
      ) {
        modules[centerRow + r][centerCol + c] = true;
      } else {
        modules[centerRow + r][centerCol + c] = false;
      }
    }
  }
}
