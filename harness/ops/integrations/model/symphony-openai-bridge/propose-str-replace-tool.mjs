// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:882

import fs from "node:fs";

import { resolveRequestPath } from "./resolve-request-path.mjs";
import { logError } from "./logger.mjs";

export async function proposeStrReplaceTool({ path: filePath, replacements }) {
  try {
    const content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");
    const proposed = [];

    // Defensive normalization (workaround for SDK bug sending string instead of array)
    const replacementsList = Array.isArray(replacements) ? replacements : [replacements];

    if (replacementsList.length === 0) {
      return { error: "invalid_replacements_payload: replacements array is empty" };
    }

    for (const { old, new: newStr } of replacementsList) {
      const index = content.indexOf(old);
      proposed.push({
        old: old.slice(0, 100),
        new: newStr.slice(0, 100),
        found: index !== -1,
      });
    }

    return { success: true, path: filePath, proposed };
  } catch (error) {
    logError(`proposeStrReplaceTool failed: ${error.message}`, { path: filePath });
    return { error: error.message };
  }
}
