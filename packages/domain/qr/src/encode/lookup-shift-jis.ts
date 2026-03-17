import { HIRAGANA_START } from "./hiragana-start";
import { HIRAGANA_END } from "./hiragana-end";
import { KATAKANA_START } from "./katakana-start";
import { KATAKANA_END } from "./katakana-end";
import { HW_KATAKANA_START } from "./hw-katakana-start";
import { HW_KATAKANA_END } from "./hw-katakana-end";
import { HW_KATAKANA_SJIS_START } from "./hw-katakana-sjis-start";
import { FULLWIDTH_ASCII_START } from "./fullwidth-ascii-start";
import { FULLWIDTH_ASCII_END } from "./fullwidth-ascii-end";
import { FULLWIDTH_MAP } from "./fullwidth-map";
import { KANJI_MAP } from "./kanji-map";
import { hiraganaToShiftJIS } from "./hiragana-to-shift-jis";
import { katakanaToShiftJIS } from "./katakana-to-shift-jis";
import { mapFullWidthASCII } from "./map-full-width-ascii";

export function lookupShiftJIS(codePoint: number): number[] | null {
  if (codePoint < 0x80) return [codePoint];
  if (codePoint >= HW_KATAKANA_START && codePoint <= HW_KATAKANA_END) {
    return [HW_KATAKANA_SJIS_START + (codePoint - HW_KATAKANA_START)];
  }
  if (codePoint >= HIRAGANA_START && codePoint <= HIRAGANA_END) {
    return hiraganaToShiftJIS(codePoint);
  }
  if (codePoint >= KATAKANA_START && codePoint <= KATAKANA_END) {
    return katakanaToShiftJIS(codePoint);
  }
  if (FULLWIDTH_MAP[codePoint] !== undefined) {
    const sjis = FULLWIDTH_MAP[codePoint];
    return [(sjis >> 8) & 0xff, sjis & 0xff];
  }
  if (codePoint >= FULLWIDTH_ASCII_START && codePoint <= FULLWIDTH_ASCII_END) {
    return mapFullWidthASCII(codePoint);
  }
  if (KANJI_MAP[codePoint] !== undefined) {
    const sjis = KANJI_MAP[codePoint];
    return [(sjis >> 8) & 0xff, sjis & 0xff];
  }
  return null;
}
