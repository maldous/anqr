import type { QRBitBuffer } from "./qr-bit-buffer";

export interface QRDataSegment {
  getMode: () => number;
  getLength: () => number;
  write: (buffer: QRBitBuffer) => void;
}
