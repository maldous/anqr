import { HIRAGANA_START } from './hiragana-start';
import { HIRAGANA_END } from './hiragana-end';

/**
 * Hiragana to Shift-JIS mapping
 * Hiragana range: U+3041 to U+3096 (86 characters)
 * Shift-JIS range: 0x829F to 0x82F1
 *
 * The mapping handles the 0x7F gap in Shift-JIS (skips 0x827F)
 */
export function hiraganaToShiftJIS(codePoint: number): number[] {
  if (codePoint < HIRAGANA_START || codePoint > HIRAGANA_END) {
    return [0x3f]; // Not hiragana
  }

  const offset = codePoint - HIRAGANA_START;
  // Hiragana starts at 0x829F in Shift-JIS
  // But Shift-JIS skips 0x7F in the low byte, so we need to adjust
  let sjis = 0x829f + offset;

  // If low byte is >= 0x7F, we need to add 1 to skip the gap
  const lowByte = sjis & 0xff;
  if (lowByte >= 0x7f) {
    sjis += 1;
  }

  return [(sjis >> 8) & 0xff, sjis & 0xff];
}
