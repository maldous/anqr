/**
 * Calculate safe overlay intensity based on ECC level
 */
export function calculateSafeIntensity(eccLevel: string): number {
  const intensityByEcc: Record<string, number> = {
    L: 30,
    M: 50,
    Q: 70,
    H: 85,
  };
  return intensityByEcc[eccLevel] ?? 50;
}
