# ANQR Search Library

## 1. Directory Overview

This directory contains search functionality for the ANQR (Agentic Number Query Runner) harness. It provides two search implementations: **linear-search** for straightforward linear search operations and **hybrid-search** which combines BM25 keyword search with embedding-based semantic search using Reciprocal Rank Fusion (RRF).

The search library is designed to index and query code files within a project, supporting graceful degradation when optional components (like embeddings) are unavailable.

## 2. File Summaries

### Facade Modules (Auto-Generated)

- **linear-search.mjs** - Auto-generated facade that re-exports from `./linear-search/index.mjs`. Provides linear search capabilities for file content. The original file has been decomposed into sibling modules under the matching directory.

- **hybrid-search.mjs** - Auto-generated facade that re-exports from `./hybrid-search/index.mjs` and exports all from `./hybrid-search/runtime.mjs`. Implements hybrid search combining BM25 keyword search with embedding-based semantic search.

### Decomposed Modules

The facade files delegate to sibling modules under matching directories containing the actual implementations:
- `./linear-search/` - Contains the linear search implementation
- `./hybrid-search/` - Contains the hybrid search implementation with BM25 and embedding-based search

## 3. Overall Directory Function

This directory serves as the search infrastructure for the ANQR harness, enabling efficient file and code searching across the project. The search library works in conjunction with the RAG (Retrieval-Augmented Generation) components in the parent `lib/rag` directory.

**Key Features:**
- **Hybrid Search** - Combines BM25 (keyword) and embedding (semantic) search for comprehensive results
- **Graceful Degradation** - Automatically falls back to simpler methods when components are unavailable:
  - Full hybrid mode when both BM25 and embeddings are available
  - BM25-only mode when embeddings are unavailable
  - Basic substring matching when neither returns results
- **Caching** - BM25 index is cached at module level for fast repeated queries (~1ms per query after indexing)
- **File Type Support** - Indexes `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.json`, `.md` files
- **Directory Exclusion** - Automatically excludes `node_modules`, `.git`, `coverage`, `dist`, `build`

## 4. Usage Instructions

### Basic Hybrid Search

```javascript
import { hybridSearch } from "./hybrid-search.mjs";

// First, create or rebuild the index
import { createHybridSearchIndex } from "./hybrid-search.mjs";

createHybridSearchIndex([
  { path: "src/auth.ts", content: "export function authenticate() { ... }" },
  { path: "src/db.ts", content: "export class Database { ... }" },
]);

// Then perform search
const results = await hybridSearch("authentication middleware", {
  topK: 10,
  bm25Weight: 0.5,
  embeddingWeight: 0.5,
  useEmbeddings: true,
});

// results: [{ path, score, bm25Score, embeddingScore, snippet }, ...]
```

### High-Level Entry Point

```javascript
import { searchFiles } from "./hybrid-search.mjs";

const { files, count, query, method } = await searchFiles("database connection", {
  rootDir: process.cwd(),
  topK: 20,
  useEmbeddings: true,
});

// method: 'hybrid' | 'bm25' | 'basic'
```

### Get Search Stats

```javascript
import { getSearchStats } from "./hybrid-search.mjs";

const stats = getSearchStats();
// {
//   indexed: true,
//   documentCount: 847,
//   builtAt: '2025-01-15T10:30:00.000Z',
//   embeddingsAvailable: false,
//   vectorStoreReady: false,
// }
```

### Options Reference

| Option | Type | Default | Description |
| ----------------- | --------- | ------- | ---------------------------------------- |
| `topK` | `number` | `20` | Maximum results to return |
| `bm25Weight` | `number` | `0.5` | Weight for BM25 scores in RRF (0-1) |
| `embeddingWeight` | `number` | `0.5` | Weight for embedding scores in RRF (0-1) |
| `useEmbeddings` | `boolean` | `true` | Whether to attempt embedding search |

## 5. Dependencies

### Runtime Dependencies

- **minisearch** - BM25 full-text search library (npm package, already installed)

### Optional Dependencies

- **../rag/embeddings.mjs** - For embedding generation (`generateEmbedding`, `cosineSimilarity`, `isOllamaAvailable`)
- **../rag/vector-store.mjs** - For pre-built vector index (`search`, `isIndexReady`)

### Internal Dependencies

- **../logger.mjs** - Structured logging for debugging and monitoring

## 6. Additional Comments

### Reciprocal Rank Fusion (RRF)

RRF merges multiple ranked lists without requiring score normalization. The formula used:

```
score(d) = 1 / (k + rank)
```

Where `k = 60` (the standard constant from the [original RRF paper](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)).

The final score for each document is the weighted sum:
```
final(d) = bm25Weight × rrf_bm25(d) + embeddingWeight × rrf_embedding(d)
```

### Caching Behavior

The BM25 index is cached at the module level. It is only rebuilt when:
- No index exists (first call)
- The file set fingerprint changes (files added/removed)

This makes repeated searches over the same codebase very fast (~1ms per query after initial indexing).

### Linear Search

The `linear-search.mjs` module provides a simpler, linear search implementation for cases where the full hybrid search is not needed. This is useful for smaller codebases or when only keyword matching is required.