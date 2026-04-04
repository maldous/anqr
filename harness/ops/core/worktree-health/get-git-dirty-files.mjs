import { execFileSync } from "node:child_process";

export function getGitDirtyFiles(worktreePath) {
  try {
    const status = execFileSync("git", ["status", "--porcelain"], {
      cwd: worktreePath,
      encoding: "utf-8",
      timeout: 10_000,
    });
    return status
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
