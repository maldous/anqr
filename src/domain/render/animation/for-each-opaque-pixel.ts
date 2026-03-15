export function forEachOpaquePixel(
  data: Uint8ClampedArray,
  visit: (index: number, r: number, g: number, b: number, isDark: boolean) => void
): void {
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) continue;

    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    visit(index, r, g, b, (r + g + b) / 3 < 128);
  }
}
