/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Check if frame is a noisy outlier.
 */

export function isNoisyOutlierMatchCheck(
  matchPercentage: number,
  frameIdx: number,
  lastSuccessfulMatchPercentage: number
): boolean {
  const minOutlierMatchPercent = 58;
  const maxAllowedMatchDrop = 12;
  if (!Number.isFinite(matchPercentage)) return true;
  if (frameIdx === 0) return false;
  if (lastSuccessfulMatchPercentage < 0) {
    return matchPercentage < minOutlierMatchPercent;
  }
  const dynamicFloor = Math.max(
    minOutlierMatchPercent,
    lastSuccessfulMatchPercentage - maxAllowedMatchDrop
  );
  return matchPercentage < dynamicFloor;
}

