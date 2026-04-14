# Embeddings

## Purpose

Directory for RAG indexing and retrieval support; immediate files include `cosine-similarity.mjs`, `embedding-model.mjs`, `embedding-timeout-ms.mjs`, `failure-cooldown-ms.mjs`, and others.

## Contents

- 20 immediate files
- 0 child directories

## Key Files

- `cosine-similarity.mjs` - Exports `cosineSimilarity`, the main helper defined in this file.
- `embedding-model.mjs` - Exports `EMBEDDING_MODEL`, a shared constant or state value used by sibling modules.
- `embedding-timeout-ms.mjs` - Exports `EMBEDDING_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `failure-cooldown-ms.mjs` - Exports `FAILURE_COOLDOWN_MS`, a shared constant or state value used by sibling modules.
- `fetch-json-with-timeout.mjs` - Exports `fetchJsonWithTimeout`, the main helper defined in this file.
- `generate-embedding.mjs` - Exports `generateEmbedding`, the main helper defined in this file.
- `generate-embeddings.mjs` - Exports `generateEmbeddings`, the main helper defined in this file.
- `health-cache-ttl-ms.mjs` - Exports `HEALTH_CACHE_TTL_MS`, a shared constant or state value used by sibling modules.
- `health-cache.mjs` - Exports `healthCache`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-ollama-available.mjs` - Exports `isOllamaAvailable`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `max-concurrency.mjs` - Exports `MAX_CONCURRENCY`, a shared constant or state value used by sibling modules.
- `normalize-embedding-response.mjs` - Exports `normalizeEmbeddingResponse`, the main helper defined in this file.
- `ollama-base.mjs` - Exports `OLLAMA_BASE`, a shared constant or state value used by sibling modules.
- `ping-timeout-ms.mjs` - Exports `PING_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `remember-health.mjs` - Exports `rememberHealth`, the main helper defined in this file.
- `request-embedding-once.mjs` - Exports `requestEmbeddingOnce`, the main helper defined in this file.
- `set-health-cache.mjs` - Exports `setHealthCache`, the main helper defined in this file.
- `to-positive-int.mjs` - Exports `toPositiveInt`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 20 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
