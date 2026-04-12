import { execFileSync } from "node:child_process";

export function detectDivergence(snapshot) {
  if (!snapshot.exists || !snapshot.path) return false;

  try {
    execFileSync("git", ["merge-base", "--is-ancestor", "origin/main", "HEAD"], {
      cwd: snapshot.path,
      stdio: "pipe",
      timeout: 5_000,
    });
    return false;
  } catch {
    return true;
  }
}
