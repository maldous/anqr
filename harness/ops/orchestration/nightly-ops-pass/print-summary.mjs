// Generated from ../../../scripts/ops/orchestration/nightly-ops-pass.mjs:62

import { steps } from "./steps.mjs";
import { logInfo } from "./logger.mjs";

export function printSummary() {
  logInfo(`\n${"=".repeat(60)}`);
  logInfo("[nightly] Pipeline summary");
  logInfo("=".repeat(60));
  for (const step of steps) {
    logInfo(
      `  ${step.exitCode === 0 ? "✅" : "⚠️"} ${step.name}: exit=${step.exitCode} (${(step.duration_ms / 1000).toFixed(1)}s) [${step.severity}]`,
    );
  }
}
