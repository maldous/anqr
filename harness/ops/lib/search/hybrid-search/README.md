# ANQR Hybrid Search

## 1. Directory Overview

This directory contains the hybrid search implementation for the ANQR (Agentic Number Query Runner)
harness. It provides a unified search capability that combines BM25 keyword-based search with
embedding-based vector search to deliver relevant file search results. The module uses Reciprocal
Rank Fusion (RRF) to merge results from both search methods, providing superior search quality over
either method alone. It currently contains 27 files and 0 subdirectories.

## 2. File Summaries

### Files

- **collect-project-files.mjs** - Collects all indexable files from the project. Uses `git ls-files` when available, falls back to directory walk. Respects excluded directories and file size limits.
- **compute-fingerprint.mjs** - Computes a fingerprint from file list for change detection. Uses sorted file paths, count, and first/last file names.
- **cosine-similarity.mjs** - Lazy-loaded cosine similarity function for re-ranking. Imported from `../../rag/embeddings.mjs` at runtime.
- **create-hybrid-search-index.mjs** - Builds the MiniSearch BM25 index over project files. Configures boosting for filenames (3x), paths (2x), and content (1x). Enables prefix search and fuzzy matching (0.2).
- **embeddings-available.mjs** - Checks if embedding capabilities are available. Returns false if embeddings or Ollama unavailable.
- **excluded-dirs.mjs** - Defines excluded directories: `node_modules`, `.git`, `coverage`, `dist`, `build`.
- **extract-snippet.mjs** - Extracts a snippet around the first matching term in content. Uses 120-character radius, adds ellipsis for truncated content.
- **generate-embedding.mjs** - Lazy-loaded embedding generation function. Imported from `../../rag/embeddings.mjs` at runtime.
- **get-search-stats.mjs** - Returns current search index statistics: indexed status, document count, build time, embeddings availability, vector store readiness.
- **hybrid-search.mjs** - Main entry point providing the `hybridSearch()` function. Combines BM25 and embedding search using configurable weights and RRF for result fusion. Returns top-K results with snippets.
- **index-built-at.mjs** - Records when the index was built (timestamp). Exports `indexBuiltAt` and `setIndexBuiltAt()`.
- **index-fingerprint.mjs** - Tracks the fingerprint of files used to build the index. Enables efficient index invalidation detection. Exports `indexFingerprint` and `setIndexFingerprint()`.
- **index.mjs** - Generated facade index exporting all public API members including `hybridSearch`, `searchFiles`, `warmSearchIndex`, `createHybridSearchIndex`, `collectProjectFiles`, `getSearchStats`, and all state/accessor variables.
- **indexable-extensions.mjs** - Defines indexable file extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.json`, `.md`.
- **indexed-doc-count.mjs** - Tracks the number of documents in the index. Exports `indexedDocCount` and `setIndexedDocCount()`.
- **is-index-ready.mjs** - Lazy-loaded index readiness check. Imported from `../../rag/vector-store.mjs` at runtime.
- **is-ollama-available.mjs** - Lazy-loaded Ollama availability check.
- **logger.mjs** - Shared logger for this module using the project's standard logger. Exports `logDebug`, `logInfo`, `logWarn`, `logError`.
- **max-file-bytes.mjs** - Maximum file size for indexing: 512KB.
- **mini-search-index.mjs** - Module-level variable storing the MiniSearch index instance. Exports `miniSearchIndex` and `setMiniSearchIndex()`.
- **reciprocal-rank-fusion.mjs** - Implements RRF algorithm to combine BM25 and embedding results. Uses RRF_K=60 constant. Supports weighted combination via `bm25Weight` and `embeddingWeight` parameters.
- **rrf-k.mjs** - Reciprocal Rank Fusion K constant set to 60.
- **runtime.mjs** - Runtime carry-forward that lazy-loads embedding and vector search dependencies from `../../rag/embeddings.mjs` and `../../rag/vector-store.mjs`. Falls back gracefully if modules unavailable.
- **search-files.mjs** - High-level search API that automatically builds/updates the search index. Returns `{ files, count, query, method }` object indicating whether hybrid, bm25, or basic search was used.
- **vector-search.mjs** - Lazy-loaded vector search function. Imported from `../../rag/vector-store.mjs` at runtime.
- **vector-store-ready.mjs** - Wrapper around `isIndexReady()` with error handling.
- **warm-search-index.mjs** - Index warming utility that checks if the index needs rebuilding based on file fingerprint. Returns `{ indexed, documentCount, rebuilt }`.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/lib/search/hybrid-search/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.
- **Imported packages** - Representative external dependencies referenced here include `minisearch`.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
