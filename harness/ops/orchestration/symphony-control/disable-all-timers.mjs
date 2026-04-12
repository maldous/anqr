import { execFileSync } from "node:child_process";
import { logInfo, logError } from "./logger.mjs";

const LINEAR_SERVICES = [
  "anqr-linear-reconciler.service",
  "anqr-symphony-executor@1.service",
  "anqr-symphony-executor@2.service",
  "anqr-symphony-executor@3.service",
  "anqr-symphony-executor@4.service",
];

export function disableAllTimers() {
  logInfo("🛑 Disabling all Linear services...");
  try {
    for (const unit of LINEAR_SERVICES) {
      try {
        execFileSync("systemctl", ["--user", "stop", unit], { stdio: "pipe" });
        execFileSync("systemctl", ["--user", "disable", unit], { stdio: "pipe" });
      } catch {
        /* unit may not exist — continue with others */
      }
    }

    logInfo("✅ All Linear services disabled");
    logInfo("⏸️  No new tasks will be picked up until services are re-enabled");
    return true;
  } catch (err) {
    logError(`Failed to disable services: ${err.message}`);
    return false;
  }
}
