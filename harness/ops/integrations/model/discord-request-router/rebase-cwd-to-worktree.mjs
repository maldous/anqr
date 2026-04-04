// Generated from ../../../../scripts/ops/integrations/model/discord-request-router.mjs:118

import path from "node:path";
import { PROJECT_ROOT } from "../../../core/worktree-config.mjs";

import { isPathWithinRoot } from "./is-path-within-root.mjs";

export function rebaseCwdToWorktree(cwd, worktreePath) {
  if (typeof cwd !== "string" || !cwd.trim()) return worktreePath;
  const resolved = path.resolve(cwd.trim());

  if (isPathWithinRoot(resolved, worktreePath)) {
    return resolved;
  }

  if (isPathWithinRoot(resolved, PROJECT_ROOT)) {
    const relative = path.relative(PROJECT_ROOT, resolved);
    return path.resolve(worktreePath, relative);
  }

  const projectParent = path.dirname(PROJECT_ROOT);
  if (isPathWithinRoot(resolved, projectParent)) {
    const relative = path.relative(projectParent, resolved);
    const segments = relative.split(path.sep).filter(Boolean);
    if (segments.length > 0 && /^(anqr|anqr-wt\d+)$/.test(segments[0])) {
      return path.resolve(worktreePath, ...segments.slice(1));
    }
  }

  return worktreePath;
}
