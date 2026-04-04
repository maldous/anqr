// Generated from ../../../../scripts/ops/lib/rag/build-index.mjs:173

import { basename, extname } from "node:path";

import { EXCLUDED_PATH_PATTERNS } from "./excluded-path-patterns.mjs";
import { I18N_EXCLUDED_PATH_PATTERNS } from "./i18-n-excluded-path-patterns.mjs";
import { INCLUDE_I18N } from "./include-i18-n.mjs";
import { SUPPORTED_BASENAMES } from "./supported-basenames.mjs";
import { SUPPORTED_EXTENSIONS } from "./supported-extensions.mjs";
import { isSupportedEnvName } from "./is-supported-env-name.mjs";
import { shouldIncludeJson } from "./should-include-json.mjs";
import { shouldSkipMirroredPath } from "./should-skip-mirrored-path.mjs";

export function classifyFile(relPath, trackedSet) {
  if (shouldSkipMirroredPath(relPath, trackedSet))
    return { include: false, reason: "mirrored_duplicate" };
  if (EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(relPath)))
    return { include: false, reason: "excluded_path" };
  if (!INCLUDE_I18N && I18N_EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(relPath))) {
    return { include: false, reason: "i18n_noise" };
  }

  const name = basename(relPath);
  if (SUPPORTED_BASENAMES.has(name) || isSupportedEnvName(name)) {
    return { include: true, reason: "supported_basename" };
  }

  const ext = extname(relPath).toLowerCase();
  if (!ext || !SUPPORTED_EXTENSIONS.has(ext)) {
    return { include: false, reason: "unsupported_extension" };
  }

  if (ext === ".json" && !shouldIncludeJson(relPath)) {
    return { include: false, reason: "excluded_json" };
  }

  return { include: true, reason: "supported_extension" };
}
