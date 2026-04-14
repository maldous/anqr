import {
  MAX_CONCURRENT,
  MAX_QUEUE_AGE_MS,
  PORT,
  QUEUE_POLL_INTERVAL_MS,
  TARGET_HOST,
  WORKTREES,
  WORKTREE_IDS,
  dispatchLinearExecution,
  linearQueue,
  server,
} from "./index.mjs";

import { verifySchedulerClaim } from "./verify-scheduler-claim.mjs";
import { logInfo, logWarn, logDebug } from "./logger.mjs";

setInterval(() => {
  if (linearQueue.length === 0) return;

  // Drop stale items older than MAX_QUEUE_AGE_MS
  const now = Date.now();
  const allItems = linearQueue.items();
  const initialLength = allItems.length;
  const fresh = [];
  for (const item of allItems) {
    const age = now - new Date(item.queuedAt).getTime();
    if (age > MAX_QUEUE_AGE_MS) {
      logWarn(
        `Dropping stale queued trigger: ${item.identifier} (age: ${Math.round(age / 1000)}s)`,
      );
    } else {
      fresh.push(item);
    }
  }
  if (fresh.length < initialLength) {
    logInfo(`Queue TTL: dropped ${initialLength - fresh.length} stale items`);
    linearQueue.clear();
    for (const item of fresh) linearQueue.enqueue(item);
  }

  const linearWorktrees = WORKTREES.filter((w) => w.id >= 1 && w.id <= 4);
  const available = linearWorktrees.filter((w) => w.activeRequests < 1);

  if (available.length === 0) {
    logDebug(`Queue length: ${linearQueue.length}, no worktrees available`);
    return;
  }

  // Process up to available slots
  const toProcess = [];
  for (let i = 0; i < available.length && linearQueue.length > 0; i++) {
    toProcess.push(linearQueue.dequeue());
  }
  for (const item of toProcess) {
    // ADR-0002: Every dispatch path must verify the scheduler claim.
    // Queue-drained items must be re-verified because the claim may have
    // expired or been released while the item was queued.
    const claimCheck = verifySchedulerClaim(item.identifier);
    if (!claimCheck.allowed) {
      logWarn(
        `[router] Dropping queued item ${item.identifier}: scheduler claim invalid (${claimCheck.reason})`,
      );
      continue;
    }

    // Resolve the assigned worktree from the scheduler's durable claim
    let target = null;
    if (claimCheck.assignedWorktreeId) {
      const assignedId = parseInt(claimCheck.assignedWorktreeId.replace(/^wt/, ""), 10);
      target = !isNaN(assignedId) ? WORKTREES.find((w) => w.id === assignedId) || null : null;
      if (!target) {
        logWarn(
          `[router] Dropping queued item ${item.identifier}: assigned worktree ${claimCheck.assignedWorktreeId} not found in pool — claim may be stale`,
        );
        continue;
      }
    }

    logInfo(
      `Processing queued trigger: ${item.identifier} -> ${claimCheck.assignedWorktreeId || "(selection)"}`,
    );
    dispatchLinearExecution(item.identifier, item.correlationId || null, target);
  }
}, QUEUE_POLL_INTERVAL_MS);

server.listen(PORT, TARGET_HOST, () => {
  logInfo(`========================================`);
  logInfo(`Symphony Agent Router Starting`);
  logInfo(`========================================`);
  logInfo(`Listening: http://${TARGET_HOST}:${PORT}`);
  logInfo(`Routing worktrees: wt${WORKTREE_IDS.join(", wt")}`);
  logInfo(`Max concurrent: ${MAX_CONCURRENT}`);
  logInfo(`========================================`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));

process.on("SIGINT", () => server.close(() => process.exit(0)));
