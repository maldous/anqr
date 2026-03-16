import type { QRCodeInstance } from "./types";

export abstract class BaseMatrixWrapper implements QRCodeInstance {
  protected readonly moduleCount: number;

  protected constructor(moduleCount: number) {
    this.moduleCount = moduleCount;
  }

  abstract addData(data: string, mode?: string): void;

  abstract make(maskPattern?: number): void;

  getModuleCount(): number {
    return this.moduleCount;
  }

  abstract isDark(row: number, col: number): boolean;
}
