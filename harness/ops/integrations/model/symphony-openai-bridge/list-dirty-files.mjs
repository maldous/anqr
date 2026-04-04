// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1736

import { execSync } from "node:child_process";

import { BRIDGE_ROOT } from "./bridge-root.mjs";

export function listDirtyFiles() {
  try {
    return execSync("git status --porcelain", {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 5000,
      stdio: "pipe",
    })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}
