import path from "node:path";

import { BRIDGE_PARENT_ROOT } from "./bridge-parent-root.mjs";
import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { CONTROL_REPO_ROOT } from "./control-repo-root.mjs";
import { IS_WORKTREE_BRIDGE } from "./is-worktree-bridge.mjs";
import { WORKTREE_CHECKOUT_PATTERN } from "./worktree-checkout-pattern.mjs";
import { isPathWithinRoot } from "./is-path-within-root.mjs";

export function remapRepoPathToBridgeRoot(candidatePath) {
  if (!IS_WORKTREE_BRIDGE) return candidatePath;
  if (isPathWithinRoot(candidatePath, BRIDGE_ROOT)) return candidatePath;

  if (isPathWithinRoot(candidatePath, CONTROL_REPO_ROOT)) {
    const relative = path.relative(CONTROL_REPO_ROOT, candidatePath);
    return path.resolve(BRIDGE_ROOT, relative);
  }

  if (isPathWithinRoot(candidatePath, BRIDGE_PARENT_ROOT)) {
    const relative = path.relative(BRIDGE_PARENT_ROOT, candidatePath);
    const segments = relative.split(path.sep).filter(Boolean);
    if (segments.length > 0 && WORKTREE_CHECKOUT_PATTERN.test(segments[0])) {
      return path.resolve(BRIDGE_ROOT, ...segments.slice(1));
    }
  }

  return BRIDGE_ROOT;
}
