import type { QRErrorCorrectionLevel } from "./qr-error-correction-level.const";

export type QRErrorCorrectionLevelChar = "L" | "M" | "Q" | "H";
export type QRErrorCorrectionLevelType =
  (typeof QRErrorCorrectionLevel)[keyof typeof QRErrorCorrectionLevel];
