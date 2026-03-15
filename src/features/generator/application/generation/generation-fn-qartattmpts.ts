/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Compute QArt search attempts from iteration count.
 */

export function getQArtSearchAttempts(iterations: number | undefined): number {
  if (typeof iterations !== 'number' || !Number.isFinite(iterations)) return 1;
  return Math.max(1, Math.min(5, Math.round(iterations / 10000)));
}
