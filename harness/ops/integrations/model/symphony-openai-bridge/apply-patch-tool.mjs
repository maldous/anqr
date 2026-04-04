// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:987

import fs from "node:fs";

import { getCurrentRequestId } from "./get-current-request-id.mjs";
import { resolveRequestPath } from "./resolve-request-path.mjs";
import { trackFileChange } from "./track-file-change.mjs";
import { logError } from "./logger.mjs";

export async function applyPatchTool({ operation }) {
  try {
    const { type, path: filePath, diff } = operation;

    if (type === "create_file") {
      if (!diff) return { error: "diff required for create_file" };
      const lines = diff
        .split("\n")
        .filter((l) => l.startsWith("+"))
        .map((l) => l.slice(1));
      const content = lines.join("\n");
      fs.writeFileSync(resolveRequestPath(filePath), content, "utf-8");

      const reqId = getCurrentRequestId();
      if (reqId) trackFileChange(reqId);

      return { success: true, operation: "create", path: filePath };
    } else if (type === "update_file") {
      if (!diff) return { error: "diff required for update_file" };
      // Simplified: treat as full content replacement
      const lines = diff
        .split("\n")
        .filter((l) => l.startsWith("+"))
        .map((l) => l.slice(1));
      const content = lines.join("\n");
      fs.writeFileSync(resolveRequestPath(filePath), content, "utf-8");

      const reqId = getCurrentRequestId();
      if (reqId) trackFileChange(reqId);

      return { success: true, operation: "update", path: filePath };
    } else if (type === "delete_file") {
      fs.unlinkSync(resolveRequestPath(filePath));
      return { success: true, operation: "delete", path: filePath };
    }

    return { error: `Unknown operation type: ${type}` };
  } catch (error) {
    logError(`executeFileChangeHooksTool failed: ${error.message}`);
    return { error: error.message };
  }
}
