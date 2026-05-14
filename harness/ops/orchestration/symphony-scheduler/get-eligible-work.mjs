import { getIssueDetail, listIssuesByState } from "../../linear-client.mjs";
import { QUEUE_STATES, SCHEDULER_MAX_DESIRED_WORK_FETCH } from "../../symphony-config.mjs";
import { canExecuteIssue, leaseIsActive, getIssueState } from "../../symphony-state.mjs";
import { isDiscordSourced } from "../../core/discord-source.mjs";
import { drainDesiredWork } from "./drain-desired-work.mjs";
import { logDebug } from "./logger.mjs";

/**
 * Return priority-sorted eligible Linear issues for scheduling.
 *
 * Webhook-first architecture:
 * 1. Drain desired-work queue — these are webhook/reconciler signals
 * 2. Fetch those specific issues individually (capped, targeted API calls)
 * 3. Only do a full listIssuesByState(["Todo"]) poll when
 *    isFullPollCycle is true or the desired-work queue was empty
 *
 * @param {boolean} isFullPollCycle — true on periodic backstop cycles
 *   (computed by scheduleCycle to keep housekeeping and work discovery
 *   full-polls in sync).
 *
 * ADR-0002: Authoritative eligibility is derived from Linear state + local
 * execution state. Desired-work queue signals carry fresh ingress intent.
 *
 * Filters out already-claimed, blocked, cooldown, and Discord-sourced issues
 * (Discord routing is handled by the Discord worktree pool, not this scheduler).
 */
export async function getEligibleWork(isFullPollCycle = false) {
  // Step 1: Drain desired-work queue (primary ingress from webhooks + reconciler)
  const desiredWork = drainDesiredWork();

  // Step 2: Full poll needed on backstop cycles or when no webhook activity
  const needsFullPoll = isFullPollCycle || desiredWork.drained === 0;

  // Step 3: Fetch webhook-driven issues individually by identifier.
  // Capped to avoid burning the rate limit on a large backlog drain.
  const webhookIssues = [];
  if (desiredWork.drained > 0) {
    const ids = [...desiredWork.identifiers].slice(0, SCHEDULER_MAX_DESIRED_WORK_FETCH);
    const results = await Promise.allSettled(
      ids.map((id) => getIssueDetail(id).catch(() => null)),
    );
    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        // getIssueDetail returns { identifier, title, state, ... }
        const issue = result.value;
        // Only include if currently in a ready state
        if (QUEUE_STATES.readyStates.includes(issue.state?.name)) {
          webhookIssues.push(issue);
        }
      }
    }
  }

  // Step 4: Full listIssuesByState poll — only on periodic backstop cycles
  // or when desired-work queue is empty (no webhook activity)
  let pollIssues = [];
  if (needsFullPoll) {
    pollIssues = await listIssuesByState(QUEUE_STATES.readyStates);
  }

  // Step 5: Merge and deduplicate by identifier.
  // Webhook-driven issues take precedence (they have fresher state from
  // the individual getIssueDetail call).
  const seenIds = new Set();
  const allIssues = [];
  for (const issue of webhookIssues) {
    if (!seenIds.has(issue.identifier)) {
      seenIds.add(issue.identifier);
      allIssues.push(issue);
    }
  }
  for (const issue of pollIssues) {
    if (!seenIds.has(issue.identifier)) {
      seenIds.add(issue.identifier);
      allIssues.push(issue);
    }
  }

  // Step 6: Filter and sort
  const eligible = allIssues
    .filter((issue) => canExecuteIssue(issue))
    .filter((issue) => !isDiscordSourced(issue))
    .filter((issue) => {
      const state = getIssueState(issue.identifier);
      return !leaseIsActive(state);
    });

  // Sort with desired-work boost — issues that appeared in the
  // desired-work queue are boosted to the front (fresh ingress intent),
  // then by priority, then by creation date.
  eligible.sort((a, b) => {
    const aDesired = desiredWork.identifiers.has(a.identifier) ? 0 : 1;
    const bDesired = desiredWork.identifiers.has(b.identifier) ? 0 : 1;
    if (aDesired !== bDesired) return aDesired - bDesired;
    return (a.priority ?? 99) - (b.priority ?? 99) || new Date(a.createdAt) - new Date(b.createdAt);
  });

  const mode = needsFullPoll
    ? isFullPollCycle
      ? "full-poll"
      : "full-poll (empty queue)"
    : `webhook-driven (${webhookIssues.length} from queue)`;

  logDebug(
    `[scheduler] Eligible work: ${eligible.length} issues (${mode})` +
      (desiredWork.drained > 0 ? ` — ${desiredWork.drained} desired-work signals consumed` : ""),
  );
  return eligible;
}
