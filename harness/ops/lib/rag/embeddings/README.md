# ANQR RAG Embeddings

## 1. Directory Overview

This directory contains embedding generation utilities for the RAG (Retrieval Augmented Generation) system using Ollama as the embedding provider. It provides functions to generate text embeddings, check Ollama availability, manage health caching, and compute vector similarity. The module supports both single embedding generation and batch processing with configurable concurrency.

## 2. File Summaries

### Configuration Files

- **ollama-base.mjs** - Defines the Ollama API base URL, defaulting to `http://127.0.0.1:11434`. Reads from `OLLAMA_API_BASE` environment variable.

- **embedding-model.mjs** - Specifies the embedding model to use. Defaults to `qwen2.5-coder:3b-instruct`. Can be overridden via `RAG_EMBEDDING_MODEL` or `OLLAMA_EMBEDDING_MODEL` environment variables.

- **embedding-timeout-ms.mjs** - Sets the embedding request timeout in milliseconds, defaulting to 15,000ms. Configurable via `RAG_EMBEDDING_TIMEOUT_MS`.

- **ping-timeout-ms.mjs** - Sets the health check ping timeout in milliseconds, defaulting to 3,000ms. Configurable via `RAG_OLLAMA_PING_TIMEOUT_MS`.

- **max-concurrency.mjs** - Defines maximum concurrent embedding requests, defaulting to 2. Configurable via `RAG_EMBEDDING_MAX_CONCURRENCY`.

- **health-cache-ttl-ms.mjs** - Sets the health check cache TTL in milliseconds, defaulting to 5,000ms. Configurable via `RAG_OLLAMA_HEALTH_CACHE_TTL_MS`.

- **failure-cooldown-ms.mjs** - Sets the cooldown period after a failure before retrying, defaulting to 10,000ms. Configurable via `RAG_OLLAMA_FAILURE_COOLDOWN_MS`.

### Utility Functions

- **to-positive-int.mjs** - Utility function that parses a value to a positive integer, returning a fallback value if parsing fails or the result is not positive.

- **fetch-json-with-timeout.mjs** - Wrapper around fetch that adds timeout support using AbortController. Accepts URL, fetch options, and timeout in milliseconds.

- **normalize-embedding-response.mjs** - Normalizes Ollama embedding responses across different API formats (single embedding array or nested embeddings array).

### Health Check & Caching

- **health-cache.mjs** - In-memory cache object storing health state with `value`, `expiresAt`, and `nextRetryAt` properties.

- **set-health-cache.mjs** - Helper to update the health cache state using Object.assign.

- **remember-health.mjs** - Updates health cache with a value and sets expiration times based on success or failure state.

- **is-ollama-available.mjs** - Checks if Ollama is available by pinging the `/api/version` endpoint. Uses caching to avoid repeated health checks.

### Core Functions

- **generate-embedding.mjs** - Main function to generate a single embedding for text input. Supports health checks, fallback API endpoints (`/api/embeddings` and `/api/embed`), and error handling.

- **generate-embeddings.mjs** - Batch function to generate embeddings for multiple texts with configurable concurrency using a worker pool pattern.

- **request-embedding-once.mjs** - Low-level function that makes a single embedding request to Ollama with timeout support.

- **cosine-similarity.mjs** - Computes cosine similarity between two embedding vectors. Throws errors for empty vectors or dimension mismatches.

### Supporting Files

- **logger.mjs** - Shared logger for this module using the project's logger factory with namespace "rag-embeddings".

- **index.mjs** - Generated facade index that exports all public API members from the various modules.

## 3. Overall Directory Function

This directory serves as the embedding generation layer for the RAG system. The files work together to provide:

- **Configuration Management**: All timeouts, limits, and settings are configurable via environment variables with sensible defaults.

- **Health Monitoring**: The isOllamaAvailable function checks Ollama status with caching to avoid overwhelming the service. Failures trigger cooldown periods.

- **Embedding Generation**: The generateEmbedding function handles single embeddings with automatic endpoint fallback, while generateEmbeddings provides batch processing with controlled concurrency.

- **Vector Operations**: cosineSimilarity enables similarity calculations between embedding vectors for retrieval tasks.

The module uses a worker pool pattern for batch processing, allowing configurable concurrency while avoiding resource exhaustion. It gracefully handles Ollama unavailability by returning null embeddings rather than throwing errors.

## 4. Usage Instructions

### Importing

```javascript
// Import from the facade index (recommended)
import {
  generateEmbedding,
  generateEmbeddings,
  isOllamaAvailable,
  cosineSimilarity,
  OLLAMA_BASE,
  EMBEDDING_MODEL,
} from "./ops/lib/rag/embeddings/index.mjs";

// Or import individual modules as needed
import { generateEmbedding } from "./ops/lib/rag/embeddings/generate-embedding.mjs";
```

### Generating a Single Embedding

```javascript
const embedding = await generateEmbedding("Your text here");
if (embedding) {
  console.log(`Generated embedding with ${embedding.length} dimensions`);
}
```

### Generating Multiple Embeddings

```javascript
const texts = ["Text 1", "Text 2", "Text 3"];
const embeddings = await generateEmbeddings(texts, { maxConcurrency: 4 });
```

### Computing Similarity

```javascript
const similarity = cosineSimilarity(embedding1, embedding2);
```

### Checking Ollama Availability

```javascript
const available = await isOllamaAvailable();
console.log(`Ollama available: ${available}`);
```

## 5. Dependencies

### Internal Dependencies

- **../../logger.mjs** - Project logger factory used by the logger.mjs in this directory

### Environment Variables

- **OLLAMA_API_BASE** - Ollama API base URL (default: `http://127.0.0.1:11434`)
- **RAG_EMBEDDING_MODEL** / **OLLAMA_EMBEDDING_MODEL** - Embedding model name (default: `qwen2.5-coder:3b-instruct`)
- **RAG_EMBEDDING_TIMEOUT_MS** - Embedding request timeout (default: 15000ms)
- **RAG_EMBEDDING_MAX_CONCURRENCY** - Maximum concurrent requests (default: 2)
- **RAG_OLLAMA_PING_TIMEOUT_MS** - Health check timeout (default: 3000ms)
- **RAG_OLLAMA_HEALTH_CACHE_TTL_MS** - Health cache TTL (default: 5000ms)
- **RAG_OLLAMA_FAILURE_COOLDOWN_MS** - Failure cooldown period (default: 10000ms)

### External Services

- **Ollama** - Local Ollama server must be running and accessible at the configured base URL

## 6. Additional Comments

- **Endpoint Fallback**: The generateEmbedding function automatically tries `/api/embeddings` first, then falls back to `/api/embed` if a 404 is received, providing compatibility with different Ollama versions.

- **Fail-Safe Design**: All functions gracefully handle errors by returning null values rather than throwing, allowing calling code to handle unavailable states without try-catch blocks for every call.

- **Health Caching**: Health checks are cached to reduce overhead. Successful checks are cached for 5 seconds, while failures trigger a 10-second cooldown before retrying.

- **Batch Processing**: The generateEmbeddings function uses a worker pool pattern with configurable concurrency, defaulting to 2 concurrent workers to avoid overwhelming the Ollama server.

- **Vector Dimensions**: The embedding dimension depends on the model used. The default `qwen2.5-coder:3b-instruct` produces vectors appropriate for code-related semantic search.