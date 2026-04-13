import { logInfo, logWarn, logError } from "../logger.mjs";

export async function dispatchIssue(action) {
  try {
    const response = await fetch("http://127.0.0.1:4319/v1/linear/trigger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer local-symphony",
      },
      body: JSON.stringify({
        identifier: action.issueIdentifier,
        title: action.title,
        action: "reconciler",
        source: "linear-reconciler",
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok || response.status === 202) {
      logInfo(`Dispatched ${action.issueIdentifier}: ${action.title}`);
      return true;
    }

    const text = await response.text();
    logWarn(`Dispatch failed for ${action.issueIdentifier}: ${response.status} ${text}`);
    return false;
  } catch (err) {
    logError(`Dispatch error for ${action.issueIdentifier}: ${err.message}`);
    return false;
  }
}
