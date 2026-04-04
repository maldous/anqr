// Generated from ../../../../scripts/ops/runtime/watchdog/bridge-watchdog.mjs:778

import { setShuttingDown } from "./shutting-down.mjs";
import { logInfo } from "./logger.mjs";

export function shutdown(signal) {
  logInfo(`\n[watchdog] Received ${signal}, shutting down...`);
  setShuttingDown(true);
  // Give the loop a moment to exit cleanly
  setTimeout(() => {
    logInfo(`[watchdog] Exit complete`);
    process.exit(0);
  }, 100);
}
