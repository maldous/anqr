import { BaseMatrixWrapper } from "./base-matrix-wrapper";

export class PackedMatrixWrapper extends BaseMatrixWrapper {
  private readonly packed: Uint8Array;

  constructor(packed: Uint8Array, moduleCount: number) {
    super(moduleCount);
    this.packed = packed;
  }

  addData(_data: string, _mode?: string): void {
    return undefined;
  }

  make(_maskPattern?: number): void {
    throw new Error("PackedMatrixWrapper.make is not supported");
  }

  isDark(row: number, col: number): boolean {
    if (row < 0 || col < 0 || row >= this.moduleCount || col >= this.moduleCount) return false;
    return this.packed[row * this.moduleCount + col] === 1;
  }
}
