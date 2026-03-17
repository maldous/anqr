export function diffMatrices(a: boolean[][], b: boolean[][]) {
  const rows = Math.min(a.length, b.length);
  const cols = rows ? Math.min(a[0].length, b[0].length) : 0;
  let diffCount = 0;
  let firstDiff: { row: number; col: number; a: boolean; b: boolean } | null = null;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (a[row][col] === b[row][col]) {
        continue;
      }

      diffCount += 1;
      firstDiff ??= { row, col, a: a[row][col], b: b[row][col] };
    }
  }

  const total = rows * cols;
  return { rows, cols, diffCount, diffPct: total ? diffCount / total : 0, firstDiff };
}
