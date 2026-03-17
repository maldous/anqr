import { CharacterSetECI } from "./character-set-eci";
import { StringEncoding } from "./string-encoding";

/**
 * String utilities
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class StringUtils {
  static readonly SHIFT_JIS = "SJIS";
  static readonly GB2312 = "GB2312";
  static readonly ISO88591 = CharacterSetECI.ISO8859_1;
  private static readonly UTF8 = CharacterSetECI.UTF8;

  static castAsNonUtf8Char(code: number, encoding: CharacterSetECI): string {
    const bytes = new Uint8Array([code]);
    return StringEncoding.decode(bytes, encoding);
  }

  static guessEncoding(bytes: Uint8Array, _hints?: Map<number, unknown>): string {
    // Check for BOM
    if (bytes.length > 2 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
      return CharacterSetECI.UTF8.getName();
    }

    // Simple heuristic: check for high bytes which would indicate non-ASCII
    let hasHighBytes = false;
    for (const byte of bytes) {
      if ((byte & 0x80) !== 0) {
        hasHighBytes = true;
        break;
      }
    }

    if (!hasHighBytes) {
      return CharacterSetECI.ISO8859_1.getName();
    }

    // Default to UTF-8
    return CharacterSetECI.UTF8.getName();
  }
}
