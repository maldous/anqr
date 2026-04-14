import { createDurableQueue } from "../../../lib/durable-kv.mjs";
import { logInfo } from "./logger.mjs";

/**
 * Enqueue desired work into the durable Linear queue for the scheduler.
 * ADR-0002: Ingress writes desired work; it does NOT choose an executor.
 */
export async function enqueueDesiredWork(processedEvent, correlationId) {
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

  logInfo(`📝 Enqueued ${processedEvent.identifier} to desired-work queue (scheduler will claim)`);
  return true;
}
