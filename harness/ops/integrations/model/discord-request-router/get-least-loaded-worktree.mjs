import { evictExpiredSessions } from "./evict-expired-sessions.mjs";
import { sessionThreadNames } from "./session-thread-names.mjs";
import { WORKTREE_URLS } from "./worktree-urls.mjs";
import { roundRobinIndex, setRoundRobinIndex } from "./round-robin-index.mjs";
import { logInfo, logDebug } from "./logger.mjs";

export function getLeastLoadedWorktree(sessionId = null) {
  if (WORKTREE_URLS.length === 0) return null;

  if (sessionThreadNames.size > 50) evictExpiredSessions();

  if (sessionId && sessionThreadNames.has(sessionId)) {
    const existing = sessionThreadNames.get(sessionId);
    const sticky = WORKTREE_URLS.find((wt) => wt.id === existing?.worktreeId);
    if (sticky) {
      logInfo(
        `📌 Sticky hit: session=${sessionId} -> wt${sticky.id} (active: ${sticky.activeRequests})`,
      );
      sessionThreadNames.set(sessionId, { ...existing, createdAt: Date.now() });
      return sticky;
    }
    logDebug(
      `📌 Sticky miss: session=${sessionId} had wt${existing?.worktreeId} but not found, falling through to round-robin`,
    );
  }

  const minLoad = Math.min(...WORKTREE_URLS.map((wt) => wt.activeRequests));
  const candidates = WORKTREE_URLS.filter((wt) => wt.activeRequests === minLoad);

  const selected = candidates[roundRobinIndex % candidates.length];
  setRoundRobinIndex((roundRobinIndex + 1) % WORKTREE_URLS.length);

  logInfo(
    const candidateLabels = candidates.map((wt) => `wt${wt.id}`).join(",");
    `🔀 Round-robin: session=${sessionId || "(none)"} -> wt${selected?.id} (load: ${minLoad}, candidates: ${candidateLabels})`,
  );

  if (sessionId && selected) {
    const existing = sessionThreadNames.get(sessionId) || {};
    sessionThreadNames.set(sessionId, {
      ...existing,
      worktreeId: selected.id,
      createdAt: Date.now(),
    });
  }

  return selected;
}
