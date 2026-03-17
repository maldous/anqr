/**
 * Compute darkening factor for overlay colors on dark QR modules.
 * Scales linearly: at intensity 0 → 1 (no darkening), at intensity 1 → minFactor.
 * Each overlay mode can pass its own minFactor to set the maximum darkening at full intensity.
 */
export function computeDarkFactor(intensity: number, minFactor: number = 0.55): number {
  const i = Math.max(0, Math.min(1, intensity));
  return 1 - (1 - minFactor) * i;
}
