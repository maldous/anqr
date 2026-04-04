import { FOLLOWER_SLEEP_MS } from "./follower-sleep-ms.mjs";
import { WAIT_LOG_INTERVAL_MS } from "./wait-log-interval-ms.mjs";
import { cleanupStaleLock } from "./cleanup-stale-lock.mjs";
import { logInfo } from "./log-info.mjs";
import { readLockInfo } from "./read-lock-info.mjs";
import { releaseLock } from "./release-lock.mjs";
import { runGatewayOwnerLoop } from "./run-gateway-owner-loop.mjs";
import { sleep } from "./sleep.mjs";
import { stopping } from "./stopping.mjs";
import { tryAcquireLock } from "./try-acquire-lock.mjs";

export async function followerLoop() {
  let lastLog = 0;
  while (!stopping) {
    await cleanupStaleLock();
    const acquired = await tryAcquireLock();
    if (acquired) {
      await runGatewayOwnerLoop();
      await releaseLock();
      if (stopping) return;
    } else {
      const now = Date.now();
      if (now - lastLog > WAIT_LOG_INTERVAL_MS) {
        const info = await readLockInfo();
        const ownerDesc = info?.worktree || "unknown";
        logInfo(`Gateway already running (owner ${ownerDesc}); waiting...`);
        lastLog = now;
      }
      await sleep(FOLLOWER_SLEEP_MS + Math.floor(Math.random() * 2000));
    }
  }
}
