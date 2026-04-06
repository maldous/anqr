# ANQR RAG Embeddings

## 1. Directory Overview

This directory contains embedding generation utilities for the RAG (Retrieval Augmented Generation)
system using Ollama as the embedding provider. It provides functions to generate text embeddings,
check Ollama availability, manage health caching, and compute vector similarity. The module supports
both single embedding generation and batch processing with configurable concurrency. It currently
contains 20 files and 0 subdirectories.

## 2. File Summaries

### Files

- **cosine-similarity.mjs** - Computes cosine similarity between two embedding vectors. Throws errors for empty vectors or dimension mismatches.
- **embedding-model.mjs** - Specifies the embedding model to use. Defaults to `qwen2.5-coder:3b-instruct`. Can be overridden via `RAG_EMBEDDING_MODEL` or `OLLAMA_EMBEDDING_MODEL` environment variables.
- **embedding-timeout-ms.mjs** - Sets the embedding request timeout in milliseconds, defaulting to 15,000ms. Configurable via `RAG_EMBEDDING_TIMEOUT_MS`.
- **failure-cooldown-ms.mjs** - Sets the cooldown period after a failure before retrying, defaulting to 10,000ms. Configurable via `RAG_OLLAMA_FAILURE_COOLDOWN_MS`.
- **fetch-json-with-timeout.mjs** - Wrapper around fetch that adds timeout support using AbortController. Accepts URL, fetch options, and timeout in milliseconds.
- **generate-embedding.mjs** - Main function to generate a single embedding for text input. Supports health checks, fallback API endpoints (`/api/embeddings` and `/api/embed`), and error handling.
- **generate-embeddings.mjs** - Batch function to generate embeddings for multiple texts with configurable concurrency using a worker pool pattern.
- **health-cache-ttl-ms.mjs** - Sets the health check cache TTL in milliseconds, defaulting to 5,000ms. Configurable via `RAG_OLLAMA_HEALTH_CACHE_TTL_MS`.
- **health-cache.mjs** - In-memory cache object storing health state with `value`, `expiresAt`, and `nextRetryAt` properties.
- **index.mjs** - Generated facade index that exports all public API members from the various modules.
- **is-ollama-available.mjs** - Checks if Ollama is available by pinging the `/api/version` endpoint. Uses caching to avoid repeated health checks.
- **logger.mjs** - Shared logger for this module using the project's logger factory with namespace "rag-embeddings".
- **max-concurrency.mjs** - Defines maximum concurrent embedding requests, defaulting to 2. Configurable via `RAG_EMBEDDING_MAX_CONCURRENCY`.
- **normalize-embedding-response.mjs** - Normalizes Ollama embedding responses across different API formats (single embedding array or nested embeddings array).
- **ollama-base.mjs** - Defines the Ollama API base URL, defaulting to `http://127.0.0.1:11434`. Reads from `OLLAMA_API_BASE` environment variable.
- **ping-timeout-ms.mjs** - Sets the health check ping timeout in milliseconds, defaulting to 3,000ms. Configurable via `RAG_OLLAMA_PING_TIMEOUT_MS`.
- **remember-health.mjs** - Updates health cache with a value and sets expiration times based on success or failure state.
- **request-embedding-once.mjs** - Low-level function that makes a single embedding request to Ollama with timeout support.
- **set-health-cache.mjs** - Helper to update the health cache state using Object.assign.
- **to-positive-int.mjs** - Utility function that parses a value to a positive integer, returning a fallback value if parsing fails or the result is not positive.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
