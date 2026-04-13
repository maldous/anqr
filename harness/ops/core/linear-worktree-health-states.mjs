/**
 * Shared Linear worktree health state constants.
 *
 * Extracted to the core layer so both integrations and orchestration
 * can import it without violating the hexagonal architecture boundary
 * (integrations must not import from orchestration).
 */
export const LINEAR_WORKTREE_HEALTH_STATES = Object.freeze({
  AVAILABLE: "available",
  EXECUTING: "executing",
  DIRTY_REPAIRABLE: "dirty_repairable",
  DIVERGED: "diverged",
  QUARANTINED: "quarantined",
  INTEGRATION_BLOCKED: "integration_blocked",
  UNAVAILABLE: "unavailable",
});
