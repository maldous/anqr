import type { QRErrorCorrectionLevel } from './qr-error-correction-level';

export type QRErrorCorrectionLevelType =
  (typeof QRErrorCorrectionLevel)[keyof typeof QRErrorCorrectionLevel];
