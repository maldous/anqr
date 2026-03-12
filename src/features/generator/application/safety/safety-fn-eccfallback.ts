/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Build ECC fallback sequence for overflow recovery.
 */

export function buildEccFallbackSequence(
  currentEcc: string,
  typeNumber: number
): readonly ('H' | 'Q' | 'M' | 'L')[] {
  const allEccLevels = ['H', 'Q', 'M', 'L'] as const;
  const eccIndex = allEccLevels.indexOf(currentEcc as (typeof allEccLevels)[number]);
  const startIndex = typeNumber === 0 ? Math.max(0, eccIndex + 1) : Math.max(0, eccIndex);
  const eccToTry = allEccLevels.slice(startIndex);
  if (eccToTry.length === 0) {
    return ['L'] as const;
  }
  return eccToTry;
}

