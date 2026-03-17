export function computeBusyPercent(
  busyProgress: number | null,
  isPending: boolean,
  isPreparingAnimation: boolean,
  isRendering: boolean,
  isLoading: boolean,
): number | null {
  if (typeof busyProgress === "number") return busyProgress;
  if (isPending) return 12;
  if (isPreparingAnimation) return 24;
  if (isRendering || isLoading) return 48;
  return null;
}
