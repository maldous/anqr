import { activeIssues } from "./active-issues.mjs";
import { enqueueDesiredWork } from "./enqueue-desired-work.mjs";
import { logInfo, logError } from "./logger.mjs";

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
