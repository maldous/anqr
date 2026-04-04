// Generated from ../../../scripts/ops/orchestration/symphony-queue-control.mjs:120

import { TARGET_MIN, TARGET_MAX, MAX_CONCURRENT_AGENTS } from "../../symphony-config.mjs";

import { validateConcurrencyConfig } from "./validate-concurrency-config.mjs";
import { logInfo } from "./logger.mjs";

export function printQueueHealth(snap) {
  logInfo("[queue-control] Queue health snapshot\n");
  logInfo(
    `  Backlog (feed-eligible): ${snap.backlog.automatable.length} / ${snap.backlog.all.length} total`,
  );
  logInfo(
    `  Todo (runnable):         ${snap.todo.automatable.length} / ${snap.todo.all.length} total`,
  );
  logInfo(
    `  In Progress (managed):   ${snap.inProgress.automatable.length} / ${snap.inProgress.all.length} total`,
  );
  logInfo(`  Queue depth:             ${snap.queueDepth}`);
  logInfo(
    `\n  target_min=${TARGET_MIN}  target_max=${TARGET_MAX}  max_concurrent=${MAX_CONCURRENT_AGENTS}`,
  );
  validateConcurrencyConfig();
}
