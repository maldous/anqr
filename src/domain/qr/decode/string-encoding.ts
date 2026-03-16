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
      for (let i = 0; i < bytes.length; i++) {
        let h = bytes[i].toString(16);
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
    const encodedURIstring = btoa(unescape(encodeURIComponent(s))); // NOSONAR: classic btoa-Unicode pattern, TextEncoder used elsewhere
    const charList = encodedURIstring.split("");
    const uintArray: number[] = [];
    for (let i = 0; i < charList.length; i++) {
      uintArray.push(charList[i].codePointAt(0)!);
    }
    return new Uint8Array(uintArray);
  }
}
