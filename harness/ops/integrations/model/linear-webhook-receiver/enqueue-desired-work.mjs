import { createDurableQueue } from "../../../lib/durable-kv.mjs";
import { clearCooldown } from "../../../core/symphony-state/index.mjs";
import { logInfo } from "./logger.mjs";

/**
 * Enqueue desired work into the durable Linear queue for the scheduler.
 * ADR-0002: Ingress writes desired work; it does NOT choose an executor.
 * Returns true if work was enqueued, false if already existed in queue
 */
export async function enqueueDesiredWork(processedEvent, correlationId) {
  const desiredWorkQueue = createDurableQueue("symphony-desired-work");

  // Dedupe: skip if already queued
  const existing = desiredWorkQueue.items();
  if (existing.some((item) => item.identifier === processedEvent.identifier)) {
    logInfo(`Issue ${processedEvent.identifier} already in desired-work queue — skipping`);
    return false; // Now returns different values (false/true)
  }

  desiredWorkQueue.enqueue({
    identifier: processedEvent.identifier,
    title: processedEvent.title,
    action: processedEvent.action,
    source: "linear-webhook",
    correlationId,
    timestamp: new Date().toISOString(),
  });

  // Human moved the issue to a ready state — clear any active cooldown so the
  // scheduler can dispatch it immediately rather than waiting out the backoff.
  // This is intentional override: if a human explicitly moves to Todo, they want it run now.
  clearCooldown(processedEvent.identifier);

  logInfo(`📝 Enqueued ${processedEvent.identifier} to desired-work queue (scheduler will claim)`);
  return true;
}
