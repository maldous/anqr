import type { QRCodeInstance } from './types';

function ignoreWrapperArgs(...args: unknown[]): number {
  return args.length;
}

export abstract class BaseMatrixWrapper implements QRCodeInstance {
  protected readonly moduleCount: number;

  protected constructor(moduleCount: number) {
    this.moduleCount = moduleCount;
  }

  addData(_data: string, _mode?: string): void {
    ignoreWrapperArgs(_data, _mode);
  }

  make(_maskPattern?: number): void {
    ignoreWrapperArgs(_maskPattern);
  }

  getModuleCount(): number {
    return this.moduleCount;
  }

  abstract isDark(row: number, col: number): boolean;
}
