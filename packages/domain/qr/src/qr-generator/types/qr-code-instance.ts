export interface QRCodeInstance {
  isDark(row: number, col: number): boolean;
  getModuleCount(): number;
  addData(data: string, mode?: string): void;
  make(maskPattern?: number): void;
}
