import { FULLWIDTH_ASCII_START } from './fullwidth-ascii-start';

export function mapFullWidthASCII(codePoint: number): number[] | null {
  const offset = codePoint - FULLWIDTH_ASCII_START;
  if (offset === 0) return [0x81, 0x49]; // ！
  // Full-width digits 0-9 (U+FF10-U+FF19) -> 0x824F-0x8258
  if (offset >= 0x0f && offset <= 0x18) {
    return [0x82, 0x4f + (offset - 0x0f)];
  }
  // Full-width uppercase A-Z (U+FF21-U+FF3A) -> 0x8260-0x8279
  if (offset >= 0x20 && offset <= 0x39) {
    const charOffset = offset - 0x20;
    let lowByte = 0x60 + charOffset;
    if (lowByte >= 0x7f) lowByte += 1;
    return [0x82, lowByte];
  }
  // Full-width lowercase a-z (U+FF41-U+FF5A) -> 0x8281-0x829A
  if (offset >= 0x40 && offset <= 0x59) {
    return [0x82, 0x81 + (offset - 0x40)];
  }
  return null;
}
