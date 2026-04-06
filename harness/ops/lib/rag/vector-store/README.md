# ANQR Vector Store

## 1. Directory Overview

This directory contains the vector store implementation for the ANQR (Agentic Number Query Runner) RAG (Retrieval-Augmented Generation) system. It provides functionality for indexing files, storing embeddings, and performing semantic search against indexed code and documentation. The module uses Ollama for generating embeddings and supports both single-file and directory indexing with automatic sharding for large indexes.

## 2. File Summaries

### Core Indexing

- **index-file-2.mjs** - Main function for indexing a single file. Generates embeddings via Ollama, chunks the file content, and adds entries to the index cache. Handles modification time checking to skip unchanged files and supports health checks for Ollama availability.

- **index-directory.mjs** - Batch indexing for entire directories. Collects files matching supported extensions and indexes them sequentially with periodic saves every 10 files (configurable via DIRECTORY_SAVE_INTERVAL). Returns statistics on total files, indexed files, and total chunks.

- **index.mjs** - Facade module that re-exports all public functions and constants from sibling modules. Serves as the main entry point for importing vector store functionality.

### Persistence

- **save-index.mjs** - Saves the in-memory index to disk with automatic sharding. When estimated size exceeds MAX_SHARD_SIZE_BYTES (default 50MB), splits data into multiple shard files (index-0.json, index-1.json, etc.) and creates a manifest.json. Otherwise saves as single index.json file.

- **load-index.mjs** - Loads index from disk, supporting both sharded (v2 manifest) and legacy single-file formats. Loads metadata separately into metaCache and validates entries using isValidEntry.

- **flush-index.mjs** - Simple wrapper that calls saveIndex for explicit flush operations.

- **atomic-write-json.mjs** - Atomic file write utility using temp file + rename pattern to prevent corruption on crash. Creates UUID-named temporary files before atomic rename.

### Cache Management

- **index-cache.mjs** - Mutable in-memory cache for index entries (vector embeddings with metadata). Exports indexCache variable and setIndexCache setter.

- **meta-cache.mjs** - Mutable in-memory cache for file metadata (lastModified, chunkCount). Uses Map for efficient lookups by file path.

- **index-loaded.mjs** - Tracks whether index has been loaded from disk to avoid redundant I/O.

- **index-dirty.mjs** - Tracks whether index has been modified since last save to optimize disk writes.

- **mark-dirty.mjs** - Helper function to mark index as dirty.

### Search

- **search.mjs** - Semantic search implementation. Generates embedding for query via Ollama, computes cosine similarity against all index entries, sorts by score, and returns top K results. Supports per-file limit to diversify results across files.

### Utilities

- **to-resolved-path.mjs** - Converts relative or absolute file paths to absolute paths resolved against PROJECT_ROOT. Normalizes path separators to forward slashes.

- **to-stored-path.mjs** - Converts resolved paths to relative paths for storage (relative to PROJECT_ROOT). Returns absolute path if file is outside project root.

- **normalize-path-string.mjs** - Normalizes path strings by replacing backslashes with forward slashes.

- **get-file-mtime.mjs** - Gets file modification time in milliseconds.

- **get-file-size.mjs** - Gets file size in bytes.

- **sort-entries.mjs** - Sorts index entries by filePath, then startLine, then endLine, then type, then id for deterministic ordering.

- **is-valid-entry.mjs** - Validates that an index entry has required fields: filePath (string), content (string), embedding (array), startLine (number), endLine (number), type (string).

- **sanitizeMetaRecord.mjs** - Sanitizes metadata records, ensuring lastModified and chunkCount are finite non-negative numbers.

- **cleanup-stale-index-files.mjs** - Removes index files no longer referenced by the current manifest or expected shard list. Handles both shard files (index-N.json), legacy index.json, and manifest.json.

- **ensure-index-dir.mjs** - Ensures the index directory exists, creating it recursively if needed.

- **detect-project-root.mjs** - Detects project root by checking RAG_PROJECT_ROOT env var or running git rev-parse --show-toplevel.

- **to-name-set.mjs** - Converts array of filenames to a Set of basenames for efficient lookup.

### Constants

- **index-dir.mjs** - Index directory path (reports/rag-index)

- **index-file.mjs** - Primary index file path (reports/rag-index/index.json)

- **meta-file.mjs** - Metadata file path (reports/rag-index/meta.json)

- **manifest-file.mjs** - Manifest file path (reports/rag-index/manifest.json) for sharded index format

- **max-shard-size-bytes.mjs** - Maximum shard size in bytes (default: 50MB, configurable via RAG_MAX_SHARD_SIZE_BYTES env var)

- **default-extensions.mjs** - List of supported file extensions for indexing (.ts, .tsx, .js, .jsx, .mjs, .cjs, .md, .mdx, .json, .css, .html, .yml, .yaml, .sh, .py, .service, .timer, .java, .kt, .swift, .gradle, .properties, .xml, .plist, .pbxproj, .xcconfig)

- **directory-save-interval.mjs** - Number of files to index before saving (10)

- **project-root.mjs** - Project root directory constant

