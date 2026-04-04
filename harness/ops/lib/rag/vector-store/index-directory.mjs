import { isOllamaAvailable } from "../embeddings.mjs";
import { collectFiles } from "../chunker.mjs";
import { resolve } from "node:path";

import { DEFAULT_EXTENSIONS } from "./default-extensions.mjs";
import { DIRECTORY_SAVE_INTERVAL } from "./directory-save-interval.mjs";
import { indexFile } from "./index-file-2.mjs";
import { loadIndex } from "./load-index.mjs";
import { saveIndex } from "./save-index.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function indexDirectory(dirPath, options = {}) {
  await loadIndex();

  const available = await isOllamaAvailable();
  if (!available) {
    logError("Ollama unavailable — cannot index directory");
    return { totalFiles: 0, indexedFiles: 0, totalChunks: 0 };
  }

  const files = await collectFiles(resolve(dirPath), options.extensions || DEFAULT_EXTENSIONS);
  logInfo(`Indexing directory: ${dirPath}`);
  logInfo(`Found ${files.length} supported files`);

  let indexedFiles = 0;
  let totalChunks = 0;
  let dirtySinceSave = 0;

  for (const filePath of files) {
    const result = await indexFile(filePath, {
      ...options,
      skipSave: true,
      skipHealthCheck: true,
    });
    if (result.indexed) {
      indexedFiles += 1;
      dirtySinceSave += 1;
    }
    totalChunks += result.chunks || 0;

    if (dirtySinceSave >= DIRECTORY_SAVE_INTERVAL) {
      await saveIndex();
      dirtySinceSave = 0;
    }
  }

  if (dirtySinceSave > 0) {
    await saveIndex();
  }

  logInfo(
    `Directory indexing complete: ${indexedFiles}/${files.length} files indexed, ${totalChunks} total chunks`,
  );
  return { totalFiles: files.length, indexedFiles, totalChunks };
}
