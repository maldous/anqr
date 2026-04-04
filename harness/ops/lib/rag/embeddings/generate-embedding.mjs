import { EMBEDDING_MODEL } from "./embedding-model.mjs";
import { EMBEDDING_TIMEOUT_MS } from "./embedding-timeout-ms.mjs";
import { isOllamaAvailable } from "./is-ollama-available.mjs";
import { rememberHealth } from "./remember-health.mjs";
import { requestEmbeddingOnce } from "./request-embedding-once.mjs";
import { logDebug, logWarn, logError } from "./logger.mjs";

export async function generateEmbedding(text, options = {}) {
  if (!text || !String(text).trim()) {
    logWarn("generateEmbedding called with empty text");
    return null;
  }

  if (!options.skipHealthCheck) {
    const available = await isOllamaAvailable();
    if (!available) return null;
  }

  const prompt = String(text);

  try {
    let result = await requestEmbeddingOnce("/api/embeddings", {
      model: EMBEDDING_MODEL,
      prompt,
    });

    if (!result.ok && result.status === 404) {
      result = await requestEmbeddingOnce("/api/embed", {
        model: EMBEDDING_MODEL,
        input: prompt,
      });
    }

    if (!result.ok) {
      logError(`Ollama embeddings request failed (${result.status}): ${result.body}`);
      rememberHealth(false);
      return null;
    }

    rememberHealth(true);
    logDebug(
      `Generated embedding: ${result.embedding.length} dimensions for ${prompt.length} chars`,
    );
    return result.embedding;
  } catch (err) {
    if (err?.name === "AbortError") {
      logError(`Embedding request timed out after ${EMBEDDING_TIMEOUT_MS}ms`);
    } else {
      logError(`Embedding request failed: ${err?.message || err}`);
    }
    rememberHealth(false);
    return null;
  }
}
