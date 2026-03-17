export function grayAt(data: Uint8ClampedArray, idx: number): number {
  const a = data[idx + 3] / 255;
  if (a <= 0) return 255;
  if (a >= 1) return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  const inv = 1 - a;
  const r = data[idx] * a + 255 * inv;
  const g = data[idx + 1] * a + 255 * inv;
  const b = data[idx + 2] * a + 255 * inv;
  return (r + g + b) / 3;
}
