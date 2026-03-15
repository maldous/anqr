import { BaseMatrixWrapper } from './base-matrix-wrapper';

export class MatrixWrapper extends BaseMatrixWrapper {
  private readonly matrix: boolean[][];

  constructor(matrix: boolean[][]) {
    super(matrix.length);
    this.matrix = matrix;
  }

  isDark(row: number, col: number): boolean {
    return this.matrix[row]?.[col] ?? false;
  }
}
