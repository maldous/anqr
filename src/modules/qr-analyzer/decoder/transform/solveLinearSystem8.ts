import {A, b, c, col, for, matrix, n, tmp, v} from '../shared';

export function solveLinearSystem8(Ain: number[][], bin: number[]): number[] {
  const A = Ain.map(r => r.slice());
  const b = bin.slice();
  const n = 8;

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let pivotVal = Math.abs(A[col][col]);
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(A[r][col]);
      if (v > pivotVal) {
        pivotVal = v;
        pivotRow = r;
      }
    }
    if (pivotVal < 1e-12) throw new Error('Homography solve failed: singular matrix');

    if (pivotRow !== col) {
      const tmp = A[col]; A[col] = A[pivotRow]; A[pivotRow] = tmp;
      const tb = b[col]; b[col] = b[pivotRow]; b[pivotRow] = tb;
    }

    const pivot = A[col][col];
    for (let c = col; c < n; c++) A[col][c] /= pivot;
    b[col] /= pivot;

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = A[r][col];
      if (Math.abs(factor) < 1e-12) continue;
      for (let c = col; c < n; c++) A[r][c] -= factor * A[col][c];
      b[r] -= factor * b[col];
    }
  }

  return b;
}

