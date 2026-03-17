/**
 * Compute blend amount toward white for overlay colors on light QR modules.
 * Scales linearly: at intensity 0 → 0 (no lightening), at intensity 1 → maxBlend.
 */
export function computeLightBlend(intensity: number, maxBlend: number = 0.4): number {
  const i = Math.max(0, Math.min(1, intensity));
  return maxBlend * i;
}
