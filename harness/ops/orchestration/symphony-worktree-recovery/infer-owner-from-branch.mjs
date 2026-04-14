import { execFileSync } from "node:child_process";
import { getWorktreeOwner, loadState } from "../../symphony-state.mjs";
import { logWarn } from "./logger.mjs";

/**
 * Infer which issue owns a worktree, using a three-tier authority hierarchy:
 *
 * 1. **Authoritative:** Durable worktree state via `getWorktreeOwner()` —
 *    this is the Phase 5 ownership record and the single source of truth.
 *
 * 2. **Repair heuristic:** Recent git commit messages (ANQ-NNN pattern) —
 *    only activated when durable state has no owner. Acceptable for recovery
 *    context where the worktree may have been orphaned or state lost.
 *
 * 3. **Repair heuristic:** Reverse scan of issue `finalization.worktreeId` —
 *    last resort when git history also has no match. Only useful for repair.
 *
 * Stages 2 and 3 are **not** authority sources. They are repair heuristics
 * that log warnings when activated so the gap is observable and measurable.
 *
 * @param {{ id: string, path: string }} snapshot - Worktree snapshot
 * @returns {string | null} Issue identifier or null
 */
export function inferOwnerFromBranch(snapshot) {
  // Stage 1 (authoritative): durable worktree state is the primary ownership record.
  const durableOwner = getWorktreeOwner(snapshot.id);
  if (durableOwner) return durableOwner;

  // Stage 2 (repair heuristic): check recent commit messages for issue identifiers.
  try {
    const log = execFileSync("git", ["log", "--oneline", "-5", "--format=%s"], {
      cwd: snapshot.path,
      encoding: "utf-8",
      timeout: 5_000,
    });
    const match = log.match(/ANQ-\d+/i);
    if (match) {
      logWarn(
        `[recovery] inferOwnerFromBranch: durable ownership not found for ${snapshot.id}, using git-log heuristic → ${match[0]}`,
      );
      return match[0];
    }
  } catch {
    /* git log failure is not fatal — fall through to stage 3 */
  }

  // Stage 3 (repair heuristic): reverse scan of issues by finalization.worktreeId.
  const store = loadState();
  for (const [identifier, record] of Object.entries(store.issues)) {
    if (record.finalization?.worktreeId === snapshot.id) {
      logWarn(
        `[recovery] inferOwnerFromBranch: git-log heuristic miss for ${snapshot.id}, using issue reverse-scan → ${identifier}`,
      );
      return identifier;
    }
  }

  return null;
}
