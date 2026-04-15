import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { CONTROL_REPO_ROOT } from "./control-repo-root.mjs";
import { IS_WORKTREE_BRIDGE } from "./is-worktree-bridge.mjs";
import { BRIDGE_MODE } from "./bridge-mode.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

/**
 * Validate boundary invariants at bridge startup.
 *
 * Checks:
 * 1. IS_WORKTREE_BRIDGE and BRIDGE_MODE are consistent
 * 2. Control-plane bridges have BRIDGE_ROOT === CONTROL_REPO_ROOT
 * 3. Worktree bridges have BRIDGE_ROOT !== CONTROL_REPO_ROOT
 *
 * Logs warnings/errors for inconsistencies but does not throw — the bridge
 * can still serve requests, but operators should investigate.
 *
 * @returns {{ valid: boolean, warnings: string[] }}
 */
export function validateBoundaryInvariants() {
  const warnings = [];

  // Log identity for operator visibility
  logInfo(`[boundary] Bridge identity`, {
    BRIDGE_MODE,
    IS_WORKTREE_BRIDGE,
    BRIDGE_ROOT,
    CONTROL_REPO_ROOT,
    ANQR_WORKTREE_ID: process.env.ANQR_WORKTREE_ID || "(unset)",
  });

  // Check 1: IS_WORKTREE_BRIDGE should be true for both modes (both set ANQR_WORKTREE_ID)
  // but BRIDGE_MODE distinguishes the execution boundary.
  if (!IS_WORKTREE_BRIDGE && BRIDGE_MODE === "worktree") {
    const msg =
      "BRIDGE_MODE=worktree but IS_WORKTREE_BRIDGE=false — " +
      "worktree bridges must set ANQR_WORKTREE_ID or ANQR_WORKTREE_PATH";
    logError(`[boundary] ${msg}`);
    warnings.push(msg);
  }

  // Check 2: Control-plane consistency
  if (BRIDGE_MODE === "control-plane" && BRIDGE_ROOT !== CONTROL_REPO_ROOT) {
    const msg =
      `BRIDGE_MODE=control-plane but BRIDGE_ROOT (${BRIDGE_ROOT}) !== ` +
      `CONTROL_REPO_ROOT (${CONTROL_REPO_ROOT}) — unexpected identity`;
    logError(`[boundary] ${msg}`);
    warnings.push(msg);
  }

  // Check 3: Worktree isolation consistency
  if (BRIDGE_MODE === "worktree" && BRIDGE_ROOT === CONTROL_REPO_ROOT) {
    const msg =
      `BRIDGE_MODE=worktree but BRIDGE_ROOT === CONTROL_REPO_ROOT (${BRIDGE_ROOT}) — ` +
      "this bridge would mutate the main repo, not a worktree sandbox";
    logError(`[boundary] ${msg}`);
    warnings.push(msg);
  }

  // Advisory: control-plane bridges allow main-repo mutation per ADR-0008
  if (BRIDGE_MODE === "control-plane") {
    logWarn(
      "[boundary] Control-plane bridge: file-mutating tools target the main repo " +
        "(ADR-0008 exception for developer tooling). This bridge must NOT be used " +
        "for autonomous scheduled execution.",
    );
  }

  const valid = warnings.length === 0;
  if (valid) {
    logInfo(`[boundary] All boundary invariants valid (mode=${BRIDGE_MODE})`);
  }

  return { valid, warnings };
}
