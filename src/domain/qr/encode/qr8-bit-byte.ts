import { stringToBytesFn } from "./string-bytes";
import type { QRBitBuffer, QRDataSegment } from "../../../modules/qr-encoder/types";
import { QRMode } from "../../../modules/qr-encoder/types";

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
      for (let i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    },
  };
}
