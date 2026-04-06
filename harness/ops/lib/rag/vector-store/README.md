# ANQR Vector Store

## 1. Directory Overview

This directory contains the vector store implementation for the ANQR (Agentic Number Query Runner)
RAG (Retrieval-Augmented Generation) system. It provides functionality for indexing files, storing
embeddings, and performing semantic search against indexed code and documentation. The module uses
Ollama for generating embeddings and supports both single-file and directory indexing with automatic
sharding for large indexes. It currently contains 39 files and 0 subdirectories.

## 2. File Summaries

### Files

- **atomic-write-json.mjs** - Atomic file write utility using temp file + rename pattern to prevent corruption on crash. Creates UUID-named temporary files before atomic rename.
- **cleanup-stale-index-files.mjs** - Removes index files no longer referenced by the current manifest or expected shard list. Handles both shard files (index-N.json), legacy index.json, and manifest.json.
- **clear-index.mjs** - Clears the entire index (sets indexCache to empty array, metaCache to empty Map) and saves.
- **default-extensions.mjs** - List of supported file extensions for indexing (.ts, .tsx, .js, .jsx, .mjs, .cjs, .md, .mdx, .json, .css, .html, .yml, .yaml, .sh, .py, .service, .timer, .java, .kt, .swift, .gradle, .properties, .xml, .plist, .pbxproj, .xcconfig)
- **detect-project-root.mjs** - Detects project root by checking RAG_PROJECT_ROOT env var or running git rev-parse --show-toplevel.
- **directory-save-interval.mjs** - Number of files to index before saving (10)
- **ensure-index-dir.mjs** - Ensures the index directory exists, creating it recursively if needed.
- **flush-index.mjs** - Simple wrapper that calls saveIndex for explicit flush operations.
- **get-file-mtime.mjs** - Gets file modification time in milliseconds.
- **get-file-size.mjs** - Gets file size in bytes.
- **get-index-stats.mjs** - Returns statistics about the index: totalEntries, totalFiles, indexSizeBytes (sum of all shard files + meta), and breakdown by entry type.
- **index-cache.mjs** - Mutable in-memory cache for index entries (vector embeddings with metadata). Exports indexCache variable and setIndexCache setter.
- **index-dir.mjs** - Index directory path (reports/rag-index)
- **index-directory.mjs** - Batch indexing for entire directories. Collects files matching supported extensions and indexes them sequentially with periodic saves every 10 files (configurable via DIRECTORY_SAVE_INTERVAL). Returns statistics on total files, indexed files, and total chunks.
- **index-dirty.mjs** - Tracks whether index has been modified since last save to optimize disk writes.
- **index-file-2.mjs** - Main function for indexing a single file. Generates embeddings via Ollama, chunks the file content, and adds entries to the index cache. Handles modification time checking to skip unchanged files and supports health checks for Ollama availability.
- **index-file.mjs** - Primary index file path (reports/rag-index/index.json)
- **index-loaded.mjs** - Tracks whether index has been loaded from disk to avoid redundant I/O.
- **index.mjs** - Facade module that re-exports all public functions and constants from sibling modules. Serves as the main entry point for importing vector store functionality.
- **is-index-ready.mjs** - Checks if index is loaded and non-empty, or if index file exists with content.
- **is-valid-entry.mjs** - Validates that an index entry has required fields: filePath (string), content (string), embedding (array), startLine (number), endLine (number), type (string).
- **load-index.mjs** - Loads index from disk, supporting both sharded (v2 manifest) and legacy single-file formats. Loads metadata separately into metaCache and validates entries using isValidEntry.
- **logger.mjs** - Module-specific logger using createLogger with "rag-vector-store" namespace
- **manifest-file.mjs** - Manifest file path (reports/rag-index/manifest.json) for sharded index format
- **mark-dirty.mjs** - Helper function to mark index as dirty.
- **max-shard-size-bytes.mjs** - Maximum shard size in bytes (default: 50MB, configurable via RAG_MAX_SHARD_SIZE_BYTES env var)
- **meta-cache.mjs** - Mutable in-memory cache for file metadata (lastModified, chunkCount). Uses Map for efficient lookups by file path.
- **meta-file.mjs** - Metadata file path (reports/rag-index/meta.json)
- **normalize-path-string.mjs** - Normalizes path strings by replacing backslashes with forward slashes.
- **project-root.mjs** - Project root directory constant
- **prune-index.mjs** - Prunes index to only include files in the eligibleFilePaths array. Removes entries and metadata for files no longer eligible.
- **remove-entries-for-resolved-path.mjs** - Removes all index entries for a given resolved file path and marks index as dirty if changes were made.
- **sanitize-meta-record.mjs** - Module that supports sanitize meta record. Exports `sanitizeMetaRecord`.
- **save-index.mjs** - Saves the in-memory index to disk with automatic sharding. When estimated size exceeds MAX_SHARD_SIZE_BYTES (default 50MB), splits data into multiple shard files (index-0.json, index-1.json, etc.) and creates a manifest.json. Otherwise saves as single index.json file.
- **search.mjs** - Semantic search implementation. Generates embedding for query via Ollama, computes cosine similarity against all index entries, sorts by score, and returns top K results. Supports per-file limit to diversify results across files.
- **sort-entries.mjs** - Sorts index entries by filePath, then startLine, then endLine, then type, then id for deterministic ordering.
- **to-name-set.mjs** - Converts array of filenames to a Set of basenames for efficient lookup.
- **to-resolved-path.mjs** - Converts relative or absolute file paths to absolute paths resolved against PROJECT_ROOT. Normalizes path separators to forward slashes.
- **to-stored-path.mjs** - Converts resolved paths to relative paths for storage (relative to PROJECT_ROOT). Returns absolute path if file is outside project root.

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
