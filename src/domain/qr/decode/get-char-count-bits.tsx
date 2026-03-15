import {
  MODE_ALPHANUMERIC,
  MODE_BYTE,
  MODE_KANJI,
  MODE_NUMERIC,
} from '../../../modules/qr-decoder/types';

/**
 * Get the number of bits for character count indicator
 */
export function getCharCountBits(mode: number, version: number): number {
  if (version <= 9) {
    switch (mode) {
      case MODE_NUMERIC:
        return 10;
      case MODE_ALPHANUMERIC:
        return 9;
      case MODE_BYTE:
        return 8;
      case MODE_KANJI:
        return 8;
    }
  } else if (version <= 26) {
    switch (mode) {
      case MODE_NUMERIC:
        return 12;
      case MODE_ALPHANUMERIC:
        return 11;
      case MODE_BYTE:
        return 16;
      case MODE_KANJI:
        return 10;
    }
  } else {
    switch (mode) {
      case MODE_NUMERIC:
        return 14;
      case MODE_ALPHANUMERIC:
        return 13;
      case MODE_BYTE:
        return 16;
      case MODE_KANJI:
        return 12;
    }
  }
  return 8;
}
