// Extracted from runtime.mjs: worktree detection by reading .git file.

import { existsSync, readFileSync, statSync } from "node:fs";
import { logDebug, logError } from "./logger.mjs";

export function detectWorktree(cwd, gitPath) {
  logDebug(`[worktree-debug] Starting worktree detection`);
  logDebug(`[worktree-debug] cwd: ${cwd}`);
  logDebug(`[worktree-debug] gitPath: ${gitPath}`);
  logDebug(`[worktree-debug] gitPath exists: ${existsSync(gitPath)}`);

  try {
    if (existsSync(gitPath)) {
      const gitStat = statSync(gitPath);
      const isFile = gitStat.isFile();
      const isDir = gitStat.isDirectory();
      logDebug(`[worktree-debug] .git isFile: ${isFile}, isDirectory: ${isDir}`);

      if (gitStat.isFile()) {
        // This is a worktree - extract the worktree name from the gitdir reference
        const gitContent = readFileSync(gitPath, "utf-8");
        logDebug(`[worktree-debug] .git content: ${gitContent.trim()}`);

        const match = gitContent.match(/gitdir:\s*(.+)/);
        if (match && match[1]) {
          const gitDir = match[1].trim();
          logDebug(`[worktree-debug] extracted gitdir: ${gitDir}`);

          // gitDir format: /path/to/repo/.git/worktrees/anqr-wt1
          const wtMatch = gitDir.match(/anqr-(wt\d+)$/);
          if (wtMatch) {
            logDebug(`[worktree-debug] auto-detected worktree ID: ${wtMatch[1]}`);
            return wtMatch[1];
          } else {
            logDebug(`[worktree-debug] gitdir did not match worktree pattern`);
          }
        } else {
          logDebug(`[worktree-debug] no gitdir found in .git file`);
        }
      } else {
        logDebug(`[worktree-debug] .git is a directory - running in main repo`);
      }
    }
  } catch (err) {
    logError(`[worktree-debug] Error during worktree detection: ${err.message}`);
    // Ignore errors - will fall through to env var check
  }

  return null;
}
