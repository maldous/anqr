import fs from "node:fs";

import { resolveRequestPath } from "./resolve-request-path.mjs";
import { logError } from "./logger.mjs";

export async function readFileTool({ path: filePath, offset, lines }) {
  try {
    let content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");
    const totalLines = content.split("\n").length;
    const hasOffset = typeof offset === "number";
    const hasLineCount = typeof lines === "number";

    // Handle offset and lines parameters
    if (hasOffset || hasLineCount) {
      const lineArray = content.split("\n");
      const startLine = hasOffset ? offset : 0;
      const endLine = hasLineCount ? startLine + lines : lineArray.length;
      content = lineArray.slice(startLine, endLine).join("\n");

      return {
        content,
        totalLines,
        truncated: endLine < totalLines,
        range: { start: startLine, end: endLine },
      };
    }

    // If content is large, truncate it
    if (content.length > 100000) {
      return {
        content: content.slice(0, 100000) + "\n... (truncated)",
        totalLines,
        truncated: true,
      };
    }

    return { content, totalLines };
  } catch (error) {
    logError(`readFileTool failed: ${error.message}`, { path: filePath });
    return { error: error.message };
  }
}
