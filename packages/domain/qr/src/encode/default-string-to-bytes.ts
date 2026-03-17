export function defaultStringToBytes(s: string): number[] {
  const bytes: number[] = [];

  for (let i = 0; i < s.length; i += 1) {
    const c = s.codePointAt(i)!;
    bytes.push(c & 0xff);
  }

  return bytes;
}
