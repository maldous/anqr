import path from "node:path";
import fs from "node:fs";

import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";
import { resolveRequestPath } from "./resolve-request-path.mjs";
import { logError } from "./logger.mjs";

export async function memoryGetTool({ file }) {
  try {
    const validFiles = ["MEMORY.md", "knowledge.md", "CLAUDE.md"];
    const fileName = file || "MEMORY.md";

    if (!validFiles.includes(fileName)) {
      return { error: `Invalid file. Must be one of: ${validFiles.join(", ")}` };
    }

    const filePath = path.join(getCurrentRequestCwd(), fileName);

    if (!fs.existsSync(filePath)) {
      return { error: `File ${fileName} not found`, content: "" };
    }

    const content = fs.readFileSync(resolveRequestPath(filePath), "utf-8");
    return { content, file: fileName, lines: content.split("\n").length };
  } catch (error) {
    logError(`memoryGetTool failed: ${error.message}`, { file });
    return { error: error.message };
  }
}
