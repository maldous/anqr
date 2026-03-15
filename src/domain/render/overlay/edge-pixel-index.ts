export function edgePixelIndex(width: number, x: number, y: number): number {
  return (y * width + x) * 4;
}
