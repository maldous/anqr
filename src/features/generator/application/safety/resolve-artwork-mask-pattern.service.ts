/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Resolve artwork mask pattern from config.
 */

export function resolveArtworkMaskPattern(
  useAutoMask: boolean,
  artworkLockedMask: number,
  configMaskPattern: number,
): number | undefined {
  if (useAutoMask && artworkLockedMask < 0) return undefined;
  if (artworkLockedMask >= 0) return artworkLockedMask;
  return configMaskPattern;
}
