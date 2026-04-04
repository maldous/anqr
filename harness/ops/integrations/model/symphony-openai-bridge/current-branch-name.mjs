// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1710

import { execSync } from "node:child_process";

import { BRIDGE_ROOT } from "./bridge-root.mjs";

export function currentBranchName() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 5000,
      stdio: "pipe",
    }).trim();
  } catch {
    return "unknown";
  }
}
