function toHex(value: number): string {
  return Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, '0');
}

export function rgbaToHex(r: number, g: number, b: number, a = 1): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a * 255)}`;
}
