import type { QRCodeInstance } from './types';

export abstract class BaseMatrixWrapper implements QRCodeInstance {
  protected readonly moduleCount: number;

  protected constructor(moduleCount: number) {
    this.moduleCount = moduleCount;
  }

  addData(_data: string, _mode?: string): void {}

  make(_maskPattern?: number): void {}

  getModuleCount(): number {
    return this.moduleCount;
  }

  abstract isDark(row: number, col: number): boolean;
}
