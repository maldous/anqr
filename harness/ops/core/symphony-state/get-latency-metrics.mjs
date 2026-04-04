// Generated from ../../../scripts/ops/core/symphony-state.mjs:492

import { loadState } from "./load-state.mjs";

export function getLatencyMetrics() {
  const store = loadState();
  const completedIssues = Object.values(store.issues).filter(
    (record) => record.completed_at && record.latency_ms,
  );

  if (completedIssues.length === 0) {
    return {
      count: 0,
      averageMs: null,
      medianMs: null,
      p95Ms: null,
      minMs: null,
      maxMs: null,
    };
  }

  const latencies = completedIssues.map((r) => r.latency_ms).sort((a, b) => a - b);
  const sum = latencies.reduce((acc, val) => acc + val, 0);
  const average = sum / latencies.length;
  const median = latencies[Math.floor(latencies.length / 2)];
  const p95Index = Math.ceil(latencies.length * 0.95) - 1;
  const p95 = latencies[p95Index] || latencies[latencies.length - 1];

  return {
    count: completedIssues.length,
    averageMs: Math.round(average),
    medianMs: median,
    p95Ms: p95,
    minMs: latencies[0],
    maxMs: latencies[latencies.length - 1],
  };
}
