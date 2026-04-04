import { relative } from "node:path";

import { PROJECT_ROOT } from "./project-root.mjs";
import { normalizePathString } from "./normalize-path-string.mjs";
import { toResolvedPath } from "./to-resolved-path.mjs";

export function toStoredPath(filePath) {
  const resolvedPath = toResolvedPath(filePath);
  const rel = normalizePathString(relative(PROJECT_ROOT, resolvedPath));
  if (rel && !rel.startsWith("../") && rel !== "..") return rel;
  return resolvedPath;
}
