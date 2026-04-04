// Generated from ../../../scripts/ops/reporting/harness-report.mjs:404

export async function checkPipelineLatency() {
  try {
    const { getLatencyMetrics, checkLatencyBaseline } =
      await import("../../core/symphony-state.mjs");
    const metrics = getLatencyMetrics();

    if (metrics.count === 0) {
      return { pass: true, detail: "No completed tasks yet — latency baseline not established" };
    }

    const avgMinutes = (metrics.averageMs / 60000).toFixed(1);
    const p95Minutes = (metrics.p95Ms / 60000).toFixed(1);
    const targetMs = 10 * 60 * 1000; // 10 min target
    const acceptableMs = 30 * 60 * 1000; // 30 min acceptable

    const baselineCheck = checkLatencyBaseline(metrics.averageMs);

    // Alert conditions:
    // 1. Average latency > 30 min (acceptable threshold)
    // 2. >50% increase from baseline
    const exceedsAcceptable = metrics.averageMs > acceptableMs;
    const baselineAlert = baselineCheck.alert;

    if (exceedsAcceptable || baselineAlert) {
      const reasons = [];
      if (exceedsAcceptable)
        reasons.push(`avg ${avgMinutes}min exceeds 30min acceptable threshold`);
      if (baselineAlert) reasons.push(`${baselineCheck.increase}% increase from baseline`);

      return {
        pass: false,
        detail: `⚠️ Latency alert: ${reasons.join(", ")} | p95=${p95Minutes}min, n=${metrics.count}`,
      };
    }

    const exceedsTarget = metrics.averageMs > targetMs;
    const status = exceedsTarget ? "⚠️" : "✅";

    return {
      pass: true,
      detail: `${status} avg=${avgMinutes}min, p95=${p95Minutes}min, n=${metrics.count} (target ≤10min, acceptable ≤30min)`,
    };
  } catch (err) {
    return { pass: true, detail: `Latency tracking unavailable: ${err.message}` };
  }
}
