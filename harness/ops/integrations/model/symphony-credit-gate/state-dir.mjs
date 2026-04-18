import { getBridgeStateDir } from "../../../core/symphony-shared-state/get-bridge-state-dir.mjs";

// CRITICAL: Use the shared bridge state directory (not worktree-local PROJECT_ROOT)
// so that credit-gate state (stats, failures, leases) is visible across
// all worktree bridge instances.
export const STATE_DIR = getBridgeStateDir();
