import { stringToBytesFn } from "./string-bytes";
import type { QRBitBuffer, QRDataSegment } from "../qr-encoder/types";
import { QRMode } from "../qr-encoder/types";

/**
 * 8-bit byte mode encoder
 */
export function qr8BitByte(data: string): QRDataSegment {
  const _mode = QRMode.MODE_8BIT_BYTE;
  const _bytes = stringToBytesFn(data);

  return {
    getMode: () => _mode,
    getLength: () => _bytes.length,
    write: (buffer: QRBitBuffer): void => {
      for (const byte of _bytes) {
        buffer.put(byte, 8);
      }
    },
  };
}
