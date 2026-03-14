import type { QRCodeInstance } from './types';

export class PackedMatrixWrapper implements QRCodeInstance {
  private readonly packed: Uint8Array;
  private readonly moduleCount: number;

  constructor(packed: Uint8Array, moduleCount: number) {
    this.packed = packed;
    this.moduleCount = moduleCount;
  }

  addData(_data: string, _mode?: string): void {}

  make(_maskPattern?: number): void {}

  getModuleCount(): number {
    return this.moduleCount;
  }

  isDark(row: number, col: number): boolean {
    if (row < 0 || col < 0 || row >= this.moduleCount || col >= this.moduleCount) return false;
    return this.packed[row * this.moduleCount + col] === 1;
  }
}
