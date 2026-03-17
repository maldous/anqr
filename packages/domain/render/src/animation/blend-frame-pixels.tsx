// ============================================
// INTERNAL HELPERS
// ============================================

export function blendFramePixels(
  sourceA: Uint8ClampedArray,
  sourceB: Uint8ClampedArray,
  blend: number,
  output: Uint8ClampedArray,
): void {
  for (let p = 0; p < sourceA.length; p += 4) {
    output[p] = Math.round(sourceA[p] * (1 - blend) + sourceB[p] * blend);
    output[p + 1] = Math.round(sourceA[p + 1] * (1 - blend) + sourceB[p + 1] * blend);
    output[p + 2] = Math.round(sourceA[p + 2] * (1 - blend) + sourceB[p + 2] * blend);
    output[p + 3] = Math.round(sourceA[p + 3] * (1 - blend) + sourceB[p + 3] * blend);
  }
}
