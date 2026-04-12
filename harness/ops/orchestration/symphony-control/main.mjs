import { disableAllTimers } from "./disable-all-timers.mjs";
import { enableAllTimers } from "./enable-all-timers.mjs";
import { showStatus } from "./show-status.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
  const args = new Set(process.argv.slice(2));

  if (args.has("--stop")) {
    const success = disableAllTimers();
    process.exit(success ? 0 : 1);
  } else if (args.has("--start")) {
    const success = enableAllTimers();
    process.exit(success ? 0 : 1);
  } else if (args.has("--restart")) {
    disableAllTimers();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const success = enableAllTimers();
    process.exit(success ? 0 : 1);
  } else if (args.has("--status")) {
    showStatus();
    process.exit(0);
  } else {
    logError("Usage: symphony-control.mjs --stop|--start|--restart|--status");
    logInfo("");
    logInfo("  --stop     Disable Linear services (stop picking new tasks)");
    logInfo("  --start    Enable Linear services (start picking new tasks)");
    logInfo("  --restart  Restart Linear services");
    logInfo("  --status   Show current service status");
    process.exit(2);
  }
}
