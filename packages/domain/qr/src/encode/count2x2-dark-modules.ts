import type { QRCodeInstance } from "../qr-encoder/types";

export function count2x2DarkModules(qrcode: QRCodeInstance, row: number, col: number): number {
  let count = 0;
  if (qrcode.isDark(row, col)) count += 1;
  if (qrcode.isDark(row + 1, col)) count += 1;
  if (qrcode.isDark(row, col + 1)) count += 1;
  if (qrcode.isDark(row + 1, col + 1)) count += 1;
  return count;
}
