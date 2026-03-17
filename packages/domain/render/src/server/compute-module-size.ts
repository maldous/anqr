export function computeModuleSize(
  modulePxParam: number | undefined,
  size: number,
  totalMargin: number,
  estimatedModuleCount: number,
): number {
  if (modulePxParam) {
    return Math.max(1, Math.min(50, modulePxParam));
  }
  return Math.max(
    1,
    Math.floor((size - totalMargin * 2) / (estimatedModuleCount + totalMargin * 2)),
  );
}
