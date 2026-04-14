import { createDurableQueue } from "../../lib/durable-kv.mjs";
import { logDebug } from "./logger.mjs";

const DESIRED_WORK_QUEUE_NAME = "symphony-desired-work";
const MAX_DRAIN_PER_CYCLE = 100;

/**
 * Drain the desired-work queue and return advisory signals.
 *
 * ADR-0002: Desired-work records are ingress intent and dedupe hints.
 * They are NOT the authoritative source of runnable work.
 * Authoritative eligibility is derived from Linear state + local execution state.
 *
 * The scheduler drains these each cycle so the queue does not grow unbounded
 * and uses the identifiers as priority-boost hints when merging with Linear state.
 *
 * @returns {{ identifiers: Set<string>, items: Array<object>, drained: number }}
 */
export function drainDesiredWork() {
  const queue = createDurableQueue(DESIRED_WORK_QUEUE_NAME);
  const items = [];
  const identifiers = new Set();

  let item = queue.dequeue();
  while (item && items.length < MAX_DRAIN_PER_CYCLE) {
    items.push(item);
    if (item.identifier) identifiers.add(item.identifier);
    item = queue.dequeue();
  }

  if (items.length > 0) {
    logDebug(`[scheduler] Drained ${items.length} desired-work signals: ${[...identifiers].join(", ")}`);
  }

  return { identifiers, items, drained: items.length };
}
