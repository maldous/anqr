// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:233

import path from "node:path";

import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { remapRepoPathToBridgeRoot } from "./remap-repo-path-to-bridge-root.mjs";

export function normalizeRequestCwd(cwd) {
  if (typeof cwd !== "string") return remapRepoPathToBridgeRoot(BRIDGE_ROOT);
  const trimmed = cwd.trim();
  if (!trimmed) return remapRepoPathToBridgeRoot(BRIDGE_ROOT);
  return remapRepoPathToBridgeRoot(path.resolve(trimmed));
}
