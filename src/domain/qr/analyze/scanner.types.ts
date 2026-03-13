export type { ScanResult } from './scan-result';
export type { ValidationResult } from './scan-validation-result';

export interface QRLocation {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
}
