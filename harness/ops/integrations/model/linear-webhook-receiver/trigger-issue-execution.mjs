import { activeIssues } from "./active-issues.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

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

  // Use the router's queue endpoint to signal new work
  // The router will route to least-loaded wt1-4 executor
  const routerUrl = "http://127.0.0.1:4319/v1/linear/trigger";

  // Build thread name from Linear issue identifier and title
  const threadName = `${processedEvent.identifier}: ${processedEvent.title}`;
  logInfo(`📝 Linear thread name: ${threadName}`);

  try {
    // Send minimal trigger payload - the executor will fetch issue details
    const response = await fetch(routerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer local-symphony",
        "x-linear-identifier": processedEvent.identifier,
        "x-linear-action": processedEvent.action,
        "x-linear-thread-name": threadName,
        "x-anqr-correlation-id": correlationId,
      },
      body: JSON.stringify({
        identifier: processedEvent.identifier,
        title: processedEvent.title,
        action: processedEvent.action,
        source: "linear-webhook",
        threadName: threadName,
        correlationId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logWarn(`Trigger returned ${response.status}: ${errorText}`);
      return false;
    }

    logInfo(`Triggered execution for ${processedEvent.identifier} (${processedEvent.action})`);
    return true;
  } catch (err) {
    logError(`Failed to trigger execution: ${err.message}`);
    return false;
  }
}
