import { execFileSync } from "node:child_process";
import { loadState } from "../../symphony-state.mjs";

export function inferOwnerFromBranch(snapshot) {
  // Check recent commit messages for issue identifiers (ANQ-NNN pattern)
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

  // Check state store for issues assigned to this worktree
  const store = loadState();
  for (const [identifier, record] of Object.entries(store.issues)) {
    if (record.finalization?.worktreeId === snapshot.id) {
      return identifier;
    }
  }

  return null;
}
