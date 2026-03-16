import type { QRBitBuffer, QRDataSegment } from "../../../modules/qr-encoder/types";
import { QRMode } from "../../../modules/qr-encoder/types";

/**
 * Numeric mode encoder (0-9 only)
 */
export function qrNumber(data: string): QRDataSegment {
  const _mode = QRMode.MODE_NUMBER;
  const _data = data;

  const strToNum = (s: string): number => {
    let num = 0;
    for (let i = 0; i < s.length; i += 1) {
      num = num * 10 + charToNum(s.charAt(i));
    }
    return num;
  };

  const charToNum = (c: string): number => {
    if (c >= "0" && c <= "9") {
      return c.codePointAt(0)! - "0".codePointAt(0)!;
    }
    throw new Error(`illegal char :${c}`);
  };

  return {
    getMode: () => _mode,
    getLength: () => _data.length,
    write: (buffer: QRBitBuffer): void => {
      let i = 0;

      while (i + 2 < _data.length) {
        buffer.put(strToNum(_data.substring(i, i + 3)), 10);
        i += 3;
      }

      if (i < _data.length) {
        if (_data.length - i === 1) {
          buffer.put(strToNum(_data.substring(i, i + 1)), 4);
        } else if (_data.length - i === 2) {
          buffer.put(strToNum(_data.substring(i, i + 2)), 7);
        }
      }
    },
  };
}
