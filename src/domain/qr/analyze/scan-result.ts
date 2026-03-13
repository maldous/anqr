import type { QRLocation } from './scanner.types';

export interface ScanResult {
  data: string | null;
  location: QRLocation | null;
  binaryData?: Uint8Array;
}
