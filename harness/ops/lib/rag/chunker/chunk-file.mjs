import { extname, resolve } from "node:path";
import { readFile } from "node:fs/promises";

import { CODE_EXTENSIONS } from "./code-extensions.mjs";
import { DEFAULT_OPTIONS } from "./default-options.mjs";
import { JSON_EXTENSIONS } from "./json-extensions.mjs";
import { MARKDOWN_EXTENSIONS } from "./markdown-extensions.mjs";
import { chunkCode } from "./chunk-code.mjs";
import { chunkGenericText } from "./chunk-generic-text.mjs";
import { chunkJson } from "./chunk-json.mjs";
import { chunkMarkdown } from "./chunk-markdown.mjs";
import { normalizeExtensions } from "./normalize-extensions.mjs";
import { logDebug, logError } from "./logger.mjs";

export async function chunkFile(filePath, options = {}) {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
    extensions: normalizeExtensions(options.extensions || DEFAULT_OPTIONS.extensions),
  };
  const resolvedPath = resolve(filePath);
  const ext = extname(resolvedPath).toLowerCase();

  try {
    const text = await readFile(resolvedPath, "utf-8");
    if (!text.trim()) {
      logDebug(`Skipping empty file: ${resolvedPath}`);
      return [];
    }

    let chunks;
    if (CODE_EXTENSIONS.has(ext)) {
      chunks = chunkCode(text, resolvedPath, opts);
    } else if (MARKDOWN_EXTENSIONS.has(ext)) {
      chunks = chunkMarkdown(text, resolvedPath, opts);
    } else if (JSON_EXTENSIONS.has(ext)) {
      chunks = chunkJson(text, resolvedPath, opts);
    } else {
      chunks = chunkGenericText(text, resolvedPath, opts);
    }

    logDebug(`Chunked ${resolvedPath}: ${chunks.length} chunks`);
    return chunks;
  } catch (err) {
    logError(`Failed to chunk file ${resolvedPath}: ${err.message}`);
    return [];
  }
}
