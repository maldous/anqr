// Generated from ../../../scripts/ops/core/symphony-state.mjs:13

import path from "node:path";

export function getStateDir() {
  // CRITICAL: Use a shared central state directory for ALL worktrees.
  // Each worktree maintaining its own state.json causes lease race conditions
  // where multiple runners can pick up the same issue because they can't see
  // each other's leases.
  // Default to user-local state directory which is shared across all worktrees.
  if (process.env.ANQR_SYMPHONY_STATE_DIR) {
    return process.env.ANQR_SYMPHONY_STATE_DIR;
  }
  // Use XDG_RUNTIME_DIR or fallback to /tmp for shared state
  const runtimeDir = process.env.XDG_RUNTIME_DIR || "/tmp";
  return path.join(runtimeDir, "anqr-symphony-state");
}
