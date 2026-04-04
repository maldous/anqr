import { execSync } from "node:child_process";
import { logError } from "./logger.mjs";

export function getCurrentCommit() {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 5000,
    }).trim();
  } catch (err) {
    logError(`[watchdog] Failed to get current commit: ${err.message}`);
    return null;
  }
}
