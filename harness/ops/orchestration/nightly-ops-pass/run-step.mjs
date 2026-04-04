// Generated from ../../../scripts/ops/orchestration/nightly-ops-pass.mjs:21

import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";
import { steps } from "./steps.mjs";
import { logInfo } from "./logger.mjs";

export function runStep(step) {
  const start = Date.now();
  logInfo(`\n${"=".repeat(60)}`);
  logInfo(`[nightly] Step: ${step.name}`);
  logInfo(`[nightly] Command: ${step.command}`);
  logInfo("=".repeat(60) + "\n");

  let exitCode = 0;
  const skipped = false;
  try {
    execFileSync("/bin/sh", ["-c", step.command], {
      cwd: ROOT,
      stdio: "inherit",
      timeout: step.timeout || 300_000,
      env: { ...process.env, FORCE_COLOR: "0" },
    });
  } catch (err) {
    exitCode = err.status || 1;
  }
  const result = {
    name: step.name,
    exitCode,
    duration_ms: Date.now() - start,
    severity: step.severity,
    skipped,
  };
  steps.push(result);
  logInfo(`\n${exitCode === 0 ? "✅" : "⚠️"} [nightly] ${step.name}: exit=${exitCode}`);
  return result;
}
