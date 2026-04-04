import path from "node:path";

import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";
import { remapRepoPathToBridgeRoot } from "./remap-repo-path-to-bridge-root.mjs";

export function resolveRequestPath(targetPath) {
  if (typeof targetPath !== "string") return targetPath;
  const trimmed = targetPath.trim();
  if (!trimmed) return getCurrentRequestCwd();
  const resolvedPath = path.isAbsolute(trimmed)
    ? path.resolve(trimmed)
    : path.resolve(getCurrentRequestCwd(), trimmed);
  return remapRepoPathToBridgeRoot(resolvedPath);
}
