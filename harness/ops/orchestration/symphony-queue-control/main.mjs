import { actions } from "./actions.mjs";
import { detectStuckWork } from "./detect-stuck-work.mjs";
import { drainOverflow } from "./drain-overflow.mjs";
import { enforceMaxConcurrent } from "./enforce-max-concurrent.mjs";
import { feedQueue } from "./feed-queue.mjs";
import { getQueueSnapshot } from "./get-queue-snapshot.mjs";
import { printQueueHealth } from "./print-queue-health.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const doCheck = args.has("--check");
  const doFeed = args.has("--feed");
  const doDrain = args.has("--drain");
  const doEnforce = args.has("--enforce");
  const doAll = args.has("--all");

  if (!doCheck && !doFeed && !doDrain && !doEnforce && !doAll) {
    logError(
      "Usage: symphony-queue-control.mjs --check|--feed|--drain|--enforce|--all [--dry-run]",
    );
    process.exit(2);
  }

  logInfo(`[queue-control]${dryRun ? " (DRY RUN)" : ""} starting\n`);

  if (doCheck || doAll) {
    printQueueHealth(await getQueueSnapshot());
    logInfo("");
  }
  if (doFeed || doAll) {
    logInfo("[queue-control] === Feed ===");
    await feedQueue(null, dryRun);
    logInfo("");
  }
  if (doDrain || doAll) {
    logInfo("[queue-control] === Drain ===");
    await drainOverflow(null, dryRun);
    logInfo("");
  }
  if (doEnforce || doAll) {
    logInfo("[queue-control] === Enforce concurrent ===");
    await enforceMaxConcurrent(null, dryRun);
    logInfo("");
    logInfo("[queue-control] === Detect stuck work ===");
    await detectStuckWork(null, dryRun);
    logInfo("");
  }

  const counts = {};
  for (const action of actions) counts[action.type] = (counts[action.type] || 0) + 1;
  logInfo(
    `[queue-control] Summary: ${
      Object.entries(counts)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ") || "no actions"
    }`,
  );
}
