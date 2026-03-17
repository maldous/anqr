import { CharacterSetECI } from "./character-set-eci";

/**
 * String encoding/decoding utilities
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class StringEncoding {
  static readonly customDecoder: ((bytes: Uint8Array, encodingName: string) => string) | null =
    null;
  static readonly customEncoder: ((s: string, encodingName: string) => Uint8Array) | null = null;

  static decode(bytes: Uint8Array, encoding: string | CharacterSetECI): string {
    const encodingName = StringEncoding.encodingName(encoding);

    if (StringEncoding.customDecoder) {
      return StringEncoding.customDecoder(bytes, encodingName);
    }

    if (typeof TextDecoder === "undefined" || StringEncoding.shouldDecodeOnFallback(encodingName)) {
      return StringEncoding.decodeFallback(bytes, encodingName);
    }

    return new TextDecoder(encodingName).decode(bytes);
  }

  private static shouldDecodeOnFallback(encodingName: string): boolean {
    return !StringEncoding.isBrowser() && encodingName === "ISO-8859-1";
  }

  static encode(s: string, encoding: string | CharacterSetECI): Uint8Array {
    const encodingName = StringEncoding.encodingName(encoding);

    if (StringEncoding.customEncoder) {
      return StringEncoding.customEncoder(s, encodingName);
    }

    if (typeof TextEncoder === "undefined") {
      return StringEncoding.encodeFallback(s);
    }

    return new TextEncoder().encode(s);
  }

  private static isBrowser(): boolean {
    return (
      typeof globalThis !== "undefined" &&
      Object.prototype.toString.call(globalThis) === "[object Window]"
    );
  }

  static encodingName(encoding: string | CharacterSetECI): string {
    return typeof encoding === "string" ? encoding : encoding.getName();
  }

  static encodingCharacterSet(encoding: string | CharacterSetECI): CharacterSetECI | null {
    if (encoding instanceof CharacterSetECI) {
      return encoding;
    }
    return CharacterSetECI.getCharacterSetECIByName(encoding);
  }

  private static decodeFallback(bytes: Uint8Array, encoding: string | CharacterSetECI): string {
    const characterSet = StringEncoding.encodingCharacterSet(encoding);

    if (characterSet && StringEncoding.isDecodeFallbackSupported(characterSet)) {
      let s = "";
      for (const byte of bytes) {
        let h = byte.toString(16);
        if (h.length < 2) h = `0${h}`;
        s += `%${h}`;
      }
      return decodeURIComponent(s);
    }

    if (characterSet?.equals(CharacterSetECI.UnicodeBigUnmarked)) {
      return String.fromCharCode.apply(null, Array.from(new Uint16Array(bytes.buffer)));
    }

    throw new Error(`Encoding ${StringEncoding.encodingName(encoding)} not supported by fallback.`);
  }

  private static isDecodeFallbackSupported(characterSet: CharacterSetECI): boolean {
    return (
      characterSet.equals(CharacterSetECI.UTF8) ||
      characterSet.equals(CharacterSetECI.ISO8859_1) ||
      characterSet.equals(CharacterSetECI.ASCII)
    );
  }

  private static encodeFallback(s: string): Uint8Array {
    const encoded = encodeURIComponent(s);
    let binaryStr = "";
    let i = 0;
    while (i < encoded.length) {
      if (encoded[i] === "%" && i + 2 < encoded.length) {
        binaryStr += String.fromCodePoint(Number.parseInt(encoded.substring(i + 1, i + 3), 16));
        i += 3;
      } else {
        binaryStr += encoded[i];
        i += 1;
      }
    }
    const base64Str = btoa(binaryStr);
    const result = new Uint8Array(base64Str.length);
    for (let j = 0; j < base64Str.length; j++) {
      result[j] = base64Str.codePointAt(j)!;
    }
    return result;
  }
}
