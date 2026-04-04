import { execSync } from "node:child_process";
import { logError } from "./logger.mjs";

export function getCommitHash(cwd = process.cwd()) {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      cwd,
      timeout: 5000,
    }).trim();
  } catch (err) {
    logError(`Failed to get commit hash: ${err.message}`);
    return "unknown";
  }
}
