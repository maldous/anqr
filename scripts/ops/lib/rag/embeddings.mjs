/**
 * embeddings.mjs — Embedding generation via local Ollama for the RAG pipeline
 *
 * Improvements over the baseline:
 *   - health checks are cached to avoid pinging Ollama for every file
 *   - embedding endpoint fallback supports both /api/embeddings and /api/embed
 *   - request timeouts are cleaned up correctly on success and failure
 *   - model/base/timeouts/concurrency are configurable from the environment
 */

import { createLogger } from "../logger.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger("rag-embeddings");

const OLLAMA_BASE = String(process.env.OLLAMA_API_BASE || "http://127.0.0.1:11434").replace(
  /\/+$/,
  "",
);
const EMBEDDING_MODEL =
  process.env.RAG_EMBEDDING_MODEL ||
  process.env.OLLAMA_EMBEDDING_MODEL ||
  "qwen2.5-coder:3b-instruct";
const EMBEDDING_TIMEOUT_MS = toPositiveInt(process.env.RAG_EMBEDDING_TIMEOUT_MS, 15_000);
const PING_TIMEOUT_MS = toPositiveInt(process.env.RAG_OLLAMA_PING_TIMEOUT_MS, 3_000);
const MAX_CONCURRENCY = toPositiveInt(process.env.RAG_EMBEDDING_MAX_CONCURRENCY, 2);
const HEALTH_CACHE_TTL_MS = toPositiveInt(process.env.RAG_OLLAMA_HEALTH_CACHE_TTL_MS, 5_000);
const FAILURE_COOLDOWN_MS = toPositiveInt(process.env.RAG_OLLAMA_FAILURE_COOLDOWN_MS, 10_000);

let healthCache = {
  value: null,
  expiresAt: 0,
  nextRetryAt: 0,
};

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function fetchJsonWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

function rememberHealth(value) {
  const now = Date.now();
  healthCache = {
    value,
    expiresAt: now + HEALTH_CACHE_TTL_MS,
    nextRetryAt: value ? now : now + FAILURE_COOLDOWN_MS,
  };
}

function normalizeEmbeddingResponse(data) {
  if (Array.isArray(data?.embedding)) return data.embedding;
  if (Array.isArray(data?.embeddings) && Array.isArray(data.embeddings[0]))
    return data.embeddings[0];
  return null;
}

async function requestEmbeddingOnce(endpoint, payload) {
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

export async function isOllamaAvailable(options = {}) {
  const force = Boolean(options.force);
  const now = Date.now();

  if (!force) {
    if (healthCache.value !== null && healthCache.expiresAt > now) {
      return healthCache.value;
    }
    if (healthCache.value === false && healthCache.nextRetryAt > now) {
      return false;
    }
  }

  try {
    const response = await fetchJsonWithTimeout(`${OLLAMA_BASE}/api/version`, {}, PING_TIMEOUT_MS);
    if (!response.ok) {
      logWarn(`Ollama health check returned status ${response.status}`);
      rememberHealth(false);
      return false;
    }

    const data = await response.json().catch(() => ({}));
    logDebug(`Ollama available at ${OLLAMA_BASE}${data?.version ? ` (v${data.version})` : ""}`);
    rememberHealth(true);
    return true;
  } catch (err) {
    logWarn(`Ollama unavailable at ${OLLAMA_BASE}: ${err?.message || err}`);
    rememberHealth(false);
    return false;
  }
}

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

export async function generateEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const available = await isOllamaAvailable();
  if (!available) {
    return Array.from({ length: texts.length }, () => null);
  }

  const results = Array.from({ length: texts.length }, () => null);
  const workerCount = Math.min(MAX_CONCURRENCY, texts.length);
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

export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    throw new Error("cosineSimilarity requires non-empty vectors");
  }
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dot / magnitude;
}
