export const IS_WORKTREE_BRIDGE = Boolean(
  process.env.ANQR_WORKTREE_ID || process.env.ANQR_WORKTREE_PATH,
);
