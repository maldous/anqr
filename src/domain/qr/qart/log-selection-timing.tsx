import { log } from "./log";

export function logSelectionTiming(
  timingEnabled: boolean,
  timingMarks: Record<string, number>,
  preReduceTargetCount: number | undefined,
  totalSelected: number,
): void {
  if (!timingEnabled) return;
  const t = timingMarks;
  log.info("QART selection timing", {
    selectMs:
      t.select_done && t.select_start ? (t.select_done - t.select_start).toFixed(1) : undefined,
    eccApplyMs:
      t.ecc_apply_done && t.ecc_apply_start
        ? (t.ecc_apply_done - t.ecc_apply_start).toFixed(1)
        : undefined,
    flattenMs:
      t.flatten_done && t.flatten_start ? (t.flatten_done - t.flatten_start).toFixed(1) : undefined,
    numericFilterMs:
      t.numeric_filter_done && t.numeric_filter_start
        ? (t.numeric_filter_done - t.numeric_filter_start).toFixed(1)
        : undefined,
    preReduceTargetCount,
    totalSelected,
  });
}
