import path from "node:path";
import fs from "node:fs";

/**
 * Returns the shared bridge state directory used by session-state,
 * provider-health, and credit-gate for cross-worktree visibility.
 *
 * Priority:
 * 1. ANQR_BRIDGE_STATE_DIR env var (explicit override)
 * 2. ANQR_SYMPHONY_STATE_DIR env var (reuse symphony state dir if set)
 * 3. $XDG_RUNTIME_DIR/anqr-bridge-state/ (user-local, shared across worktrees)
 * 4. /tmp/anqr-bridge-state/ (fallback)
 *
 * This mirrors the pattern in core/symphony-state/get-state-dir.mjs
 * and durable-kv/store-helpers/get-store-dir.mjs.
 */
export function getBridgeStateDir() {
  if (process.env.ANQR_BRIDGE_STATE_DIR) {
    return process.env.ANQR_BRIDGE_STATE_DIR;
  }
  // Reuse symphony state dir if configured — avoids creating a new directory
  // when the operator has already set up a shared location.
  if (process.env.ANQR_SYMPHONY_STATE_DIR) {
    return process.env.ANQR_SYMPHONY_STATE_DIR;
  }
  const runtimeDir = process.env.XDG_RUNTIME_DIR || "/tmp";
  return path.join(runtimeDir, "anqr-bridge-state");
}

/**
 * Ensures the shared bridge state directory exists and returns its path.
 */
export function ensureBridgeStateDir() {
  const dir = getBridgeStateDir();
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}
