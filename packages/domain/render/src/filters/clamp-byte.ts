export function clampByte(v: number): number {
  if (v <= 0) return 0;
  if (v >= 255) return 255;
  return Math.round(v);
}
