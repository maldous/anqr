// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:519

import fs from "node:fs";

import { getCurrentRequestId } from "./get-current-request-id.mjs";
import { resolveRequestPath } from "./resolve-request-path.mjs";
import { trackFileChange } from "./track-file-change.mjs";
import { logError } from "./logger.mjs";

export async function strReplaceTool({ path: filePath, replacements }) {
  try {
    let content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");

    // Defensive normalization (workaround for SDK bug sending string instead of array)
    const replacementsList = Array.isArray(replacements) ? replacements : [replacements];

    if (replacementsList.length === 0) {
      return {
        error: "invalid_replacements_payload: replacements array is empty — no changes made",
      };
    }

    for (const { old, new: newStr, allowMultiple } of replacementsList) {
      if (allowMultiple) {
        content = content.split(old).join(newStr);
      } else {
        const index = content.indexOf(old);
        if (index === -1) {
          return { error: `String not found in file: ${old.slice(0, 100)}` };
        }
        content = content.slice(0, index) + newStr + content.slice(index + old.length);
      }
    }

    fs.writeFileSync(resolveRequestPath(filePath), content, "utf-8");

    // Track file change for current request
    const reqId = getCurrentRequestId();
    if (reqId) {
      trackFileChange(reqId);
    }

    return { success: true, path: filePath, replacements: replacementsList.length };
  } catch (error) {
    logError(`replaceInFileTool failed: ${error.message}`, { path: filePath });
    return { error: error.message };
  }
}
