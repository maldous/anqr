// Generated from ../../../scripts/ops/orchestration/symphony-control.mjs:55

import { execFileSync } from "node:child_process";
import { logInfo, logError } from "./logger.mjs";

export function disableAllTimers() {
  logInfo("🛑 Disabling all Linear runner timers...");
  try {
    // Intentionally uses glob to stop ALL runner timers, including any stale
    // wrong-ID instances (e.g. runner@5-8). enableAllTimers() is narrower
    // and only starts the correct subset (wt1-wt4).
    execFileSync("systemctl", ["--user", "stop", "anqr-linear-runner@*.timer"], {
      stdio: "pipe",
    });

    // Disable timers to prevent restart
    execFileSync("systemctl", ["--user", "disable", "anqr-linear-runner@*.timer"], {
      stdio: "pipe",
    });

    logInfo("✅ All Linear runner timers disabled");
    logInfo("⏸️  No new tasks will be picked up until timers are re-enabled");
    return true;
  } catch (err) {
    logError(`Failed to disable timers: ${err.message}`);
    return false;
  }
}
