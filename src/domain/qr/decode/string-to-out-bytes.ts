export function stringToOutBytes(text: string): number[] {
  return Array.from(text, (char) => char.codePointAt(0)! & 0xff);
}
