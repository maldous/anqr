export function curveIntensity(pct: number): number {
  const t = Math.max(0, Math.min(1, (pct ?? 100) / 100));
  return t * t * t * t;
}
