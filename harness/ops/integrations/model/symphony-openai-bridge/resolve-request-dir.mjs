// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:258

import path from "node:path";

import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";
import { remapRepoPathToBridgeRoot } from "./remap-repo-path-to-bridge-root.mjs";

export function resolveRequestDir(cwd) {
  if (typeof cwd !== "string") return getCurrentRequestCwd();
  const trimmed = cwd.trim();
  if (!trimmed) return getCurrentRequestCwd();
  const resolvedDir = path.isAbsolute(trimmed)
    ? path.resolve(trimmed)
    : path.resolve(getCurrentRequestCwd(), trimmed);
  return remapRepoPathToBridgeRoot(resolvedDir);
}
