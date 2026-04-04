// Generated from ../../../scripts/ops/orchestration/symphony-worktree-recovery.mjs:683

import {
  RECOVERY_POLL_INTERVAL_MS,
  RECOVERY_BASELINE_CHECK_INTERVAL_CYCLES,
} from "../../symphony-config.mjs";

import { checkBaselineHealth } from "./check-baseline-health.mjs";
import { checkQuarantinedForReprovisioning } from "./check-quarantined-for-reprovisioning.mjs";
import { runRecoveryCycle } from "./run-recovery-cycle.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function runDaemon() {
  logInfo(
    `[recovery] Starting daemon mode (poll every ${RECOVERY_POLL_INTERVAL_MS / 1000}s, baseline check every ${RECOVERY_BASELINE_CHECK_INTERVAL_CYCLES} cycles)`,
  );

  let cycleCount = 0;

  const shutdown = (signal) => {
    logInfo(`[recovery] Received ${signal}, shutting down...`);
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Run baseline check on startup
  try {
    await checkBaselineHealth();
  } catch (err) {
    logWarn(`[recovery] Initial baseline check failed: ${err.message}`);
  }

  while (true) {
    try {
      await runRecoveryCycle();
      await checkQuarantinedForReprovisioning();

      // Periodic baseline health check (non-destructive auto-repair)
      cycleCount++;
      if (cycleCount % RECOVERY_BASELINE_CHECK_INTERVAL_CYCLES === 0) {
        await checkBaselineHealth();
      }
    } catch (err) {
      logError(`[recovery] Cycle error: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, RECOVERY_POLL_INTERVAL_MS));
  }
}
