import { resolve } from "node:path";

import { DEFAULT_OPTIONS } from "./default-options.mjs";
import { chunkFile } from "./chunk-file.mjs";
import { collectFiles } from "./collect-files.mjs";
import { normalizeExtensions } from "./normalize-extensions.mjs";
import { logInfo } from "./logger.mjs";

export async function chunkDirectory(dirPath, options = {}) {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
    extensions: normalizeExtensions(options.extensions || DEFAULT_OPTIONS.extensions),
  };

  logInfo(`Chunking directory: ${dirPath}`);
  const files = await collectFiles(resolve(dirPath), opts.extensions);
  logInfo(`Found ${files.length} supported files`);

  const allChunks = [];
  for (const file of files) {
    const chunks = await chunkFile(file, opts);
    allChunks.push(...chunks);
  }

  logInfo(`Total chunks generated: ${allChunks.length}`);
  return allChunks;
}
