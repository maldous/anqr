import { createDurableQueue } from "../../../lib/durable-kv.mjs";
import { logInfo } from "../logger.mjs";

/**
 * ADR-0002: The reconciler feeds the desired-work queue for the scheduler.
 * It does not dispatch directly — the scheduler owns claim and dispatch.
 */
export async function feedDesiredWorkQueue(eligibleIssues) {
  const desiredWorkQueue = createDurableQueue("symphony-desired-work");
  const existing = new Set(desiredWorkQueue.items().map((item) => item.identifier));
  let fed = 0;

  for (const issue of eligibleIssues) {
    if (existing.has(issue.identifier)) continue;
    desiredWorkQueue.enqueue({
      identifier: issue.identifier,
      title: issue.title,
      source: "reconciler",
      reason: "reconciler_backlog_pickup",
      timestamp: new Date().toISOString(),
    });
    fed++;
    logInfo(`Fed ${issue.identifier} to desired-work queue (scheduler will claim)`);
  }
  return fed;
}
