import { listIssuesByState } from "../../linear-client.mjs";
import { QUEUE_STATES } from "../../symphony-config.mjs";
import { canExecuteIssue, leaseIsActive, getIssueState } from "../../symphony-state.mjs";
import { isDiscordSourced } from "../../core/discord-source.mjs";
import { drainDesiredWork } from "./drain-desired-work.mjs";
import { logDebug } from "./logger.mjs";

/**
 * Return priority-sorted eligible Linear issues for scheduling.
 *
 * ADR-0002: Authoritative eligibility is derived from Linear state + local
 * execution state. Desired-work queue signals are advisory priority hints.
 *
 * Filters out already-claimed, blocked, cooldown, and Discord-sourced issues
 * (Discord routing is handled by the Discord worktree pool, not this scheduler).
 */
export async function getEligibleWork() {
  // Step 1: Drain desired-work queue (advisory signals from webhook + reconciler)
  const desiredWork = drainDesiredWork();

  // Step 2: Authoritative eligibility from Linear state
  const todoIssues = await listIssuesByState(QUEUE_STATES.readyStates);

  const eligible = todoIssues
    .filter((issue) => canExecuteIssue(issue))
    .filter((issue) => !isDiscordSourced(issue))
    .filter((issue) => {
      const state = getIssueState(issue.identifier);
      return !leaseIsActive(state);
    });

  // Step 3: Sort with desired-work boost — issues that appear in the
  // desired-work queue are boosted to the front (they have fresh ingress
  // intent), then by priority, then by creation date.
  eligible.sort((a, b) => {
    const aDesired = desiredWork.identifiers.has(a.identifier) ? 0 : 1;
    const bDesired = desiredWork.identifiers.has(b.identifier) ? 0 : 1;
    if (aDesired !== bDesired) return aDesired - bDesired;
    return (a.priority ?? 99) - (b.priority ?? 99) || new Date(a.createdAt) - new Date(b.createdAt);
  });

  logDebug(
    `[scheduler] Eligible work: ${eligible.length} issues from ${todoIssues.length} total` +
      (desiredWork.drained > 0 ? ` (${desiredWork.drained} desired-work signals consumed)` : ""),
  );
  return eligible;
}
