# ANQR Hybrid Search

## 1. Directory Overview

This directory implements **ANQR Hybrid Search** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 27 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **collect-project-files.mjs** - Exports `collectProjectFiles`, which collects project files.
- **compute-fingerprint.mjs** - Exports `computeFingerprint`, which implements compute fingerprint.
- **cosine-similarity.mjs** - Exports `cosineSimilarity`, which implements cosine similarity.
- **create-hybrid-search-index.mjs** - Exports `createHybridSearchIndex`, which creates hybrid search index.
- **embeddings-available.mjs** - Exports `embeddingsAvailable`, which implements embeddings available.
- **excluded-dirs.mjs** - Exports `EXCLUDED_DIRS`, a shared `Set` constant used by this module group.
- **extract-snippet.mjs** - Exports `extractSnippet`, which implements extract snippet.
- **generate-embedding.mjs** - Exports `generateEmbedding`, which implements generate embedding.
- **get-search-stats.mjs** - Exports `getSearchStats`, which gets search stats.
- **hybrid-search.mjs** - Exports `hybridSearch`, which implements hybrid search.
- **index-built-at.mjs** - Exports `indexBuiltAt`, `setIndexBuiltAt`, providing the reusable API for this directory concern.
- **index-fingerprint.mjs** - Exports `indexFingerprint`, `setIndexFingerprint`, providing the reusable API for this directory concern.
- **index.mjs** - Facade module that re-exports public members from `./generate-embedding.mjs`, `./cosine-similarity.mjs`, `./is-ollama-available.mjs`, `./vector-search.mjs`, `./is-index-ready.mjs`, `./rrf-k.mjs`, and 18 more siblings.
- **indexable-extensions.mjs** - Exports `INDEXABLE_EXTENSIONS`, a shared `Set` constant used by this module group.
- **indexed-doc-count.mjs** - Exports `indexedDocCount`, `setIndexedDocCount`, providing the reusable API for this directory concern.
- **is-index-ready.mjs** - Exports `isIndexReady`, which checks whether index ready.
- **is-ollama-available.mjs** - Exports `isOllamaAvailable`, which checks whether ollama available.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **max-file-bytes.mjs** - Exports `MAX_FILE_BYTES`, a shared constant used by sibling modules.
- **mini-search-index.mjs** - Exports `miniSearchIndex`, `setMiniSearchIndex`, providing the reusable API for this directory concern.
- **reciprocal-rank-fusion.mjs** - Exports `reciprocalRankFusion`, which implements reciprocal rank fusion.
- **rrf-k.mjs** - Exports `RRF_K`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **search-files.mjs** - Exports `searchFiles`, which implements search files.
- **vector-search.mjs** - Exports `vectorSearch`, which implements vector search.
- **vector-store-ready.mjs** - Exports `vectorStoreReady`, which implements vector store ready.
- **warm-search-index.mjs** - Exports `warmSearchIndex`, which implements warm search index.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, subprocess execution, and git/worktree awareness.

## 4. Usage Instructions

```bash
node ops/lib/search/hybrid-search/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs/promises`, `node:path`
- **External packages/services referenced in immediate code** - `minisearch`
- **Internal relative modules** - `../../logger.mjs`, `./collect-project-files.mjs`, `./compute-fingerprint.mjs`, `./cosine-similarity.mjs`, `./create-hybrid-search-index.mjs`, `./embeddings-available.mjs`, `./excluded-dirs.mjs`, `./extract-snippet.mjs`, `./generate-embedding.mjs`, `./hybrid-search.mjs`, `./index-built-at.mjs`, `./index-fingerprint.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
