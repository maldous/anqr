import { MAX_CONCURRENT } from "./max-concurrent.mjs";
import { WORKTREE_URLS } from "./worktree-urls.mjs";
import { globalActiveRequests } from "./global-active-requests.mjs";

export function handleHealth(res) {
  const status = {
    status: "ok",
    maxConcurrent: MAX_CONCURRENT,
    activeRequests: globalActiveRequests,
    availableSlots: Math.max(0, MAX_CONCURRENT - globalActiveRequests),
    worktrees: WORKTREE_URLS.map((wt) => ({
      id: wt.id,
      path: wt.path,
      url: wt.url,
      activeRequests: wt.activeRequests,
      healthy: true, // Could add actual health check
    })),
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(status));
}
