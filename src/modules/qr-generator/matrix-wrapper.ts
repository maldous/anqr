import { BaseMatrixWrapper } from './base-matrix-wrapper';

export class MatrixWrapper extends BaseMatrixWrapper {
  private readonly matrix: boolean[][];

  constructor(matrix: boolean[][]) {
    super(matrix.length);
    this.matrix = matrix;
  }

  addData(_data: string, _mode?: string): void {
    return undefined;
  }

  make(_maskPattern?: number): void {
    throw new Error('MatrixWrapper.make is not supported');
  }

  isDark(row: number, col: number): boolean {
    return this.matrix[row]?.[col] ?? false;
  }
}
