import { createDurableQueue } from "../../../lib/durable-kv.mjs";
import { activeIssues } from "./active-issues.mjs";
import { logInfo, logError } from "./logger.mjs";

/**
 * Enqueue desired work into the durable Linear queue for the scheduler.
 * ADR-0002: Ingress writes desired work; it does NOT choose an executor.
 */
async function enqueueDesiredWork(processedEvent, correlationId) {
  const desiredWorkQueue = createDurableQueue("symphony-desired-work");

  // Dedupe: skip if already queued
  const existing = desiredWorkQueue.items();
  if (existing.some((item) => item.identifier === processedEvent.identifier)) {
    logInfo(`Issue ${processedEvent.identifier} already in desired-work queue — skipping`);
    return true;
  }

  desiredWorkQueue.enqueue({
    identifier: processedEvent.identifier,
    title: processedEvent.title,
    action: processedEvent.action,
    source: "linear-webhook",
    correlationId,
    timestamp: new Date().toISOString(),
  });

  logInfo(
    `📝 Enqueued ${processedEvent.identifier} to desired-work queue (scheduler will claim)`,
  );
  return true;
}

export async function triggerIssueExecution(processedEvent, correlationId) {
  // Check if this issue is already being processed
  if (activeIssues.has(processedEvent.identifier)) {
    logInfo(
      `Issue ${processedEvent.identifier} is already being processed, skipping duplicate trigger`,
    );
    return true;
  }

  // Mark issue as active
  activeIssues.add(processedEvent.identifier);

  try {
    // ADR-0002: Webhook is write-only ingress. It enqueues desired work;
    // it does NOT choose an executor or dispatch.
    return await enqueueDesiredWork(processedEvent, correlationId);
  } catch (err) {
    logError(`Failed to trigger execution: ${err.message}`);
    return false;
  }
}
