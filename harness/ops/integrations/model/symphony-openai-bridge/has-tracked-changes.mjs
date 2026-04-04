import { execSync } from "node:child_process";

import { BRIDGE_ROOT } from "./bridge-root.mjs";

export function hasTrackedChanges() {
  try {
    const status = execSync("git status --porcelain", {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 5000,
      stdio: "pipe",
    }).trim();
    return status.length > 0;
  } catch {
    return false;
  }
}
