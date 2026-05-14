import { RECONCILER_POLL_INTERVAL_MS, RECONCILER_FULL_POLL_INTERVAL_CYCLES } from "../../symphony-config.mjs";

import { runReconciliationCycle } from "./run-reconciliation-cycle.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function runDaemon() {
  logInfo(`Starting daemon mode (poll every ${RECONCILER_POLL_INTERVAL_MS / 1000}s, full Todo poll every ${RECONCILER_FULL_POLL_INTERVAL_CYCLES} cycles)`);

  const shutdown = (signal) => {
    logInfo(`Received ${signal}, shutting down...`);
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  let cycleCount = 0;

  try {
    cycleCount++;
    await runReconciliationCycle(true); // first cycle always full poll
  } catch (err) {
    logError(`Initial cycle error: ${err.message}`);
  }

  while (true) {
    await new Promise((r) => setTimeout(r, RECONCILER_POLL_INTERVAL_MS));
    try {
      cycleCount++;
      const isFullPollCycle = cycleCount % RECONCILER_FULL_POLL_INTERVAL_CYCLES === 0;
      await runReconciliationCycle(isFullPollCycle);
    } catch (err) {
      logError(`Cycle error: ${err.message}`);
    }
  }
}
