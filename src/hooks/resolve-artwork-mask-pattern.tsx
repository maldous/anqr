export function resolveArtworkMaskPattern(
  useAutoMask: boolean,
  artworkLockedMask: number,
  configMaskPattern: number,
): number | undefined {
  if (useAutoMask && artworkLockedMask < 0) return undefined;
  if (artworkLockedMask >= 0) return artworkLockedMask;
  return configMaskPattern;
}
