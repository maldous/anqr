// Generated from ../../../../scripts/ops/lib/rag/vector-store.mjs:298

import { generateEmbeddings, isOllamaAvailable } from "../embeddings.mjs";
import { chunkFile } from "../chunker.mjs";

import { getFileMtime } from "./get-file-mtime.mjs";
import { indexCache } from "./index-cache.mjs";
import { loadIndex } from "./load-index.mjs";
import { markDirty } from "./mark-dirty.mjs";
import { metaCache } from "./meta-cache.mjs";
import { removeEntriesForResolvedPath } from "./remove-entries-for-resolved-path.mjs";
import { saveIndex } from "./save-index.mjs";
import { toResolvedPath } from "./to-resolved-path.mjs";
import { toStoredPath } from "./to-stored-path.mjs";
import { logDebug, logInfo, logWarn } from "./logger.mjs";

export async function indexFile(filePath, options = {}) {
  await loadIndex();

  const { skipSave = false, skipHealthCheck = false, ...chunkOptions } = options;
  const resolvedPath = toResolvedPath(filePath);
  const storedPath = toStoredPath(resolvedPath);
  const mtime = await getFileMtime(resolvedPath);

  const existing = metaCache.get(resolvedPath);
  if (existing && existing.lastModified >= mtime) {
    logDebug(`Skipping unchanged file: ${storedPath}`);
    return { indexed: false, chunks: existing.chunkCount };
  }

  if (!skipHealthCheck) {
    const available = await isOllamaAvailable();
    if (!available) {
      logWarn(`Ollama unavailable — cannot index ${storedPath}`);
      return { indexed: false, chunks: 0 };
    }
  }

  removeEntriesForResolvedPath(resolvedPath);

  const chunks = await chunkFile(resolvedPath, chunkOptions);
  if (chunks.length === 0) {
    metaCache.set(resolvedPath, { lastModified: mtime, chunkCount: 0 });
    markDirty();
    if (!skipSave) await saveIndex();
    return { indexed: true, chunks: 0 };
  }

  const embeddings = await generateEmbeddings(chunks.map((chunk) => chunk.content));
  let addedCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const embedding = embeddings[i];
    if (!Array.isArray(embedding) || embedding.length === 0) {
      logWarn(`Skipping chunk ${i} of ${storedPath} — embedding failed`);
      continue;
    }

    indexCache.push({
      id: chunks[i].id,
      filePath: storedPath,
      content: chunks[i].content,
      embedding,
      startLine: chunks[i].startLine,
      endLine: chunks[i].endLine,
      type: chunks[i].type,
      lastModified: mtime,
    });
    addedCount += 1;
  }

  metaCache.set(resolvedPath, { lastModified: mtime, chunkCount: addedCount });
  markDirty();

  if (!skipSave) await saveIndex();

  logInfo(`Indexed ${storedPath}: ${addedCount} chunks embedded`);
  return { indexed: true, chunks: addedCount };
}
