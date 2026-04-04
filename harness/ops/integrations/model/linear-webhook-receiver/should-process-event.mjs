// Generated from ../../../../scripts/ops/integrations/model/linear-webhook-receiver.mjs:113

import { logInfo, logWarn, logDebug } from "./logger.mjs";
export function shouldProcessEvent(event) {
  const { type, data, action, createdAt, updatedAt } = event;

  // Only process Issue events
  if (type !== "Issue") {
    logDebug(`Ignoring non-Issue event: ${type}`);
    return null;
  }

  const issue = data;
  if (!issue || !issue.identifier) {
    logWarn("No issue data in webhook event");
    return null;
  }

  const stateName = issue.state?.name || "unknown";
  const previousStateName = issue.previousValues?.state?.name;

  logDebug(
    `Issue ${issue.identifier}: action=${action}, state=${stateName}, previousState=${previousStateName}, createdAt=${createdAt}, updatedAt=${updatedAt}`,
  );

  // Handle different actions
  if (action === "remove") {
    // Issue deleted - don't try to execute
    logInfo(`Ignoring removed issue: ${issue.identifier}`);
    return null;
  }

  if (action === "create") {
    // New issue created - only trigger if in ready state
    const readyStates = ["Todo", "In Progress"];
    if (readyStates.includes(stateName)) {
      return {
        identifier: issue.identifier,
        title: issue.title || "(no title)",
        action: "create",
        state: stateName,
        previousState: null,
        url: issue.url,
        reason: `created in ${stateName}`,
      };
    }
    // Created in Backlog/Done/Canceled - not ready for work
    logInfo(`Ignoring issue created in ${stateName}: ${issue.identifier}`);
    return null;
  }

  if (action === "update") {
    const readyStates = ["Todo", "In Progress"];

    // If moving TO a ready state (Todo/InProgress), ALWAYS trigger - even without previousStateName
    // This handles cases where Linear doesn't provide previousValues (e.g., API-created issues)
    // Moving into a ready state is inherently meaningful - the issue is ready for work
    if (readyStates.includes(stateName)) {
      // If we have previousStateName and it changed, include that info; otherwise note unknown previous
      const reason =
        previousStateName && previousStateName !== stateName
          ? `state changed from ${previousStateName} to ${stateName}`
          : `moved to ${stateName} (previous state unknown)`;

      logInfo(`Issue ${issue.identifier} moved to ${stateName} - triggering execution`);
      return {
        identifier: issue.identifier,
        title: issue.title || "(no title)",
        action: "update",
        state: stateName,
        previousState: previousStateName || null,
        url: issue.url,
        reason,
      };
    }

    // If we have previousStateName and it's different from current, it's a state change TO non-ready
    // Only ignore if state actually changed; otherwise could be metadata-only update
    if (previousStateName && previousStateName !== stateName) {
      logInfo(`Ignoring state change to ${stateName}: ${issue.identifier}`);
      return null;
    }

    // No previousStateName or state unchanged - this is a metadata-only update (comment, label, etc.)
    // Do NOT trigger execution - the runner already has the issue in its queue
    logDebug(
      `Ignoring metadata-only update for ${issue.identifier} (state unchanged: ${stateName})`,
    );
    return null;
  }

  // Unknown action
  logDebug(`Ignoring unknown action: ${action}`);
  return null;
}
