# Linear RAG Index Builder

## 1. Directory Overview

This directory contains the Linear RAG index builder module for the ANQR harness. It provides functionality to export Linear issues, chunk them into manageable pieces, generate embeddings using Ollama, and save a searchable index for RAG (Retrieval Augmented Generation) operations. The module processes Linear issue data and creates a vector index that can be used for semantic search across issue content.

## 2. File Summaries

### Core Implementation Files

- **build-linear-index.mjs** - Main entry point that orchestrates the entire index building process. Loads Linear issues from export, chunks them, generates embeddings via Ollama, and saves the index. Exports `buildLinearIndex()` function that returns metrics including issues processed, chunk count, embedding count, and elapsed time.

- **save-index.mjs** - Saves the generated index to disk. Creates `index.json` containing all entries with embeddings and `meta.json` with metadata (chunk count, last build timestamp, index size). Skips chunks with failed embeddings and sorts entries by file path then ID.

- **write-file.mjs** - Atomic file writer using rename-overwrite pattern for crash safety. Generates temporary file with UUID, writes content, then atomically renames to target path. Includes cleanup on failure.

- **sort-entries.mjs** - Sorts index entries first by file path, then by ID using locale-aware comparison. Returns a new sorted array without mutating the original.

- **chunkLinearIssues** (imported from `../linear-chunker.mjs`) - Chunks Linear issues into smaller pieces for embedding generation.

- **generateEmbeddings** (imported from `../embeddings.mjs`) - Generates embeddings using Ollama with configurable concurrency.

### Configuration & Constants

- **project-root.mjs** - Detects and exports the project root directory using `git rev-parse --show-toplevel`. Falls back to current working directory if not in a git repo.

- **detect-project-root.mjs** - Core detection logic that executes `git rev-parse --show-toplevel` to find the git project root.

- **index-dir.mjs** - Exports `INDEX_DIR` constant pointing to `reports/rag-index-linear` within the project root.

- **export-path.mjs** - Exports `EXPORT_PATH` constant pointing to `reports/linear-export/issues-latest.json` within the project root.

- **linear-embedding-concurrency.mjs** - Exports `LINEAR_EMBEDDING_CONCURRENCY` constant (default: 3), configurable via `LINEAR_RAG_EMBEDDING_CONCURRENCY` environment variable.

### Logging & Utilities

- **logger.mjs** - Shared logger for this module using the centralized logger from `../../logger.mjs`. Exports `logInfo`, `logWarn`, and `logError` functions with the "rag-build-index-linear" namespace.

### Generated Files

- **index.mjs** - Generated facade index that re-exports all public API members: `detectProjectRoot`, `PROJECT_ROOT`, `EXPORT_PATH`, `INDEX_DIR`, `LINEAR_EMBEDDING_CONCURRENCY`, `saveIndex`, `writeFile`, and `buildLinearIndex`.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes `buildLinearIndex()` with error handling. Logs fatal errors and exits with code 1 on failure.

## 3. Overall Directory Function

This directory serves as the Linear-specific RAG index builder within the broader RAG system. It transforms Linear issue exports into searchable vector embeddings by:

1. Loading JSON export from `reports/linear-export/issues-latest.json`
2. Chunking issues into smaller pieces suitable for embedding
3. Generating embeddings using Ollama (configurable concurrency)
4. Saving the index to `reports/rag-index-linear/index.json` with metadata

The build process validates Ollama availability before proceeding and handles empty exports gracefully by writing an empty index. The atomic file writing ensures the index is never corrupted by partial writes. This index enables semantic search across Linear issues for RAG-powered operations in the harness.

## 4. Usage Instructions

### Running the Index Builder

```bash
# Via runtime (recommended)
node ops/lib/rag/build-index-linear/runtime.mjs
```

Or via facade:

```bash
node ops/lib/rag/build-index-linear/index.mjs
```

### Programmatic Usage

```javascript
import { buildLinearIndex } from "./ops/lib/rag/build-index-linear/index.mjs";

const result = await buildLinearIndex();
console.log(result);
// {
//   issuesProcessed: 150,
//   chunkCount: 423,
//   embeddingCount: 420,
//   elapsedSeconds: 45.2,
//   indexDir: "/path/to/reports/rag-index-linear"
// }
```

### Configuration

Set concurrency for embedding generation:

```bash
LINEAR_RAG_EMBEDDING_CONCURRENCY=5 node ops/lib/rag/build-index-linear/runtime.mjs
```

### Prerequisites

- Ollama must be running (default: `http://127.0.0.1:11434`)
- Linear export must exist at `reports/linear-export/issues-latest.json`

### Output

The index is saved to `reports/rag-index-linear/` containing:
- `index.json` - The searchable index with embeddings
- `meta.json` - Metadata including chunk count, build timestamp, and index size

## 5. Dependencies

### Internal Dependencies

- **../../logger.mjs** - Centralized logging utility
- **../linear-chunker.mjs** - Linear issue chunking logic
- **../embeddings.mjs** - Ollama embedding generation (`generateEmbeddings`, `isOllamaAvailable`)

### Runtime Requirements

- **Node.js** - ESM modules with .mjs extension
- **Ollama** - Must be running and accessible at `OLLAMA_API_BASE` (default: `http://127.0.0.1:11434`)
- **Git** - For project root detection (fallback to cwd if not in git repo)

### Environment Variables

- `OLLAMA_API_BASE` - Ollama API endpoint (default: `http://127.0.0.1:11434`)
- `LINEAR_RAG_EMBEDDING_CONCURRENCY` - Number of concurrent embedding requests (default: 3)

## 6. Additional Comments

- **Atomic Writes**: The `writeFile` function uses a rename-overwrite pattern ensuring the index is never in a partially written state, even if the process crashes mid-write.

- **Graceful Degradation**: If embeddings fail for certain chunks, they are skipped with a warning rather than failing the entire build. The index only contains successfully embedded entries.

- **Performance Tuning**: The `LINEAR_EMBEDDING_CONCURRENCY` defaults to 3 to balance throughput against Ollama resource usage. Increase for faster builds on capable hardware.

- **Empty Export Handling**: If the Linear export contains no issues, an empty index is written rather than throwing an error, allowing the RAG system to handle the empty state gracefully.

- **Sorting**: Entries are sorted by file path then ID for consistent, deterministic index organization, which aids in debugging and comparison across builds.