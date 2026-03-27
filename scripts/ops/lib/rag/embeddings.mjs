/**
 * embeddings.mjs — Embedding generation via local Ollama for RAG pipeline
 *
 * Generates vector embeddings for text chunks using the Ollama embeddings API.
 * Uses the same model configured for Symphony runners (qwen2.5-coder:3b-instruct).
 *
 * Features:
 *   - Single and batch embedding generation
 *   - Cosine similarity comparison
 *   - Health check for Ollama availability
 *   - Configurable concurrency and timeouts
 *   - Graceful fallback when Ollama is unavailable
 *
 * Usage:
 *   import { generateEmbedding, generateEmbeddings, cosineSimilarity } from './embeddings.mjs';
 *   const vec = await generateEmbedding('function hello() { return "world"; }');
 *   const similarity = cosineSimilarity(vecA, vecB);
 */

import { createLogger } from "../logger.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger("rag-embeddings");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Ollama API base URL */
const OLLAMA_BASE = process.env.OLLAMA_API_BASE || "http://127.0.0.1:11434";

/** Embedding model — matches RUNNER_OLLAMA_MODEL from symphony-config */
const EMBEDDING_MODEL = "qwen2.5-coder:3b-instruct";

/** Timeout per single embedding request (ms) */
const EMBEDDING_TIMEOUT_MS = 10_000;

/** Max concurrent embedding requests */
const MAX_CONCURRENCY = 2;

/** Health-check ping timeout (ms) */
const PING_TIMEOUT_MS = 3_000;

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

/**
 * Check whether the Ollama service is reachable and the embedding model is available.
 *
 * @returns {Promise<boolean>} true if Ollama is running and responsive
 */
export async function isOllamaAvailable() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    const res = await fetch(`${OLLAMA_BASE}/api/version`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      logWarn(`Ollama health check returned status ${res.status}`);
      return false;
    }

    const data = await res.json();
    logDebug(`Ollama available: v${data.version}`);
    return true;
  } catch (err) {
    logWarn(`Ollama unavailable at ${OLLAMA_BASE}: ${err.message}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Single embedding
// ---------------------------------------------------------------------------

/**
 * Generate an embedding vector for a single text string.
 *
 * Returns null if Ollama is unavailable or the request fails, rather than
 * throwing, so callers can degrade gracefully.
 *
 * @param {string} text - The text to embed
 * @returns {Promise<number[] | null>} Embedding vector (float array) or null on failure
 */
export async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) {
    logWarn("generateEmbedding called with empty text");
    return null;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), EMBEDDING_TIMEOUT_MS);

    const res = await fetch(`${OLLAMA_BASE}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: text,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logError(`Ollama embeddings API returned ${res.status}: ${body}`);
      return null;
    }

    const data = await res.json();

    if (!data.embedding || !Array.isArray(data.embedding)) {
      logError("Ollama response missing embedding array", { keys: Object.keys(data) });
      return null;
    }

    logDebug(`Generated embedding: ${data.embedding.length} dimensions for ${text.length} chars`);
    return data.embedding;
  } catch (err) {
    if (err.name === "AbortError") {
      logError(`Embedding request timed out after ${EMBEDDING_TIMEOUT_MS}ms`);
    } else {
      logError(`Embedding request failed: ${err.message}`);
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Batch embeddings with concurrency control
// ---------------------------------------------------------------------------

/**
 * Generate embeddings for multiple texts with a concurrency limit.
 *
 * Processes up to MAX_CONCURRENCY requests in parallel.  Any individual
 * failure returns null for that position rather than aborting the batch.
 *
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<Array<number[] | null>>} Array of embedding vectors (or null for failures)
 */
export async function generateEmbeddings(texts) {
  if (!texts || texts.length === 0) return [];

  logInfo(`Generating embeddings for ${texts.length} texts (concurrency: ${MAX_CONCURRENCY})`);

  const results = new Array(texts.length).fill(null);
  let completed = 0;

  // Process in batches of MAX_CONCURRENCY
  for (let i = 0; i < texts.length; i += MAX_CONCURRENCY) {
    const batch = texts.slice(i, i + MAX_CONCURRENCY);
    const batchPromises = batch.map((text, batchIdx) =>
      generateEmbedding(text).then((embedding) => {
        const globalIdx = i + batchIdx;
        results[globalIdx] = embedding;
        completed++;
        if (completed % 10 === 0 || completed === texts.length) {
          logDebug(`Embedding progress: ${completed}/${texts.length}`);
        }
      }),
    );

    await Promise.all(batchPromises);
  }

  const successCount = results.filter((r) => r !== null).length;
  logInfo(`Embedding batch complete: ${successCount}/${texts.length} succeeded`);

  return results;
}

// ---------------------------------------------------------------------------
// Vector math
// ---------------------------------------------------------------------------

/**
 * Compute the cosine similarity between two embedding vectors.
 *
 * Returns a value between -1 and 1 where:
 *   - 1 means identical direction
 *   - 0 means orthogonal (unrelated)
 *   - -1 means opposite direction
 *
 * @param {number[]} a - First embedding vector
 * @param {number[]} b - Second embedding vector
 * @returns {number} Cosine similarity score
 * @throws {Error} If vectors have different lengths or are empty
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length === 0 || b.length === 0) {
    throw new Error("cosineSimilarity requires non-empty vectors");
  }
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}
