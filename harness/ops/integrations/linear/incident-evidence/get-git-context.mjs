import { execSync } from "node:child_process";
import { logWarn } from "./logger.mjs";

export function getGitContext() {
  try {
    const commit = execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();

    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();

    const statusOutput = execSync("git status --porcelain", {
      encoding: "utf-8",
      timeout: 5000,
    });

    const hasUncommitted = statusOutput.trim().length > 0;

    return { commit, branch, hasUncommitted };
  } catch (err) {
    logWarn(`Failed to get git context: ${err.message}`);
    return { commit: "unknown", branch: "unknown", hasUncommitted: false };
  }
}
