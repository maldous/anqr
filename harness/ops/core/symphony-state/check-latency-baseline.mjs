// Generated from ../../../scripts/ops/core/symphony-state.mjs:720

import { getGlobalValue } from "./get-global-value.mjs";
import { setGlobalValue } from "./set-global-value.mjs";

export function checkLatencyBaseline(currentAverageMs) {
  const baseline = getGlobalValue("latency.baseline_ms");
  if (!baseline) {
    setGlobalValue("latency.baseline_ms", currentAverageMs);
    setGlobalValue("latency.baseline_set_at", new Date().toISOString());
    return { alert: false, increase: 0, baseline: currentAverageMs };
  }

  const increase = ((currentAverageMs - baseline) / baseline) * 100;
  const alert = increase > 50; // Alert on >50% increase

  return {
    alert,
    increase: Math.round(increase),
    baseline,
    current: currentAverageMs,
  };
}
