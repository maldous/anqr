import fs from "node:fs";

import { resolveRequestPath } from "./resolve-request-path.mjs";
import { logError } from "./logger.mjs";

export async function readFileTool({ path: filePath, offset, lines }) {
  try {
    // Validate path is not a placeholder or clearly invalid
    if (typeof filePath !== "string" || !filePath.trim()) {
      return { error: "Invalid path: path must be a non-empty string" };
    }
    const trimmedPath = filePath.trim();
    // Check for common placeholder patterns that indicate LLM issues
    if ((trimmedPath.startsWith("<") && trimmedPath.endsWith(">")) ||
        (trimmedPath.startsWith("{") && trimmedPath.endsWith("}"))) {
      logError(`readFileTool received placeholder as path: ${filePath}`);
      return { error: `Invalid path: '${filePath}' appears to be an unresolved placeholder. Please provide a valid file path.` };
    }
    // Check for paths that are just numbers or very short invalid paths
    if (/^\d+$/.test(trimmedPath) || (trimmedPath.length < 2 && !trimmedPath.includes("/"))) {
      return { error: `Invalid path: '${filePath}' is not a valid file path` };
    }

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
