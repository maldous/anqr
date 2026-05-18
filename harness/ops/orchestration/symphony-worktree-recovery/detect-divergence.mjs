import { execFileSync } from "node:child_process";

export function detectDivergence(snapshot) {
  if (!snapshot.exists || !snapshot.path) return false;

  try {
    // Checks if HEAD is an ancestor of origin/main — i.e., no commits in HEAD
    // that are not in origin/main. A worktree that is simply *behind* main is
    // NOT diverged; the runner syncs it with `git reset --hard origin/main`.
    // The OLD check (--is-ancestor origin/main HEAD) incorrectly flagged behind-main
    // worktrees as diverged, causing constant spurious quarantines.
    execFileSync("git", ["merge-base", "--is-ancestor", "HEAD", "origin/main"], {
      cwd: snapshot.path,
      stdio: "pipe",
      timeout: 5_000,
    });
    return false;
  } catch {
    return true;
  }
}
