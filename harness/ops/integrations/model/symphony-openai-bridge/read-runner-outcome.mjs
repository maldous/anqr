import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Read the runner outcome from disk (called by the HTTP layer).
 *
 * Originally in orchestration/symphony-runner/read-runner-outcome.mjs,
 * but integrations→orchestration is forbidden by the harness hexagonal
 * architecture (dep-cruiser). Inlined here to break the boundary breach.
 *
 * Uses the same STATE_DIR / WORKTREE_ID env vars as the runner.
 *
 * @param {string} [expectedCorrelationId] - If provided, only return outcomes matching this correlation ID
 * @returns {object|null}
 */
export function readRunnerOutcome(expectedCorrelationId) {
  const uid = process.getuid?.() ?? 1000;
  const stateDir = `/run/user/${uid}/symphony-runner`;
  const worktreeId = process.env.ANQR_WORKTREE_ID || "main";
  const path = resolve(stateDir, `outcome-${worktreeId}.json`);

  try {
    if (!existsSync(path)) return null;
    const raw = readFileSync(path, "utf-8");
    const record = JSON.parse(raw);

    // Stale outcome guard: discard if correlation ID doesn't match
    if (
      expectedCorrelationId &&
      record.correlationId &&
      record.correlationId !== expectedCorrelationId
    ) {
      return null;
    }

    // Discard outcomes older than 30 minutes
    if (record.writtenAt) {
      const ageMs = Date.now() - new Date(record.writtenAt).getTime();
      if (ageMs > 30 * 60 * 1000) {
        return null;
      }
    }

    return record;
  } catch {
    return null;
  } finally {
    try {
      if (existsSync(path)) unlinkSync(path);
    } catch {}
  }
}
