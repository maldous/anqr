export interface QRCodeObject {
  isDark(row: number, col: number): boolean;
  getModuleCount(): number;
}
