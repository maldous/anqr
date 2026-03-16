import type { QRBitBuffer, QRDataSegment } from '../../../modules/qr-encoder/types';
import { QRMode } from '../../../modules/qr-encoder/types';

/**
 * Alphanumeric mode encoder (0-9, A-Z, space, $%*+-./:)
 */
export function qrAlphaNum(data: string): QRDataSegment {
  const _mode = QRMode.MODE_ALPHA_NUM;
  const _data = data;

  const getCode = (c: string): number => {
    if (c >= '0' && c <= '9') {
      return c.codePointAt(0)! - '0'.codePointAt(0)!;
    } else if (c >= 'A' && c <= 'Z') {
      return c.codePointAt(0)! - 'A'.codePointAt(0)! + 10;
    } else {
      switch (c) {
        case '\u0020':
          return 36;
        case '$':
          return 37;
        case '%':
          return 38;
        case '*':
          return 39;
        case '+':
          return 40;
        case '-':
          return 41;
        case '.':
          return 42;
        case '/':
          return 43;
        case ':':
          return 44;
        default:
          throw new Error(`illegal char :${c}`);
      }
    }
  };

  return {
    getMode: () => _mode,
    getLength: () => _data.length,
    write: (buffer: QRBitBuffer): void => {
      const s = _data;
      let i = 0;

      while (i + 1 < s.length) {
        buffer.put(getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i)), 6);
      }
    },
  };
}
