// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:193

import path from "node:path";
import fs from "node:fs";

import { BRIDGE_ROOT } from "./bridge-root.mjs";

export function detectControlRepoRoot() {
  const gitPointerPath = path.join(BRIDGE_ROOT, ".git");
  try {
    const stat = fs.statSync(gitPointerPath);
    if (!stat.isFile()) return BRIDGE_ROOT;
    const gitPointer = fs.readFileSync(gitPointerPath, "utf8");
    const match = gitPointer.match(/gitdir:\s*(.+)/);
    if (!match || !match[1]) return BRIDGE_ROOT;
    const gitDir = path.resolve(BRIDGE_ROOT, match[1].trim());
    const marker = `${path.sep}.git${path.sep}worktrees${path.sep}`;
    const markerIndex = gitDir.lastIndexOf(marker);
    if (markerIndex === -1) return BRIDGE_ROOT;
    return gitDir.slice(0, markerIndex);
  } catch {
    return BRIDGE_ROOT;
  }
}
