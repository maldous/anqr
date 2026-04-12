import { RECONCILER_POLL_INTERVAL_MS } from "../../symphony-config.mjs";

import { runReconciliationCycle } from "./run-reconciliation-cycle.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function runDaemon() {
  logInfo(`Starting daemon mode (poll every ${RECONCILER_POLL_INTERVAL_MS / 1000}s)`);

  const shutdown = (signal) => {
    logInfo(`Received ${signal}, shutting down...`);
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  try {
    await runReconciliationCycle();
  } catch (err) {
    logError(`Initial cycle error: ${err.message}`);
  }

  while (true) {
    await new Promise((r) => setTimeout(r, RECONCILER_POLL_INTERVAL_MS));
    try {
      await runReconciliationCycle();
    } catch (err) {
      logError(`Cycle error: ${err.message}`);
    }
  }
}
