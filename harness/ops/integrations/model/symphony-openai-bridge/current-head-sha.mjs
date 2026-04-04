// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1723

import { execSync } from "node:child_process";

import { BRIDGE_ROOT } from "./bridge-root.mjs";

export function currentHeadSha() {
  try {
    return execSync("git rev-parse HEAD", {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 5000,
      stdio: "pipe",
    }).trim();
  } catch {
    return null;
  }
}
