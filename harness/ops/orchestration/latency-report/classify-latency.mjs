// Generated from ../../../scripts/ops/orchestration/latency-report.mjs:37

import { ACCEPTABLE_MS } from "./acceptable-ms.mjs";
import { TARGET_MS } from "./target-ms.mjs";

export function classifyLatency(ms) {
  if (!ms) return "unknown";
  if (ms <= TARGET_MS) return "excellent";
  if (ms <= ACCEPTABLE_MS) return "acceptable";
  return "degraded";
}
