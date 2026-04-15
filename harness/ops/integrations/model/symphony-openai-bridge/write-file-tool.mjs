import fs from "node:fs";

import { assertBridgeMutationBoundary } from "./assert-bridge-mutation-boundary.mjs";
import { getCurrentRequestId } from "./get-current-request-id.mjs";
import { resolveRequestPath } from "./resolve-request-path.mjs";
import { trackFileChange } from "./track-file-change.mjs";
import { logError } from "./logger.mjs";

export async function writeFileTool({ path: filePath, content }) {
  try {
    const resolved = resolveRequestPath(filePath);
    assertBridgeMutationBoundary(resolved);
    fs.writeFileSync(resolved, content, "utf-8");

    // Track file change for current request
    const reqId = getCurrentRequestId();
    if (reqId) {
      trackFileChange(reqId);
    }

    return { success: true, path: filePath };
  } catch (error) {
    logError(`writeFileTool failed: ${error.message}`, { path: filePath });
    return { error: error.message };
  }
}
