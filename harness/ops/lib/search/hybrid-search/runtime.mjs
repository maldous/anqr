try {
  await import("../../rag/embeddings.mjs");
} catch {
  // embeddings module not available – will fall back to BM25-only
}

try {
  await import("../../rag/vector-store.mjs");
} catch {
  // vector-store module not available – will fall back to BM25-only
}
