import { releaseIntegrationLock } from "../../symphony-state.mjs";

import { INTEGRATOR_ID } from "./integrator-id.mjs";
import { POLL_INTERVAL_MS } from "./poll-interval-ms.mjs";
import { processQueue } from "./process-queue.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function runDaemon() {
  logInfo(`[integrator] Starting daemon mode (poll every ${POLL_INTERVAL_MS / 1000}s)`);

  const shutdown = (signal) => {
    logInfo(`[integrator] Received ${signal}, shutting down...`);
    releaseIntegrationLock(INTEGRATOR_ID);
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  while (true) {
    try {
      await processQueue();
    } catch (err) {
      logError(`[integrator] Queue processing error: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}
