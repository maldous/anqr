export function applyBrightnessCurve(
  brightness: number,
  curve: string | number | undefined
): number {
  if (curve === 's-curve' || curve === 's_curve') {
    return brightness * brightness * (3 - 2 * brightness);
  }
  if (curve === 'gamma') {
    return brightness ** 0.7;
  }
  return brightness;
}
