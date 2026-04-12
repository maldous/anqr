import { execFileSync } from "node:child_process";
import { logInfo, logError } from "./logger.mjs";

const LINEAR_SERVICES = [
  "anqr-linear-reconciler.service",
  "anqr-symphony-executor@1.service",
  "anqr-symphony-executor@2.service",
  "anqr-symphony-executor@3.service",
  "anqr-symphony-executor@4.service",
];

export function enableAllTimers() {
  logInfo("▶️  Enabling Linear services (reconciler + wt1-wt4 executors)...");
  try {
    for (const unit of LINEAR_SERVICES) {
      execFileSync("systemctl", ["--user", "enable", unit], {
        stdio: "pipe",
      });
      execFileSync("systemctl", ["--user", "start", unit], {
        stdio: "pipe",
      });
    }

    logInfo("✅ Linear services enabled and started");
    logInfo("🚀 Reconciler will begin picking up tasks on next cycle (90s)");
    return true;
  } catch (err) {
    logError(`Failed to enable services: ${err.message}`);
    return false;
  }
}
