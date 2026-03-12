export function pixelIndex(x: number, y: number, stride: number): number {
  return y * stride + x;
}
