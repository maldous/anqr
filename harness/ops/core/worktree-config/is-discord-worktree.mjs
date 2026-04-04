import { DISCORD_WORKTREE_IDS } from "./discord-worktree-ids.mjs";

export function isDiscordWorktree(worktreeId) {
  const normalizedId = String(worktreeId || "").replace(/^wt/, "");
  return DISCORD_WORKTREE_IDS.includes(normalizedId);
}
