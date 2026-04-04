import { DISCORD_WORKTREE_IDS, SYMPHONY_WORKTREE_IDS } from "../worktree-config.mjs";

export const ALL_WORKTREE_IDS = [
  ...SYMPHONY_WORKTREE_IDS.filter((id) => id !== "main"),
  ...DISCORD_WORKTREE_IDS,
];
