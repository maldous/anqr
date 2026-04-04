// Generated runtime carry-forward.

import {
  MAX_CONCURRENT,
  MAX_QUEUE_AGE_MS,
  PORT,
  QUEUE_POLL_INTERVAL_MS,
  TARGET_HOST,
  WORKTREES,
  WORKTREE_IDS,
  linearQueue,
  server,
  spawnLinearRunner,
} from "./index.mjs";

import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

setInterval(() => {
  if (linearQueue.length === 0) return;

  // Drop stale items older than MAX_QUEUE_AGE_MS
  const now = Date.now();
  const initialLength = linearQueue.length;
  for (let i = linearQueue.length - 1; i >= 0; i--) {
    const age = now - new Date(linearQueue[i].queuedAt).getTime();
    if (age > MAX_QUEUE_AGE_MS) {
      logWarn(
        `Dropping stale queued trigger: ${linearQueue[i].identifier} (age: ${Math.round(age / 1000)}s)`,
      );
      linearQueue.splice(i, 1);
    }
  }
  if (linearQueue.length < initialLength) {
    logInfo(`Queue TTL: dropped ${initialLength - linearQueue.length} stale items`);
  }

  const linearWorktrees = WORKTREES.filter((w) => w.id >= 1 && w.id <= 4);
  const available = linearWorktrees.filter((w) => w.activeRequests < 1);

  if (available.length === 0) {
    logDebug(`Queue length: ${linearQueue.length}, no worktrees available`);
    return;
  }

  // Process up to available slots
  const toProcess = linearQueue.splice(0, available.length);
  for (const item of toProcess) {
    logInfo(`Processing queued trigger: ${item.identifier}`);
    spawnLinearRunner(item.identifier);
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
