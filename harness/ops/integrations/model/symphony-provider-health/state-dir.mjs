import { getBridgeStateDir } from "../../../core/symphony-shared-state/get-bridge-state-dir.mjs";

// CRITICAL: Use the shared bridge state directory (not worktree-local PROJECT_ROOT)
// so that provider health state is visible across all worktree bridge instances.
// This ensures all bridges see the same provider health data for selection.
export const STATE_DIR = getBridgeStateDir();
