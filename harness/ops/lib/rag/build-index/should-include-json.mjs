import { basename } from "node:path";

import { I18N_EXCLUDED_PATH_PATTERNS } from "./i18-n-excluded-path-patterns.mjs";
import { INCLUDE_I18N } from "./include-i18-n.mjs";
import { JSON_EXCLUDED_NAMES } from "./json-excluded-names.mjs";

export function shouldIncludeJson(relPath) {
  const name = basename(relPath);
  if (JSON_EXCLUDED_NAMES.has(name)) return false;
  if (!INCLUDE_I18N && I18N_EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(relPath)))
    return false;
  return true;
}
