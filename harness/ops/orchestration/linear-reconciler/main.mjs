import { runDaemon } from "./run-daemon.mjs";
import { runReconciliationCycle } from "./run-reconciliation-cycle.mjs";
import { getHealthyLinearCapacity } from "./get-healthy-linear-capacity.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
  const args = new Set(process.argv.slice(2));
  const daemon = args.has("--daemon");
  const status = args.has("--status");

  if (!process.env.LINEAR_API_KEY) {
    logError("LINEAR_API_KEY is not set");
    process.exit(1);
  }

  if (status) {
    const capacity = getHealthyLinearCapacity();
    console.log(JSON.stringify(capacity, null, 2));
    process.exit(0);
  }

  if (daemon) {
    await runDaemon();
  } else {
    const result = await runReconciliationCycle(true); // single-cycle: always full poll
    logInfo(`Single cycle: ${JSON.stringify(result)}`);
    process.exit(0);
  }
}
