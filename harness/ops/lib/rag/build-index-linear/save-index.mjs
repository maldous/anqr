import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { writeFile } from "./write-file.mjs";
import { sortEntries } from "./sort-entries.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function saveIndex(indexDir, data) {
  await mkdir(indexDir, { recursive: true });

  const { chunks, embeddings } = data;

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

  const sortedEntries = sortEntries(indexEntries);
  const indexJson = JSON.stringify(sortedEntries, null, 2);

  const indexPath = resolve(indexDir, "index.json");
  await writeFile(indexPath, indexJson, "utf-8");

  const meta = {
    chunkCount: sortedEntries.length,
    lastBuild: new Date().toISOString(),
    indexSizeBytes: Buffer.byteLength(indexJson, "utf-8"),
    source: "linear-export",
  };
  const metaPath = resolve(indexDir, "meta.json");
  await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf-8");

  logInfo(`Index saved: ${sortedEntries.length} entries`);
  logInfo(`Index size: ${(meta.indexSizeBytes / 1024).toFixed(1)} KB`);
}
