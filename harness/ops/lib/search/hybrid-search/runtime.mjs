try {
  const { generateEmbedding, cosineSimilarity, isOllamaAvailable } =
    await import("../../rag/embeddings.mjs");
} catch {
  // embeddings module not available – will fall back to BM25-only
}

try {
  const { search: vectorSearch, isIndexReady } = await import("../../rag/vector-store.mjs");
} catch {
  // vector-store module not available – will fall back to BM25-only
}
