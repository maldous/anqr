import fs from "node:fs";
import path from "node:path";

import { coerceOptionalNumberInput } from "./coerce-optional-number-input.mjs";
import { coerceStringArrayInput } from "./coerce-string-array-input.mjs";
import { isProbablyBinaryContent } from "./is-probably-binary-content.mjs";
import { resolveRequestPath } from "./resolve-request-path.mjs";
import { logError } from "./logger.mjs";

export async function readSubtreeTool({ paths, maxTokens = 50000 }) {
  try {
    const targetPaths = coerceStringArrayInput(paths, { fallback: ["."] }) || ["."];
    const normalizedMaxTokens = Math.max(
      1000,
      Math.floor(coerceOptionalNumberInput(maxTokens, 50000) || 50000),
    );
    const maxChars = normalizedMaxTokens * 4;
    const result = [];
    let usedChars = 0;
    let truncated = false;

    const pushEntry = (entryPath, content) => {
      if (usedChars >= maxChars) {
        truncated = true;
        return false;
      }

      const remainingChars = maxChars - usedChars;
      let safeContent = content;
      if (safeContent.length > remainingChars) {
        safeContent = safeContent.slice(0, Math.max(0, remainingChars - 16)) + "\n... (truncated)";
        truncated = true;
      }

      usedChars += safeContent.length;
      result.push({ path: entryPath, type: "file", content: safeContent });
      return usedChars < maxChars;
    };

    const walk = (fullPath, relativePath) => {
      if (usedChars >= maxChars) {
        truncated = true;
        return;
      }

      const stats = fs.statSync(fullPath);
      if (stats.isFile()) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (!isProbablyBinaryContent(content)) {
          pushEntry(relativePath, content);
        }
        return;
      }

      if (!stats.isDirectory()) return;

      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const entry of entries) {
        if ([".git", "node_modules", "dist", "build", "coverage"].includes(entry.name)) continue;
        const nextFullPath = path.join(fullPath, entry.name);
        const nextRelativePath = path.join(relativePath, entry.name);
        if (entry.isDirectory()) {
          walk(nextFullPath, nextRelativePath);
        } else if (entry.isFile()) {
          const content = fs.readFileSync(nextFullPath, "utf-8");
          if (!isProbablyBinaryContent(content) && !pushEntry(nextRelativePath, content)) return;
        }
        if (usedChars >= maxChars) return;
      }
    };

    for (const targetPath of targetPaths) {
      const fullPath = resolveRequestPath(targetPath);
      walk(fullPath, targetPath);
      if (usedChars >= maxChars) break;
    }

    return { entries: result, count: result.length, truncated, maxTokens: normalizedMaxTokens };
  } catch (error) {
    logError(`readSubtreeTool failed: ${error.message}`, { paths });
    return { error: error.message };
  }
}
