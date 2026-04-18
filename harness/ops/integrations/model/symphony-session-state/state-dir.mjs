import { getBridgeStateDir } from "../../../core/symphony-shared-state/get-bridge-state-dir.mjs";

// CRITICAL: Use the shared bridge state directory (not worktree-local PROJECT_ROOT)
// so that session state is visible across all worktree bridge instances.
// This ensures follow-up requests routed to different worktrees can see
// the same session context, provider, and messages.
export const STATE_DIR = getBridgeStateDir();
