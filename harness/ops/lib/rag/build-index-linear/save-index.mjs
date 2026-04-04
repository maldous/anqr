// Generated from ../../../../scripts/ops/lib/rag/build-index-linear.mjs:38

import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { writeFile } from "./write-file.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function saveIndex(indexDir, data) {
  await mkdir(indexDir, { recursive: true });

  const { chunks, embeddings } = data;

  // Build index entries
  const indexEntries = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];

    if (!Array.isArray(embedding) || embedding.length === 0) {
      logWarn(`Skipping chunk ${chunk.id} — embedding failed`);
      continue;
    }

    indexEntries.push({
      id: chunk.id,
      filePath: chunk.filePath,
      content: chunk.content,
      embedding,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      type: chunk.type,
      metadata: chunk.metadata,
    });
  }

  // Write index file
  const indexPath = resolve(indexDir, "index.json");
  await writeFile(indexPath, JSON.stringify(indexEntries, null, 2), "utf-8");

  // Write metadata file
  const meta = {
    chunkCount: indexEntries.length,
    lastBuild: new Date().toISOString(),
    indexSizeBytes: JSON.stringify(indexEntries).length,
    source: "linear-export",
  };
  const metaPath = resolve(indexDir, "meta.json");
  await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf-8");

  logInfo(`Index saved: ${indexEntries.length} entries`);
  logInfo(`Index size: ${(meta.indexSizeBytes / 1024).toFixed(1)} KB`);
}
