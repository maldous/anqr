export function base64DecodeChar(c: number): number {
  if (c >= 0x41 && c <= 0x5a) return c - 0x41;
  if (c >= 0x61 && c <= 0x7a) return c - 0x61 + 26;
  if (c >= 0x30 && c <= 0x39) return c - 0x30 + 52;
  if (c === 0x2b) return 62;
  if (c === 0x2f) return 63;
  throw new Error(`c:${c}`);
}
