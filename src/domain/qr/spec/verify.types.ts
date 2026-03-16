export type { QRVerifyResult } from "./qr-verify-result";

export interface DarkModuleReader {
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}
