import type { QRCodeInstance } from './types';

export abstract class BaseMatrixWrapper implements QRCodeInstance {
  protected readonly moduleCount: number;

  protected constructor(moduleCount: number) {
    this.moduleCount = moduleCount;
  }

  addData(_data: string, _mode?: string): void {
    void [_data, _mode];
  }

  make(_maskPattern?: number): void {
    void _maskPattern;
  }

  getModuleCount(): number {
    return this.moduleCount;
  }

  abstract isDark(row: number, col: number): boolean;
}
