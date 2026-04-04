import { cosineSimilarity, generateEmbedding } from "../embeddings.mjs";

import { indexCache } from "./index-cache.mjs";
import { loadIndex } from "./load-index.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

export async function search(query, topK = 5, options = {}) {
  await loadIndex();

  if (!query || !String(query).trim()) {
    return [];
  }
  if (!indexCache || indexCache.length === 0) {
    logWarn("Search called on empty index");
    return [];
  }

  const queryEmbedding = await generateEmbedding(String(query));
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    logError("Failed to embed search query — is Ollama running?");
    return [];
  }

  const limit = Math.max(1, Number(topK) || 5);
  const perFileLimit =
    Number.isFinite(options.perFileLimit) && options.perFileLimit > 0
      ? Math.floor(options.perFileLimit)
      : Number.POSITIVE_INFINITY;

  const scored = [];
  for (const entry of indexCache) {
    if (!Array.isArray(entry.embedding) || entry.embedding.length === 0) continue;
    try {
      scored.push({
        score: cosineSimilarity(queryEmbedding, entry.embedding),
        filePath: entry.filePath,
        content: entry.content,
        startLine: entry.startLine,
        endLine: entry.endLine,
        type: entry.type,
      });
    } catch (err) {
      logDebug(`Similarity computation failed for ${entry.id}: ${err?.message || err}`);
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const results = [];
  const countsByFile = new Map();
  for (const item of scored) {
    const count = countsByFile.get(item.filePath) || 0;
    if (count >= perFileLimit) continue;
    results.push(item);
    countsByFile.set(item.filePath, count + 1);
    if (results.length >= limit) break;
  }

  logInfo(
    `Search for "${String(query).slice(0, 60)}": ${results.length} results (top score: ${results[0]?.score?.toFixed(4) || "N/A"})`,
  );
  return results;
}
