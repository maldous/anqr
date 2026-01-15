import {QR_MODE, bit, mode} from '../shared';
/**
 * Get character count bit length based on mode and version
 */
export function getCharCountBits(mode: number, version: number): number {
  if (version >= 1 && version <= 9) {
    switch (mode) {
      case QR_MODE.NUMERIC: return 10;
      case QR_MODE.ALPHANUMERIC: return 9;
      case QR_MODE.BYTE: return 8;
      case QR_MODE.KANJI: return 8;
      default: return 8;
    }
  } else if (version >= 10 && version <= 26) {
    switch (mode) {
      case QR_MODE.NUMERIC: return 12;
      case QR_MODE.ALPHANUMERIC: return 11;
      case QR_MODE.BYTE: return 16;
      case QR_MODE.KANJI: return 10;
      default: return 16;
    }
  } else {
    switch (mode) {
      case QR_MODE.NUMERIC: return 14;
      case QR_MODE.ALPHANUMERIC: return 13;
      case QR_MODE.BYTE: return 16;
      case QR_MODE.KANJI: return 12;
      default: return 16;
    }
  }
}

