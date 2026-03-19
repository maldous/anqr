import type { QRLocation } from "./qr-location.contract";

export interface ScanResult {
  data: string | null;
  location: QRLocation | null;
  binaryData?: Uint8Array;
}
