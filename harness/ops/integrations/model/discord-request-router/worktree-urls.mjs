// Generated from ../../../../scripts/ops/integrations/model/discord-request-router.mjs:36

import { getWorktreePath } from "../../../core/worktree-config.mjs";

import { WORKTREE_IDS } from "./worktree-ids.mjs";

export const WORKTREE_URLS = WORKTREE_IDS.map((id) => ({
  id,
  path: getWorktreePath(id),
  url: `http://127.0.0.1:432${id}`,
  activeRequests: 0,
}));
