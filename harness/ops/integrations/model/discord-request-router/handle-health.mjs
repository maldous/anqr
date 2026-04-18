import { MAX_CONCURRENT } from "./max-concurrent.mjs";
import { WORKTREE_URLS } from "./worktree-urls.mjs";
import { globalActiveRequests } from "./global-active-requests.mjs";
import {
  getAllActiveOwnership,
  cleanupStaleOwnership,
} from "../../../core/symphony-shared-state/active-job-ownership.mjs";
import { logInfo } from "./logger.mjs";

export function handleHealth(res) {
  // Clean up stale ownership records on each health check
  const staleCleaned = cleanupStaleOwnership();
  if (staleCleaned > 0) {
    logInfo(`🧹 Cleaned ${staleCleaned} stale job ownership records`);
  }

  const activeOwnership = getAllActiveOwnership();
  const status = {
    status: "ok",
    maxConcurrent: MAX_CONCURRENT,
    activeRequests: globalActiveRequests,
    availableSlots: Math.max(0, MAX_CONCURRENT - globalActiveRequests),
    activeJobs: Object.keys(activeOwnership).length,
    activeJobDetails: activeOwnership,
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
