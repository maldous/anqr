import path from "node:path";
import fs from "node:fs";

import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";
import { resolveRequestPath } from "./resolve-request-path.mjs";
import { logError } from "./logger.mjs";

export async function memoryGetTool({ file, path: pathAlias, from: fromLine, lines: lineCount }) {
  try {
    const validFiles = ["MEMORY.md", "knowledge.md", "CLAUDE.md"];

    // Accept 'path' as alias for 'file' (OpenClaw schema compatibility)
    const rawName = file || pathAlias || "MEMORY.md";

    // Resolve — check direct match then basename match against known files
    const basename = path.basename(rawName);
    const fileName = validFiles.includes(rawName)
      ? rawName
      : validFiles.includes(basename)
        ? basename
        : null;

    // For unrecognized paths, try reading as a relative project path
    if (!fileName) {
      const resolvedPath = resolveRequestPath(path.join(getCurrentRequestCwd(), rawName));
      if (!fs.existsSync(resolvedPath)) {
        return { error: `File not found: ${rawName}. Known files: ${validFiles.join(", ")}` };
      }
      let content = fs.readFileSync(resolvedPath, "utf-8");
      if (fromLine !== undefined || lineCount !== undefined) {
        const allLines = content.split("\n");
        const start = fromLine || 0;
        const count = lineCount || allLines.length - start;
        content = allLines.slice(start, start + count).join("\n");
      }
      return { content, file: rawName, lines: content.split("\n").length };
    }

    const filePath = path.join(getCurrentRequestCwd(), fileName);
    if (!fs.existsSync(filePath)) {
      return { error: `File ${fileName} not found`, content: "" };
    }

    let content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");
    if (fromLine !== undefined || lineCount !== undefined) {
      const allLines = content.split("\n");
      const start = fromLine || 0;
      const count = lineCount || allLines.length - start;
      content = allLines.slice(start, start + count).join("\n");
    }
    return { content, file: fileName, lines: content.split("\n").length };
  } catch (error) {
    logError(`memoryGetTool failed: ${error.message}`, { file, path: pathAlias });
    return { error: error.message };
  }
}
