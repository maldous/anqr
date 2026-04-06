# ANQR RAG Embeddings

## 1. Directory Overview

This directory implements **ANQR RAG Embeddings** within the ANQR harness. Key immediate entries include `index.mjs`, `fetch-json-with-timeout.mjs`, `health-cache-ttl-ms.mjs`, `is-ollama-available.mjs`. The current inventory is 20 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **cosine-similarity.mjs** - Exports `cosineSimilarity`, which implements cosine similarity.
- **embedding-model.mjs** - Exports `EMBEDDING_MODEL`, a shared constant used by sibling modules.
- **embedding-timeout-ms.mjs** - Exports `EMBEDDING_TIMEOUT_MS`, a shared constant used by sibling modules.
- **failure-cooldown-ms.mjs** - Exports `FAILURE_COOLDOWN_MS`, a shared constant used by sibling modules.
- **fetch-json-with-timeout.mjs** - Exports `fetchJsonWithTimeout`, which fetches json with timeout.
- **generate-embedding.mjs** - Exports `generateEmbedding`, which implements generate embedding.
- **generate-embeddings.mjs** - Exports `generateEmbeddings`, which implements generate embeddings.
- **health-cache-ttl-ms.mjs** - Exports `HEALTH_CACHE_TTL_MS`, a shared constant used by sibling modules.
- **health-cache.mjs** - Exports `healthCache`, which implements health cache.
- **index.mjs** - Facade module that re-exports public members from `./ollama-base.mjs`, `./embedding-model.mjs`, `./embedding-timeout-ms.mjs`, `./ping-timeout-ms.mjs`, `./max-concurrency.mjs`, `./health-cache-ttl-ms.mjs`, and 11 more siblings.
- **is-ollama-available.mjs** - Exports `isOllamaAvailable`, which checks whether ollama available.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **max-concurrency.mjs** - Exports `MAX_CONCURRENCY`, a shared constant used by sibling modules.
- **normalize-embedding-response.mjs** - Exports `normalizeEmbeddingResponse`, which normalizes embedding response.
- **ollama-base.mjs** - Exports `OLLAMA_BASE`, a shared constant used by sibling modules.
- **ping-timeout-ms.mjs** - Exports `PING_TIMEOUT_MS`, a shared constant used by sibling modules.
- **remember-health.mjs** - Exports `rememberHealth`, which implements remember health.
- **request-embedding-once.mjs** - Exports `requestEmbeddingOnce`, which implements request embedding once.
- **set-health-cache.mjs** - Exports `setHealthCache`, which implements set health cache.
- **to-positive-int.mjs** - Exports `toPositiveInt`, which implements to positive int.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, and timer, scheduling, cooldown, or watchdog behavior. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/lib/rag/embeddings/index.mjs";
```

## 5. Dependencies

- **Internal relative modules** - `../../logger.mjs`, `./embedding-model.mjs`, `./embedding-timeout-ms.mjs`, `./failure-cooldown-ms.mjs`, `./fetch-json-with-timeout.mjs`, `./generate-embedding.mjs`, `./health-cache-ttl-ms.mjs`, `./health-cache.mjs`, `./is-ollama-available.mjs`, `./logger.mjs`, `./max-concurrency.mjs`, `./normalize-embedding-response.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
