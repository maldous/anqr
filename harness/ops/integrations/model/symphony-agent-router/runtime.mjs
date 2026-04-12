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
    logInfo(`Processing queued trigger: ${item.identifier}`);
    dispatchLinearExecution(item.identifier);
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
