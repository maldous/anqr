# Hybrid Search

## Purpose
Directory for runtime service bootstrap or environment support; immediate files include `collect-project-files.mjs`, `compute-fingerprint.mjs`, `cosine-similarity.mjs`, `create-hybrid-search-index.mjs`, and others.

## Contents
- 27 immediate files
- 0 child directories

## Key Files
- `collect-project-files.mjs` - Exports `collectProjectFiles`, the main helper defined in this file.
- `compute-fingerprint.mjs` - Exports `computeFingerprint`, the main helper defined in this file.
- `cosine-similarity.mjs` - JavaScript/TypeScript module used by this directory.
- `create-hybrid-search-index.mjs` - Exports `createHybridSearchIndex`, the main helper defined in this file.
- `embeddings-available.mjs` - Exports `embeddingsAvailable`, the main helper defined in this file.
- `excluded-dirs.mjs` - Exports `EXCLUDED_DIRS`, a shared constant or state value used by sibling modules.
- `extract-snippet.mjs` - Exports `extractSnippet`, the main helper defined in this file.
- `generate-embedding.mjs` - JavaScript/TypeScript module used by this directory.
- `get-search-stats.mjs` - Exports `getSearchStats`, the main helper defined in this file.
- `hybrid-search.mjs` - Exports `hybridSearch`, the main helper defined in this file.
- `index-built-at.mjs` - Exports `setIndexBuiltAt`, the main helper defined in this file.
- `index-fingerprint.mjs` - Exports `setIndexFingerprint`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `indexable-extensions.mjs` - Exports `INDEXABLE_EXTENSIONS`, a shared constant or state value used by sibling modules.
- `indexed-doc-count.mjs` - Exports `setIndexedDocCount`, the main helper defined in this file.
- `is-index-ready.mjs` - JavaScript/TypeScript module used by this directory.
- `is-ollama-available.mjs` - JavaScript/TypeScript module used by this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `max-file-bytes.mjs` - Exports `MAX_FILE_BYTES`, a shared constant or state value used by sibling modules.
- `mini-search-index.mjs` - Exports `setMiniSearchIndex`, the main helper defined in this file.
- `reciprocal-rank-fusion.mjs` - Exports `reciprocalRankFusion`, the main helper defined in this file.
- `rrf-k.mjs` - Exports `RRF_K`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `search-files.mjs` - Exports `searchFiles`, the main helper defined in this file.
- `vector-search.mjs` - JavaScript/TypeScript module used by this directory.
- `vector-store-ready.mjs` - Exports `vectorStoreReady`, the main helper defined in this file.
- `warm-search-index.mjs` - Exports `warmSearchIndex`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 27 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
