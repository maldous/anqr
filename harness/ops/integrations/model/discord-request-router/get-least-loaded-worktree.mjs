import { WORKTREE_URLS } from "./worktree-urls.mjs";
import { roundRobinIndex, setRoundRobinIndex } from "./round-robin-index.mjs";

export function getLeastLoadedWorktree() {
  if (WORKTREE_URLS.length === 0) return null;

  const minLoad = Math.min(...WORKTREE_URLS.map((wt) => wt.activeRequests));
  const candidates = WORKTREE_URLS.filter((wt) => wt.activeRequests === minLoad);

  const selected = candidates[roundRobinIndex % candidates.length];
  setRoundRobinIndex((roundRobinIndex + 1) % WORKTREE_URLS.length);
  return selected;
}
