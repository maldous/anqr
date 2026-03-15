export function resolveHslHue(max: number, r: number, g: number, b: number, delta: number): number {
  switch (max) {
    case r:
      return ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    case g:
      return ((b - r) / delta + 2) / 6;
    default:
      return ((r - g) / delta + 4) / 6;
  }
}
