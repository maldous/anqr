import { base64DecodeInputStream } from "./base64-decode-input-stream";

export function createStringToBytes(
  unicodeData: string,
  numChars: number,
): (s: string) => number[] {
  const unicodeMap: Record<string, number> = {};
  const bin = base64DecodeInputStream(unicodeData);

  const read = (): number => {
    const b = bin.read();
    if (b === -1) throw new Error("eof");
    return b;
  };

  let count = 0;
  while (true) {
    const b0 = bin.read();
    if (b0 === -1) break;
    const b1 = read();
    const b2 = read();
    const b3 = read();
    const k = String.fromCodePoint((b0 << 8) | b1);
    const v = (b2 << 8) | b3;
    unicodeMap[k] = v;
    count += 1;
  }

  if (count !== numChars) throw new Error(`${count} != ${numChars}`);

  const unknownChar = "?".codePointAt(0)!;

  return (s: string): number[] => {
    const bytes: number[] = [];

    for (let i = 0; i < s.length; i += 1) {
      const c = s.codePointAt(i)!;
      if (c < 128) {
        bytes.push(c);
        continue;
      }

      const b = unicodeMap[s.charAt(i)];
      if (typeof b === "number") {
        if ((b & 0xff) === b) {
          bytes.push(b);
        } else {
            bytes.push(b >>> 8, b & 0xff);
        }
      } else {
        bytes.push(unknownChar);
      }
    }

    return bytes;
  };
}
