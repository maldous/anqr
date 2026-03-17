export function clampN(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
