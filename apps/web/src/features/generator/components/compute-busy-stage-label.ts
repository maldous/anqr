export function computeBusyStageLabel(
  busyStage: string | null,
  isPending: boolean,
  isPreparingAnimation: boolean,
  t: (key: string, defaultValue: string) => string,
): string {
  if (busyStage) return busyStage;
  if (isPending)
    return t("preview.busy.waitingForThingsToSettle", "Waiting for things to settle...");
  if (isPreparingAnimation) {
    return t("preview.busy.gettingAnimationPreviewReady", "Getting the animation preview ready...");
  }
  return t("preview.busy.generatingPreview", "Generating your preview...");
}
