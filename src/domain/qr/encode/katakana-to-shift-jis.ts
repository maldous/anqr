import { KATAKANA_START } from './katakana-start';
import { KATAKANA_END } from './katakana-end';

/**
 * Katakana to Shift-JIS mapping
 * Katakana range: U+30A1 to U+30F6 (86 characters)
 * Shift-JIS range: 0x8340 to 0x8396
 *
 * The mapping handles the 0x7F gap and the transition at 0x839F
 */
export function katakanaToShiftJIS(codePoint: number): number[] {
  if (codePoint < KATAKANA_START || codePoint > KATAKANA_END) {
    return [0x3f]; // Not katakana
  }

  const offset = codePoint - KATAKANA_START;
  // Katakana starts at 0x8340 in Shift-JIS
  let sjis = 0x8340 + offset;

  // Handle the 0x7F gap: if low byte would be >= 0x7F, add 1
  let lowByte = sjis & 0xff;
  if (lowByte >= 0x7f) {
    sjis += 1;
    lowByte = sjis & 0xff;
  }

  // Handle transition from 0x83xx to 0x84xx range
  // After 0x839E comes 0x8440 (not 0x839F because that's in Greek range)
  if ((sjis & 0xff00) === 0x8300 && lowByte > 0x9e) {
    const extraOffset = lowByte - 0x9e - 1;
    sjis = 0x8440 + extraOffset;
  }

  return [(sjis >> 8) & 0xff, sjis & 0xff];
}
