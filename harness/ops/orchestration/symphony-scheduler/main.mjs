import { SCHEDULER_POLL_INTERVAL_MS } from "../../symphony-config.mjs";
import { scheduleCycle } from "./schedule-cycle.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
  const args = process.argv.slice(2);
  const daemon = args.includes("--daemon");
  const once = args.includes("--once");

  if (!process.env.LINEAR_API_KEY) {
    logError("[scheduler] LINEAR_API_KEY is not set");
    process.exit(1);
  }

  if (once || !daemon) {
    const result = await scheduleCycle();
    logInfo(`[scheduler] Single cycle: ${JSON.stringify(result)}`);
    process.exit(0);
  }

  // Daemon mode
  logInfo(`[scheduler] Starting daemon mode (poll every ${SCHEDULER_POLL_INTERVAL_MS / 1000}s)`);

  const shutdown = (signal) => {
    logInfo(`[scheduler] Received ${signal}, shutting down...`);
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Initial cycle
  try {
    await scheduleCycle();
  } catch (err) {
    logError(`[scheduler] Initial cycle error: ${err.message}`);
  }

  // Poll loop
  let shouldContinue = true;
  while (shouldContinue) {
    await new Promise((r) => setTimeout(r, SCHEDULER_POLL_INTERVAL_MS));
    try {
      await scheduleCycle();
    } catch (err) {
      logError(`[scheduler] Cycle error: ${err.message}`);
    }
  }
}