- **logger.mjs** - Module-specific logger using createLogger with "rag-vector-store" namespace

### Management

- **prune-index.mjs** - Prunes index to only include files in the eligibleFilePaths array. Removes entries and metadata for files no longer eligible.

- **clear-index.mjs** - Clears the entire index (sets indexCache to empty array, metaCache to empty Map) and saves.

- **get-index-stats.mjs** - Returns statistics about the index: totalEntries, totalFiles, indexSizeBytes (sum of all shard files + meta), and breakdown by entry type.

- **is-index-ready.mjs** - Checks if index is loaded and non-empty, or if index file exists with content.

- **remove-entries-for-resolved-path.mjs** - Removes all index entries for a given resolved file path and marks index as dirty if changes were made.

## 3. Overall Directory Function

This directory provides the core vector store for the RAG system. The workflow:

1. **Indexing**: Files are chunked (via ../chunker.mjs) and embedded using Ollama (via ../embeddings.mjs). Each chunk becomes an index entry with its embedding vector, content, and metadata (file path, line numbers, type).

2. **Storage**: The index is maintained in memory (indexCache) with metadata in metaCache. When modified, the index is saved to disk using atomic writes. Large indexes are automatically sharded into multiple files with a manifest tracking the shards.

3. **Search**: Semantic search works by embedding the query text and computing cosine similarity against all indexed entries. Results are ranked by score with optional per-file limits to ensure diverse results.

4. **Management**: The module supports incremental indexing (skips unchanged files based on mtime), pruning (removes entries for deleted files), and full index clearing.

The vector store is used by higher-level RAG build scripts (build-index.mjs, build-index-linear.mjs) and can be queried directly for semantic code search.

## 4. Usage Instructions

### Importing the Module

```javascript
import {
  indexFile,
  indexDirectory,
  search,
  loadIndex,
  saveIndex,
  getIndexStats,
  clearIndex,
  pruneIndex,
  isIndexReady,
  INDEX_DIR,
} from "./ops/lib/rag/vector-store/index.mjs";
```

### Indexing a Single File

```javascript
const result = await indexFile("./src/utils.ts", {
  skipSave: false,      // Save after indexing
  skipHealthCheck: false, // Check Ollama availability
  // chunkOptions passed to chunkFile
});
// Returns: { indexed: boolean, chunks: number }
```

### Indexing a Directory

```javascript
const result = await indexDirectory("./src", {
  extensions: [".ts", ".js"], // Optional: filter by extension
});
// Returns: { totalFiles, indexedFiles, totalChunks }
```

### Searching

```javascript
await loadIndex();
const results = await search("authentication function", topK = 10, {
  perFileLimit: 3, // Max results per file
});
// Returns: [{ score, filePath, content, startLine, endLine, type }, ...]
```

### Managing Index

```javascript
const stats = await getIndexStats();
// Returns: { totalEntries, totalFiles, indexSizeBytes, types: {...} }

await pruneIndex(["./src/file1.ts", "./src/file2.ts"]);
// Keeps only entries for listed files

await clearIndex();
// Clears entire index
```

## 5. Dependencies

### Internal Dependencies

- **../embeddings.mjs** - Ollama embeddings generation (generateEmbeddings, generateEmbedding, isOllamaAvailable, cosineSimilarity)
- **../chunker.mjs** - File chunking (chunkFile, collectFiles)
- **../../logger.mjs** - Logger factory (createLogger)

### Runtime Requirements

- **Node.js** - ESM modules with .mjs extension
- **Ollama** - Must be running locally for embedding generation and search
- **Git** - Used by detectProjectRoot for finding project root

### Environment Variables

- **RAG_PROJECT_ROOT** - Override project root detection
- **RAG_MAX_SHARD_SIZE_BYTES** - Override max shard size (default: 50MB)

### External Storage

- **reports/rag-index/** - Directory for index files (created automatically)
  - index.json (legacy single-file format)
  - index-N.json (shard files, v2 format)
  - manifest.json (shard metadata, v2 format)
  - meta.json (file metadata)

## 6. Additional Comments

- **Sharding Strategy**: The save-index.mjs estimates JSON size by sampling first 10 entries, then shards if estimated size exceeds 50MB. Shards are named index-0.json, index-1.json, etc., with manifest.json tracking total entries and shard details.

- **Atomic Writes**: All file writes use atomicWriteJSON which writes to a temp file then renames, preventing corruption if the process crashes mid-write.

- **Incremental Indexing**: indexFile checks metaCache for the file's lastModified timestamp and skips re-indexing if file hasn't changed since last index.

- **Ollama Health Check**: Both indexFile and indexDirectory check Ollama availability before attempting embedding generation, returning early if unavailable.

- **Entry Validation**: loadIndex filters entries through isValidEntry to skip corrupted entries, ensuring graceful handling of partial index files.

- **Path Handling**: All paths are normalized to forward slashes (normalizePathString) for consistency across platforms. Resolved paths are stored relative to PROJECT_ROOT when possible.

- **Logging**: Uses module-specific logger with "rag-vector-store" namespace for easy filtering in logs.