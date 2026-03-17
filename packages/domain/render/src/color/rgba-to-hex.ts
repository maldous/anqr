export function rgbaToHex(r: number, g: number, b: number, a = 1): string {
  const encode = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");

  return `#${encode(r)}${encode(g)}${encode(b)}${encode(a * 255)}`;
}
