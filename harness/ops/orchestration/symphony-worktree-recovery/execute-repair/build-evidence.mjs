/**
 * Build structured evidence for a recovery action — ADR-0006.
 *
 * Every recovery action must emit evidence identifying:
 * - actionClass: state_only | quarantine | reprovision | sandbox_reset | demotion
 * - target: worktreeId
 * - reason: why this action was taken
 * - ownershipBasis: inferred owner or null
 * - isStateOnly: whether the action only modifies durable state (no filesystem)
 * - isNonPublishing: whether the action does NOT commit/push/publish code
 */
export function buildEvidence(actionClass, worktreeId, reason, ownershipBasis = null) {
  // ADR-0005: All recovery actions are non-publishing. ADR-0006: Evidence
  // must classify actions explicitly rather than inheriting a default.
  // These sets enumerate every known action class so that adding a new class
  // forces a conscious classification decision.
  const STATE_ONLY_ACTIONS = new Set([
    "skip",
    "reclaim_lease",
    "continue_repair",
    "quarantine",
    "reprovision",
  ]);
  const NON_PUBLISHING_ACTIONS = new Set([
    "skip",
    "reclaim_lease",
    "continue_repair",
    "quarantine",
    "reprovision",
    "sandbox_reset",
    "demotion",
  ]);

  const effectiveClass = actionClass === "demotion" ? "quarantine" : actionClass;
  const isStateOnly = STATE_ONLY_ACTIONS.has(effectiveClass);
  // Use original actionClass for isNonPublishing so that every class
  // (including "demotion" itself) is explicitly enumerated in the set.
  const isNonPublishing = NON_PUBLISHING_ACTIONS.has(actionClass);

  return {
    actionClass,
    target: worktreeId,
    reason,
    ownershipBasis,
    isStateOnly,
    isNonPublishing,
    timestamp: new Date().toISOString(),
  };
}
