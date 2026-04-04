// Generated from ../../../../scripts/ops/runtime/watchdog/bridge-watchdog.mjs:750

import { CHECK_INTERVAL_MS } from "./check-interval-ms.mjs";
import { MONITORED_SERVICES } from "./monitored-services.mjs";
import { RAPID_RESTART_THRESHOLD } from "./rapid-restart-threshold.mjs";
import { RAPID_RESTART_WINDOW_MS } from "./rapid-restart-window-ms.mjs";
import { STARTUP_GRACE_PERIOD_MS } from "./startup-grace-period-ms.mjs";
import { checkService } from "./check-service.mjs";
import { shuttingDown } from "./shutting-down.mjs";
import { logInfo } from "./logger.mjs";

export async function monitorLoop() {
  logInfo(`[watchdog] 🐕 Bridge watchdog starting...`);
  logInfo(`[watchdog]    Check interval: ${CHECK_INTERVAL_MS / 1000}s`);
  logInfo(`[watchdog]    Grace period: ${STARTUP_GRACE_PERIOD_MS / 1000}s`);
  logInfo(
    `[watchdog]    Monitored services: ${MONITORED_SERVICES.map((s) => s.shortName).join(", ")}`,
  );
  logInfo(
    `[watchdog]    Rapid restart threshold: ${RAPID_RESTART_THRESHOLD} in ${RAPID_RESTART_WINDOW_MS / 1000}s`,
  );

  // shuttingDown is modified by signal handlers (SIGTERM, SIGINT)
  // eslint-disable-next-line no-unmodified-loop-condition
  while (!shuttingDown) {
    logInfo(`[watchdog] 🔍 Checking services...`);

    for (const service of MONITORED_SERVICES) {
      await checkService(service);
    }

    // Wait for next check (but check shutdown flag periodically)
    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL_MS));
  }

  logInfo(`[watchdog] 🛑 Monitor loop exiting gracefully`);
}
