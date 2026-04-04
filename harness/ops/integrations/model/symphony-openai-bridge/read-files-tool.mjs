// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:451

import fs from "node:fs";

import { coerceStringArrayInput } from "./coerce-string-array-input.mjs";
import { resolveRequestPath } from "./resolve-request-path.mjs";
import { logError } from "./logger.mjs";

export async function readFilesTool({ paths }) {
  try {
    const normalizedPaths = coerceStringArrayInput(paths, { fallback: [] }) || [];
    if (normalizedPaths.length === 0) {
      return { error: "invalid_paths_payload: paths must contain at least one file path" };
    }

    const results = normalizedPaths.map((filePath) => {
      try {
        const content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");
        const totalLines = content.split("\n").length;
        return { path: filePath, content, totalLines };
      } catch (error) {
        logError(`readFilesTool map failed: ${error.message}`, { path: filePath });
        return { path: filePath, error: error.message };
      }
    });
    return { files: results };
  } catch (error) {
    logError(`readFilesTool failed: ${error.message}`);
    return { error: error.message };
  }
}
