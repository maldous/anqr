// Generated runtime carry-forward.

import { vectorSearch } from "./index.mjs";

try {
  ({ generateEmbedding, cosineSimilarity, isOllamaAvailable } =
    await import("../../rag/embeddings.mjs"));
} catch {
  // embeddings module not available – will fall back to BM25-only
}

try {
  ({ search: vectorSearch, isIndexReady } = await import("../../rag/vector-store.mjs"));
} catch {
  // vector-store module not available – will fall back to BM25-only
}

import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";
