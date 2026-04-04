export function normalizeEmbeddingResponse(data) {
  if (Array.isArray(data?.embedding)) return data.embedding;
  if (Array.isArray(data?.embeddings) && Array.isArray(data.embeddings[0]))
    return data.embeddings[0];
  return null;
}
