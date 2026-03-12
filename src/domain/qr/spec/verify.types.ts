export interface DarkModuleReader {
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

export interface QRVerifyResult {
  ok: boolean;
  version: number;
  issues: string[];
}
