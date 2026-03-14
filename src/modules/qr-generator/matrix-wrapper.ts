import type { QRCodeInstance } from './types';

export class MatrixWrapper implements QRCodeInstance {
  private readonly matrix: boolean[][];
  private readonly moduleCount: number;

  constructor(matrix: boolean[][]) {
    this.matrix = matrix;
    this.moduleCount = matrix.length;
  }

  addData(_data: string, _mode?: string): void {}

  make(_maskPattern?: number): void {}

  getModuleCount(): number {
    return this.moduleCount;
  }

  isDark(row: number, col: number): boolean {
    return this.matrix[row]?.[col] ?? false;
  }
}
