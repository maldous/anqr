import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { CONTROL_REPO_ROOT } from "./control-repo-root.mjs";
import { IS_WORKTREE_BRIDGE } from "./is-worktree-bridge.mjs";
import { BRIDGE_MODE } from "./bridge-mode.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

/**
 * Validate boundary invariants at bridge startup.
 *
 * Fail-closed enforcement:
 * - CRITICAL misconfigurations THROW and prevent bridge startup.
 * - Advisory warnings are logged but do not prevent startup.
 *
 * Critical (throws):
 * 1. BRIDGE_MODE=worktree but IS_WORKTREE_BRIDGE=false — misconfigured executor
 * 2. BRIDGE_MODE=worktree but BRIDGE_ROOT === CONTROL_REPO_ROOT — would mutate main repo
 *
 * Warning-only:
 * 3. BRIDGE_MODE=control-plane but BRIDGE_ROOT !== CONTROL_REPO_ROOT — unusual but allowed
 * 4. Control-plane advisory (ADR-0008 exception acknowledgment)
 *
 * Accepts optional param overrides for testability. When called without
 * arguments, uses the module-level constants resolved from env/filesystem.
 *
 * @param {object} [overrides]
 * @param {string} [overrides.bridgeMode]
 * @param {boolean} [overrides.isWorktreeBridge]
 * @param {string} [overrides.bridgeRoot]
 * @param {string} [overrides.controlRepoRoot]
 * @returns {{ valid: boolean, warnings: string[] }}
 * @throws {Error} On critical boundary misconfigurations (fail-closed)
 */
export function validateBoundaryInvariants({
  bridgeMode = BRIDGE_MODE,
  isWorktreeBridge = IS_WORKTREE_BRIDGE,
  bridgeRoot = BRIDGE_ROOT,
  controlRepoRoot = CONTROL_REPO_ROOT,
} = {}) {
  const warnings = [];

  // Log identity for operator visibility
  logInfo(`[boundary] Bridge identity`, {
    bridgeMode,
    isWorktreeBridge,
    bridgeRoot,
    controlRepoRoot,
    ANQR_WORKTREE_ID: process.env.ANQR_WORKTREE_ID || "(unset)",
  });

  // CRITICAL Check 1: Worktree mode requires IS_WORKTREE_BRIDGE=true.
  // If this is false, ANQR_WORKTREE_ID/ANQR_WORKTREE_PATH are not set,
  // meaning the executor has no assigned worktree identity. Fail-closed.
  if (!isWorktreeBridge && bridgeMode === "worktree") {
    const msg =
      "FATAL: BRIDGE_MODE=worktree but IS_WORKTREE_BRIDGE=false — " +
      "worktree bridges must set ANQR_WORKTREE_ID or ANQR_WORKTREE_PATH. " +
      "Bridge startup refused.";
    logError(`[boundary] ${msg}`);
    throw new Error(msg);
  }

  // CRITICAL Check 2: Worktree mode must NOT have BRIDGE_ROOT === CONTROL_REPO_ROOT.
  // This would allow worktree executors to mutate the main repo, breaking
  // the isolation boundary that is the primary safety guarantee.
  if (bridgeMode === "worktree" && bridgeRoot === controlRepoRoot) {
    const msg =
      `FATAL: BRIDGE_MODE=worktree but BRIDGE_ROOT === CONTROL_REPO_ROOT (${bridgeRoot}) — ` +
      "this bridge would mutate the main repo instead of a worktree sandbox. " +
      "Bridge startup refused.";
    logError(`[boundary] ${msg}`);
    throw new Error(msg);
  }

  // Warning: Control-plane path mismatch (unusual but not critical)
  if (bridgeMode === "control-plane" && bridgeRoot !== controlRepoRoot) {
    const msg =
      `BRIDGE_MODE=control-plane but BRIDGE_ROOT (${bridgeRoot}) !== ` +
      `CONTROL_REPO_ROOT (${controlRepoRoot}) — unexpected identity`;
    logWarn(`[boundary] ${msg}`);
    warnings.push(msg);
  }

  // Advisory: control-plane bridges allow main-repo mutation per ADR-0008
  if (bridgeMode === "control-plane") {
    logWarn(
      "[boundary] Control-plane bridge: file-mutating tools target the main repo " +
        "(ADR-0008 exception for developer tooling). This bridge must NOT be used " +
        "for autonomous scheduled execution.",
    );
  }

  const valid = warnings.length === 0;
  if (valid) {
    logInfo(`[boundary] All boundary invariants valid (mode=${bridgeMode})`);
  }

  return { valid, warnings };
}
