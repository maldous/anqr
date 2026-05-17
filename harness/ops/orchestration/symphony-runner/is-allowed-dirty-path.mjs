import { DEFAULT_ALLOWED_DIRTY_PATH_PATTERNS } from "./default-allowed-dirty-path-patterns.mjs";
import { normalizeRepoPath } from "./normalize-repo-path.mjs";
import { parseAllowedDirtyPathEnv } from "./parse-allowed-dirty-path-env.mjs";

export function isAllowedDirtyPath(filePath) {
  const normalized = normalizeRepoPath(filePath);
  if (!normalized) return false;
  if (DEFAULT_ALLOWED_DIRTY_PATH_PATTERNS.some((pattern) => pattern.test(normalized))) return true;
  return parseAllowedDirtyPathEnv().some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix.replaceAll(/\/+$/g, "")}/`),
  );
}
