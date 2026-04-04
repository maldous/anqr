// Generated from ../../../../scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs:34

import { WORKTREE_ID } from "./worktree-id.mjs";

export function log(level, message) {
  const ts = new Date().toISOString();
  console.log(`${ts} [discord-gateway ${WORKTREE_ID}] ${level} ${message}`);
}
