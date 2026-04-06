# ANQR Hybrid Search

## 1. Directory Overview

This directory contains the hybrid search implementation for the ANQR (Agentic Number Query Runner) harness. It provides a unified search capability that combines BM25 keyword-based search with embedding-based vector search to deliver relevant file search results. The module uses Reciprocal Rank Fusion (RRF) to merge results from both search methods, providing superior search quality over either method alone.

## 2. File Summaries

### Core Search Implementation

- **hybrid-search.mjs** - Main entry point providing the `hybridSearch()` function. Combines BM25 and embedding search using configurable weights and RRF for result fusion. Returns top-K results with snippets.

- **search-files.mjs** - High-level search API that automatically builds/updates the search index. Returns `{ files, count, query, method }` object indicating whether hybrid, bm25, or basic search was used.

- **warm-search-index.mjs** - Index warming utility that checks if the index needs rebuilding based on file fingerprint. Returns `{ indexed, documentCount, rebuilt }`.

### Index Management

- **create-hybrid-search-index.mjs** - Builds the MiniSearch BM25 index over project files. Configures boosting for filenames (3x), paths (2x), and content (1x). Enables prefix search and fuzzy matching (0.2).

- **mini-search-index.mjs** - Module-level variable storing the MiniSearch index instance. Exports `miniSearchIndex` and `setMiniSearchIndex()`.

- **index-fingerprint.mjs** - Tracks the fingerprint of files used to build the index. Enables efficient index invalidation detection. Exports `indexFingerprint` and `setIndexFingerprint()`.

- **indexed-doc-count.mjs** - Tracks the number of documents in the index. Exports `indexedDocCount` and `setIndexedDocCount()`.

- **index-built-at.mjs** - Records when the index was built (timestamp). Exports `indexBuiltAt` and `setIndexBuiltAt()`.

- **compute-fingerprint.mjs** - Computes a fingerprint from file list for change detection. Uses sorted file paths, count, and first/last file names.

### File Collection

- **collect-project-files.mjs** - Collects all indexable files from the project. Uses `git ls-files` when available, falls back to directory walk. Respects excluded directories and file size limits.

- **indexable-extensions.mjs** - Defines indexable file extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.json`, `.md`.

- **excluded-dirs.mjs** - Defines excluded directories: `node_modules`, `.git`, `coverage`, `dist`, `build`.

- **max-file-bytes.mjs** - Maximum file size for indexing: 512KB.

### Embedding/Vector Search

- **generate-embedding.mjs** - Lazy-loaded embedding generation function. Imported from `../../rag/embeddings.mjs` at runtime.

- **cosine-similarity.mjs** - Lazy-loaded cosine similarity function for re-ranking. Imported from `../../rag/embeddings.mjs` at runtime.

- **vector-search.mjs** - Lazy-loaded vector search function. Imported from `../../rag/vector-store.mjs` at runtime.

- **is-index-ready.mjs** - Lazy-loaded index readiness check. Imported from `../../rag/vector-store.mjs` at runtime.

- **is-ollama-available.mjs** - Lazy-loaded Ollama availability check.

- **embeddings-available.mjs** - Checks if embedding capabilities are available. Returns false if embeddings or Ollama unavailable.

- **vector-store-ready.mjs** - Wrapper around `isIndexReady()` with error handling.

### Result Processing

- **reciprocal-rank-fusion.mjs** - Implements RRF algorithm to combine BM25 and embedding results. Uses RRF_K=60 constant. Supports weighted combination via `bm25Weight` and `embeddingWeight` parameters.

- **rrf-k.mjs** - Reciprocal Rank Fusion K constant set to 60.

- **extract-snippet.mjs** - Extracts a snippet around the first matching term in content. Uses 120-character radius, adds ellipsis for truncated content.

- **get-search-stats.mjs** - Returns current search index statistics: indexed status, document count, build time, embeddings availability, vector store readiness.

### Runtime & Facade

- **runtime.mjs** - Runtime carry-forward that lazy-loads embedding and vector search dependencies from `../../rag/embeddings.mjs` and `../../rag/vector-store.mjs`. Falls back gracefully if modules unavailable.

- **index.mjs** - Generated facade index exporting all public API members including `hybridSearch`, `searchFiles`, `warmSearchIndex`, `createHybridSearchIndex`, `collectProjectFiles`, `getSearchStats`, and all state/accessor variables.

### Logging

- **logger.mjs** - Shared logger for this module using the project's standard logger. Exports `logDebug`, `logInfo`, `logWarn`, `logError`.

## 3. Overall Directory Function

This directory provides a hybrid search capability that combines two complementary search strategies:

1. **BM25 Search** - Traditional keyword-based search using MiniSearch. Fast, deterministic, and effective for exact and prefix matches. Configuration boosts filename and path matches over content.

2. **Embedding/Vector Search** - Semantic similarity search using embeddings. Effective for finding conceptually related content even without exact keyword matches. Falls back to re-ranking BM25 results when vector store unavailable.

3. **Reciprocal Rank Fusion** - Combines results from both methods using RRF algorithm, which is robust to different score distributions and ranking behaviors.

The search index is built lazily on first use and automatically rebuilt when project files change (detected via fingerprint). The module gracefully degrades: if embeddings unavailable, it uses BM25-only; if BM25 fails, it falls back to basic substring search.

## 4. Usage Instructions

### Basic Search

```javascript
import { searchFiles } from "./ops/lib/search/hybrid-search/index.mjs";

