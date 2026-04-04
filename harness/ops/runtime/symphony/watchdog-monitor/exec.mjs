// Generated from ../../../../scripts/ops/runtime/symphony/watchdog-monitor.mjs:41

import { execSync } from "node:child_process";

export function exec(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", ...opts }).trim();
  } catch {
    return null;
  }
}
