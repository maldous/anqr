// Generated from ../../../../scripts/ops/lib/rag/embeddings.mjs:68

import { EMBEDDING_TIMEOUT_MS } from "./embedding-timeout-ms.mjs";
import { OLLAMA_BASE } from "./ollama-base.mjs";
import { fetchJsonWithTimeout } from "./fetch-json-with-timeout.mjs";
import { normalizeEmbeddingResponse } from "./normalize-embedding-response.mjs";

export async function requestEmbeddingOnce(endpoint, payload) {
  const response = await fetchJsonWithTimeout(
    `${OLLAMA_BASE}${endpoint}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    EMBEDDING_TIMEOUT_MS,
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return { ok: false, status: response.status, body };
  }

  const data = await response.json();
  const embedding = normalizeEmbeddingResponse(data);
  if (!Array.isArray(embedding) || embedding.length === 0) {
    return { ok: false, status: response.status, body: "missing embedding array" };
  }

  return { ok: true, embedding };
}
