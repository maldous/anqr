// Generated from ../../../../scripts/ops/lib/rag/embeddings.mjs:173

import { MAX_CONCURRENCY } from "./max-concurrency.mjs";
import { generateEmbedding } from "./generate-embedding.mjs";
import { isOllamaAvailable } from "./is-ollama-available.mjs";
import { toPositiveInt } from "./to-positive-int.mjs";
import { logDebug, logInfo } from "./logger.mjs";

export async function generateEmbeddings(texts, options = {}) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const available = await isOllamaAvailable();
  if (!available) {
    return Array.from({ length: texts.length }, () => null);
  }

  const results = Array.from({ length: texts.length }, () => null);
  const configuredConcurrency = toPositiveInt(options.maxConcurrency, MAX_CONCURRENCY);
  const workerCount = Math.min(configuredConcurrency, texts.length);
  let cursor = 0;
  let completed = 0;

  logInfo(`Generating embeddings for ${texts.length} texts (concurrency: ${workerCount})`);

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= texts.length) return;

      results[index] = await generateEmbedding(texts[index], { skipHealthCheck: true });
      completed += 1;

      if (completed % 10 === 0 || completed === texts.length) {
        logDebug(`Embedding progress: ${completed}/${texts.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  const successCount = results.filter((value) => Array.isArray(value)).length;
  logInfo(`Embedding batch complete: ${successCount}/${texts.length} succeeded`);
  return results;
}
