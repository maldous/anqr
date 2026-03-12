export function patternAboutEquals(
  patternX: number,
  patternY: number,
  patternModuleSize: number,
  moduleSize: number,
  i: number,
  j: number
): boolean {
  if (Math.abs(i - patternY) <= moduleSize && Math.abs(j - patternX) <= moduleSize) {
    const moduleSizeDiff = Math.abs(moduleSize - patternModuleSize);
    return moduleSizeDiff <= 1 || moduleSizeDiff <= patternModuleSize;
  }
  return false;
}

