import { execFileSync } from "node:child_process";
import { getWorktreeOwner, loadState } from "../../symphony-state.mjs";

export function inferOwnerFromBranch(snapshot) {
  // Phase 5: durable worktree state is the primary ownership record.
  const durableOwner = getWorktreeOwner(snapshot.id);
  if (durableOwner) return durableOwner;

  // Fallback: check recent commit messages for issue identifiers (ANQ-NNN pattern)
  try {
    const log = execFileSync("git", ["log", "--oneline", "-5", "--format=%s"], {
      cwd: snapshot.path,
      encoding: "utf-8",
      timeout: 5_000,
    });
    const match = log.match(/ANQ-\d+/i);
    if (match) return match[0];
  } catch {
    /* ignore */
  }

  // Last resort: reverse scan of issues (validation/repair only, not authority)
  const store = loadState();
  for (const [identifier, record] of Object.entries(store.issues)) {
    if (record.finalization?.worktreeId === snapshot.id) {
      return identifier;
    }
  }

  return null;
}
