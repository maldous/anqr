import path from "node:path";

import { BRIDGE_MODE } from "./bridge-mode.mjs";
import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { CONTROL_REPO_ROOT } from "./control-repo-root.mjs";
import { logWarn } from "./logger.mjs";

/**
 * Assert that a file mutation is safe given the current bridge mode.
 *
 * This is the in-tool enforcement layer for boundary hardening (Workstream D).
 * Called by every file-mutating tool (write_file, str_replace, apply_patch)
 * before writing to disk.
 *
 * Enforcement:
 * - worktree mode: throws if resolvedPath is within CONTROL_REPO_ROOT
 *   (would mutate the main repo from a worktree executor)
 * - control-plane mode: logs advisory (ADR-0008 exception for developer tooling)
 *
 * Accepts optional param overrides for testability.
 *
 * @param {string} resolvedPath — The fully resolved file path about to be written
 * @param {object} [overrides]
 * @param {string} [overrides.bridgeMode]
 * @param {string} [overrides.bridgeRoot]
 * @param {string} [overrides.controlRepoRoot]
 * @throws {Error} If the mutation would violate the boundary invariant
 */
export function assertBridgeMutationBoundary(resolvedPath, {
  bridgeMode = BRIDGE_MODE,
  bridgeRoot = BRIDGE_ROOT,
  controlRepoRoot = CONTROL_REPO_ROOT,
} = {}) {
  if (!resolvedPath || typeof resolvedPath !== "string") return;

  const normalizedPath = path.resolve(resolvedPath);
  const normalizedBridgeRoot = path.resolve(bridgeRoot);
  const normalizedControlRoot = path.resolve(controlRepoRoot);

  if (bridgeMode === "worktree") {
    // In worktree mode, mutations must stay within the worktree (BRIDGE_ROOT).
    // If BRIDGE_ROOT === CONTROL_REPO_ROOT, startup validation should have
    // already refused — but defend in depth.
    if (normalizedBridgeRoot === normalizedControlRoot) {
      throw new Error(
        `Mutation blocked: worktree bridge has BRIDGE_ROOT === CONTROL_REPO_ROOT ` +
          `(${normalizedBridgeRoot}). This is a critical misconfiguration.`,
      );
    }

    // Block writes that resolve to the control repo root
    if (
      normalizedPath.startsWith(normalizedControlRoot + path.sep) ||
      normalizedPath === normalizedControlRoot
    ) {
      throw new Error(
        `Mutation blocked: worktree bridge attempted to write to control repo path ` +
          `(${normalizedPath}). Worktree mutations must stay within ${normalizedBridgeRoot}.`,
      );
    }
  } else if (bridgeMode === "control-plane") {
    // Control-plane mode: ADR-0008 exception. Log advisory for audit trail.
    // This path is expected for Codex CLI developer tooling.
    logWarn(
      `[mutation-boundary] Control-plane mutation: ${normalizedPath} ` +
        `(ADR-0008 — developer tooling exception)`,
    );
  }
}
