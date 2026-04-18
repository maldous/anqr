import path from "node:path";

import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { CONTROL_REPO_ROOT } from "./control-repo-root.mjs";

/**
 * Derive bridge execution mode from the relationship between BRIDGE_ROOT
 * and CONTROL_REPO_ROOT.
 *
 * - "worktree"       — BRIDGE_ROOT is a managed worktree (different from control repo).
 *                      File-mutating tools operate in an isolated sandbox.
 * - "control-plane"  — BRIDGE_ROOT IS the control repo (main checkout).
 *                      Per ADR-0008, this is an explicit exception for developer
 *                      tooling (e.g. Codex CLI bridge). Autonomous execution must
 *                      NOT use this mode.
 *
 * The env var BRIDGE_MODE can override auto-detection for explicit service config.
 *
 * @param {string} bridgeRoot
 * @param {string} controlRepoRoot
 * @returns {"worktree" | "control-plane"}
 */
export function deriveBridgeMode(bridgeRoot, controlRepoRoot) {
  const normalizedBridge = path.resolve(bridgeRoot);
  const normalizedControl = path.resolve(controlRepoRoot);
  return normalizedBridge === normalizedControl ? "control-plane" : "worktree";
}

/**
 * Bridge execution mode for the current process.
 *
 * Prefers the explicit `BRIDGE_MODE` env var if set; otherwise auto-detects
 * by comparing BRIDGE_ROOT against CONTROL_REPO_ROOT.
 */
export const BRIDGE_MODE =
  process.env.BRIDGE_MODE === "control-plane" || process.env.BRIDGE_MODE === "worktree"
    ? process.env.BRIDGE_MODE
    : deriveBridgeMode(BRIDGE_ROOT, CONTROL_REPO_ROOT);
