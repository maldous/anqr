import { monitorLoop, shutdown } from "./index.mjs";

import { logError } from "./logger.mjs";

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("SIGINT", () => shutdown("SIGINT"));

try {
  await monitorLoop();
} catch (err) {
  logError(`[watchdog] Fatal error: ${err.message}`);
  process.exit(1);
}
