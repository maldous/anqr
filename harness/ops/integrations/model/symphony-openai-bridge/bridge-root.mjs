import path from "node:path";

export const BRIDGE_ROOT = path.resolve(process.env.ANQR_WORKTREE_PATH || process.cwd());
