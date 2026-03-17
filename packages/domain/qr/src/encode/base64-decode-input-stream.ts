import { base64DecodeChar } from "./base64-decode-char";

export function base64DecodeInputStream(str: string) {
  let pos = 0;
  let buffer = 0;
  let buflen = 0;

  return {
    read: (): number => {
      while (buflen < 8) {
        if (pos >= str.length) {
          if (buflen === 0) return -1;
          throw new Error(`unexpected end of file./${buflen}`);
        }

        const c = str.charAt(pos);
        pos += 1;

        if (c === "=") {
          buflen = 0;
          return -1;
        }

        if (/^\s$/.test(c)) continue;

        buffer = (buffer << 6) | base64DecodeChar(c.codePointAt(0)!);
        buflen += 6;
      }

      const n = (buffer >>> (buflen - 8)) & 0xff;
      buflen -= 8;
      return n;
    },
  };
}
