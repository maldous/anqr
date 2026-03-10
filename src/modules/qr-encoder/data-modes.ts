/**
 * QR Data Mode Encoders
 * Encoders for different QR data modes: Numeric, Alphanumeric, Byte, Kanji
 */

import { createLogger } from '../../lib/logger';

// Note: We import the function getter to allow runtime changes to stringToBytes
import { stringToBytesFn } from './string-bytes';
import type { QRBitBuffer, QRDataSegment } from './types';
import { QRMode } from './types';

const _log = createLogger('ENCODER');

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
    if ('0' <= c && c <= '9') {
      return c.codePointAt(0)! - '0'.codePointAt(0)!;
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

/**
 * Alphanumeric mode encoder (0-9, A-Z, space, $%*+-./:)
 */
export function qrAlphaNum(data: string): QRDataSegment {
  const _mode = QRMode.MODE_ALPHA_NUM;
  const _data = data;

  const getCode = (c: string): number => {
    if ('0' <= c && c <= '9') {
      return c.codePointAt(0)! - '0'.codePointAt(0)!;
    } else if ('A' <= c && c <= 'Z') {
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

/**
 * Kanji mode encoder (Shift-JIS)
 */
export function qrKanji(data: string): QRDataSegment {
  const _mode = QRMode.MODE_KANJI;

  // Self test for sjis support
  const test = stringToBytesFn('\u53cb');
  if (test.length !== 2 || ((test[0] << 8) | test[1]) !== 0x9746) {
    throw new Error('sjis not supported.');
  }

  const _bytes = stringToBytesFn(data);

  return {
    getMode: () => _mode,
    getLength: () => Math.trunc(_bytes.length / 2),
    write: (buffer: QRBitBuffer): void => {
      let i = 0;

      while (i + 1 < _bytes.length) {
        let c = ((0xff & _bytes[i]) << 8) | (0xff & _bytes[i + 1]);

        if (0x8140 <= c && c <= 0x9ffc) {
          c -= 0x8140;
        } else if (0xe040 <= c && c <= 0xebbf) {
          c -= 0xc140;
        } else {
          throw new Error(`illegal char at ${i + 1}/${c}`);
        }

        c = ((c >>> 8) & 0xff) * 0xc0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < _bytes.length) {
        throw new Error(`illegal char at ${i + 1}`);
      }
    },
  };
}
