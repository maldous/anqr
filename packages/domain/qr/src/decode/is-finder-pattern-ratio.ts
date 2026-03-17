/**
 * Check if the state counts represent a valid finder pattern (1:1:3:1:1 ratio)
 * Note: This is different from qr-spec's isFinderPattern which checks coordinates.
 * This function validates the pixel ratio pattern during scanning.
 */
/**
 * Check if edge counts match finder pattern ratio (1:1:3:1:1)
 * Note: This is different from qr-spec's isFinderPattern which checks position
 */
export function isFinderPatternRatio(counts: number[]): boolean {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total < 7) return false;

  const moduleSize = total / 7;
  const tolerance = moduleSize * 0.5;

  return (
    Math.abs(counts[0] - moduleSize) < tolerance &&
    Math.abs(counts[1] - moduleSize) < tolerance &&
    Math.abs(counts[2] - 3 * moduleSize) < tolerance &&
    Math.abs(counts[3] - moduleSize) < tolerance &&
    Math.abs(counts[4] - moduleSize) < tolerance
  );
}
