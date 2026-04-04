// Generated from ../../../../scripts/ops/runtime/watchdog/bridge-watchdog.mjs:330

import { execSync } from "node:child_process";
import { logError } from "./logger.mjs";

export function getPreviousCommit() {
  try {
    return execSync("git rev-parse --short HEAD~1", {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 5000,
    }).trim();
  } catch (err) {
    logError(`[watchdog] Failed to get previous commit: ${err.message}`);
    return null;
  }
}
