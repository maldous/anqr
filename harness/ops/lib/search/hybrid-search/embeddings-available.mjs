// Generated from ../../../../scripts/ops/lib/search/hybrid-search.mjs:135

import { cosineSimilarity } from "./cosine-similarity.mjs";
import { generateEmbedding } from "./generate-embedding.mjs";
import { isOllamaAvailable } from "./is-ollama-available.mjs";

export async function embeddingsAvailable() {
  try {
    if (!generateEmbedding || !cosineSimilarity) return false;
    if (isOllamaAvailable && !(await isOllamaAvailable())) return false;
    return true;
  } catch {
    return false;
  }
}
