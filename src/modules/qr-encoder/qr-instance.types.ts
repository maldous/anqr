export interface QRInstance {
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
  make(maskPattern?: number): void;
  addData(data: string, mode?: string): void;
}