const results = await searchFiles("authentication", { topK: 10 });
console.log(results.files);      // Array of file paths
console.log(results.method);     // "hybrid", "bm25", or "basic"
```

### Hybrid Search with Options

```javascript
import { hybridSearch } from "./ops/lib/search/hybrid-search/index.mjs";

const results = await hybridSearch("auth middleware", {
  topK: 20,
  bm25Weight: 0.6,
  embeddingWeight: 0.4,
  useEmbeddings: true
});
```

### Warm Index (Pre-build)

```javascript
import { warmSearchIndex } from "./ops/lib/search/hybrid-search/index.mjs";

const { indexed, documentCount, rebuilt } = await warmSearchIndex({ rootDir: "/path/to/project" });
```

### Get Index Stats

```javascript
import { getSearchStats } from "./ops/lib/search/hybrid-search/index.mjs";

const stats = getSearchStats();
console.log(stats);
// {
//   indexed: true,
//   documentCount: 150,
//   builtAt: "2024-01-15T10:30:00.000Z",
//   embeddingsAvailable: true,
//   vectorStoreReady: true
// }
```

## 5. Dependencies

### Internal Dependencies

- **../../logger.mjs** - Logger factory for module logging
- **../../rag/embeddings.mjs** - Embedding generation and cosine similarity (lazy-loaded, optional)
- **../../rag/vector-store.mjs** - Vector search and index readiness (lazy-loaded, optional)

### External Dependencies

- **minisearch** - BM25 search library (npm package)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Git repository (preferred for file collection via `git ls-files`)
- Optional: Ollama running for embedding-based search

## 6. Additional Comments

- **Lazy Loading Pattern**: Embedding and vector search dependencies are lazy-loaded at runtime. This allows the module to function (in BM25-only mode) even when those dependencies are unavailable.

- **Graceful Degradation**: The search automatically falls back through: hybrid -> BM25-only -> basic substring search based on available capabilities and results.

- **Index Invalidation**: The index is automatically rebuilt when project files change, detected via fingerprint comparison. This ensures search results remain current without manual index management.

- **Fuzzy Matching**: BM25 search includes fuzzy matching (0.2 threshold) and prefix search for typo tolerance and partial term matching.

- **Weight Boosting**: Filename matches are boosted 3x and path matches 2x over content matches, improving relevance for file-path searches.

- **Snippet Extraction**: Results include context snippets around matching terms, helping users quickly assess relevance without opening files.

- **Git Integration**: Uses `git ls-files` for efficient file collection when in a git repository, falling back to directory walk otherwise.