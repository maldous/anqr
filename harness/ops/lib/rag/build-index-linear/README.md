# Linear RAG Index Builder

## 1. Directory Overview

This directory contains the Linear RAG index builder module for the ANQR harness. It provides
functionality to export Linear issues, chunk them into manageable pieces, generate embeddings using
Ollama, and save a searchable index for RAG (Retrieval Augmented Generation) operations. The module
processes Linear issue data and creates a vector index that can be used for semantic search across
issue content. It currently contains 12 files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-linear-index.mjs** - Main entry point that orchestrates the entire index building process. Loads Linear issues from export, chunks them, generates embeddings via Ollama, and saves the index. Exports `buildLinearIndex()` function that returns metrics including issues processed, chunk count, embedding count, and elapsed time.
- **detect-project-root.mjs** - Core detection logic that executes `git rev-parse --show-toplevel` to find the git project root.
- **export-path.mjs** - Exports `EXPORT_PATH` constant pointing to `reports/linear-export/issues-latest.json` within the project root.
- **index-dir.mjs** - Exports `INDEX_DIR` constant pointing to `reports/rag-index-linear` within the project root.
- **index.mjs** - Generated facade index that re-exports all public API members: `detectProjectRoot`, `PROJECT_ROOT`, `EXPORT_PATH`, `INDEX_DIR`, `LINEAR_EMBEDDING_CONCURRENCY`, `saveIndex`, `writeFile`, and `buildLinearIndex`.
- **linear-embedding-concurrency.mjs** - Exports `LINEAR_EMBEDDING_CONCURRENCY` constant (default: 3), configurable via `LINEAR_RAG_EMBEDDING_CONCURRENCY` environment variable.
- **logger.mjs** - Shared logger for this module using the centralized logger from `../../logger.mjs`. Exports `logInfo`, `logWarn`, and `logError` functions with the "rag-build-index-linear" namespace.
- **project-root.mjs** - Detects and exports the project root directory using `git rev-parse --show-toplevel`. Falls back to current working directory if not in a git repo.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes `buildLinearIndex()` with error handling. Logs fatal errors and exits with code 1 on failure.
- **save-index.mjs** - Saves the generated index to disk. Creates `index.json` containing all entries with embeddings and `meta.json` with metadata (chunk count, last build timestamp, index size). Skips chunks with failed embeddings and sorts entries by file path then ID.
- **sort-entries.mjs** - Sorts index entries first by file path, then by ID using locale-aware comparison. Returns a new sorted array without mutating the original.
- **write-file.mjs** - Atomic file writer using rename-overwrite pattern for crash safety. Generates temporary file with UUID, writes content, then atomically renames to target path. Includes cleanup on failure.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/lib/rag/build-index-linear/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
