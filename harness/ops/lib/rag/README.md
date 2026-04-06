# RAG Pipeline - Retrieval Augmented Generation

## 1. Directory Overview

This directory contains a local-first RAG (Retrieval Augmented Generation) pipeline for ANQR codebase search and context retrieval, backed by Ollama embeddings on the same machine that serves Symphony agents. The pipeline provides semantic search capabilities across the codebase by chunking files into semantic units, generating vector embeddings, and storing them in a vector database for cosine similarity search.

The drop-in replacement architecture maintains existing behavior while tightening critical areas for unattended nightly rebuilds and operator trust: deterministic repo-relative storage, atomic writes, correct index size reporting, stale shard cleanup, safer library-style behavior, richer Linear issue chunks, and a more resilient Context7 wrapper.

## 2. File Summaries

### Facade Modules (Auto-Generated)

These facade files re-export from sibling modules under matching directories, maintaining backwards compatibility after decomposition:

- **chunker.mjs** - Facade exporting from `./chunker/index.mjs`. Splits code, docs, and config into line-aware semantic chunks using lightweight declaration-boundary heuristics with fallback to line-aware size splitting.

- **embeddings.mjs** - Facade exporting from `./embeddings/index.mjs`. Generates vector embeddings via Ollama API with cached health checks for reliability.

- **vector-store.mjs** - Facade exporting from `./vector-store/index.mjs`. Persists, prunes, indexes, and searches embeddings with support for both legacy single-file and sharded formats.

- **build-index.mjs** - Facade exporting from `./build-index/index.mjs` and `./build-index/runtime.mjs`. Full-repo tracked-file index builder with noise filtering. Primary entry point for ANQR repo that chains into Linear index build.

- **linear-chunker.mjs** - Facade exporting from `./linear-chunker/index.mjs`. Specialized chunker for Linear issues providing richer chunks for better recall.

- **build-index-linear.mjs** - Facade exporting from `./build-index-linear/index.mjs` and `./build-index-linear/runtime.mjs`. Builds the Linear issue index in `reports/rag-index-linear/`.

### Core Modules

- **chunker/** - Contains the chunker implementation with submodules for different file types (code, markdown, JSON, generic text).

- **embeddings/** - Contains Ollama API integration with health check caching and concurrency management.

- **vector-store/** - Contains vector storage implementation supporting both legacy and sharded formats.

- **build-index/** - Contains the main index builder logic with file tracking and noise filtering.

- **linear-chunker/** - Contains the specialized Linear issue chunker.

- **build-index-linear/** - Contains the Linear index builder.

## 3. Overall Directory Function

This directory serves as the semantic search foundation for the ANQR harness. The pipeline architecture follows:

```text
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  chunker    │────▶│  embeddings  │────▶│  vector-store │
│             │     │              │     │               │
│ Split files │     │ Ollama API   │     │ JSON on disk  │
│ into chunks │     │ → vectors    │     │ cosine search │
└─────────────┘     └──────────────┘     └───────────────┘
```

The **chunker** module splits files into semantic chunks:
- Code uses declaration-boundary heuristics with line-aware fallback
- Markdown splits on headings, then re-splits large sections by size
- JSON prefers top-level key boundaries with line-aware fallback
- Generic text/config formats use size-based chunking with overlap

The **embeddings** module generates vector embeddings via Ollama API with cached health checks to avoid repeated failed connection attempts.

The **vector-store** module persists embeddings to disk in either legacy single-file format (for small indexes) or sharded format (for large indexes), tracked by a manifest. It provides cosine similarity search and index statistics.

The **build-index** module is the primary entry point for building the source code index, filtering noise like node_modules, generated files, and oversized files. It chains into the Linear index builder after source index succeeds.

The **Context7 wrapper** provides a resilient integration that adapts to tool/schema drift and uses a cloud fallback path when local MCP is unavailable.

## 4. Usage Instructions

### Basic Indexing

```bash
# Incremental build/update
node --max-old-space-size=8192 harness/ops/lib/rag/build-index.mjs

# Clear and rebuild from scratch
node --max-old-space-size=8192 harness/ops/lib/rag/build-index.mjs --clear
```

### Programmatic Usage

```javascript
import { indexDirectory, search, getIndexStats } from "./vector-store.mjs";

await indexDirectory("src/");

const results = await search("authentication middleware", 5);
for (const r of results) {
  console.log(`${r.filePath}:${r.startLine}-${r.endLine} (score: ${r.score.toFixed(4)})`);
  console.log(r.content.slice(0, 200));
}

const stats = await getIndexStats();
console.log(`${stats.totalEntries} chunks across ${stats.totalFiles} files`);
```

### Included by Default

- Core source files: TS/JS, Python, shell, Java/Kotlin/Swift
- Docs and markdown
- Common config formats: JSON, YAML, HTML, CSS, XML, Gradle, service/timer, plist/pbxproj/xcconfig
- Selected high-signal basenames: Makefile, Dockerfile, .gitignore, .npmrc, .nvmrc, .prettierrc, .env_*

### Excluded by Default

- `apps/web/src/i18n/locales/**/*.json`
- `apps/web/src/i18n/static/**`
- `node_modules`, `coverage`, `dist`, `build`, `reports`, `.yarn`, `.git`
- Obvious generated/template trees and oversized files
- Mirrored legacy `android/**` files when corresponding `apps/android/**` exists

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension, 8GB+ heap recommended for indexing
- **Ollama** - Local embedding model server (default: http://127.0.0.1:11434)
- **Context7** - Optional cloud fallback for MCP documentation retrieval

### Environment Variables

#### Builder
- `RAG_BUILD_MAX_FILE_BYTES` - Max bytes per file before skip (default: 262144)
- `RAG_BUILD_SAVE_INTERVAL` - Flush every N indexed files (default: 25)
- `RAG_BUILD_PROGRESS_EVERY` - Progress log cadence in files (default: 200)
- `RAG_BUILD_INCLUDE_I18N` - Set to include excluded i18n trees
- `RAG_BUILD_VERBOSE` - Set for per-file skip logging
- `RAG_PROJECT_ROOT` - Force repo root used by vector store
- `RAG_MAX_SHARD_SIZE_BYTES` - Max shard size before splitting (default: 52428800 = 50MB)

#### Embeddings
- `OLLAMA_API_BASE` - Ollama base URL (default: http://127.0.0.1:11434)
- `RAG_EMBEDDING_MODEL` or `OLLAMA_EMBEDDING_MODEL` - Embedding model name
- `RAG_EMBEDDING_TIMEOUT_MS` - Request timeout per embedding
- `RAG_EMBEDDING_MAX_CONCURRENCY` - Concurrent embedding requests
- `RAG_OLLAMA_PING_TIMEOUT_MS` - Health-check timeout
- `RAG_OLLAMA_HEALTH_CACHE_TTL_MS` - Positive health cache TTL
- `RAG_OLLAMA_FAILURE_COOLDOWN_MS` - Negative health retry cooldown

#### Context7 Wrapper
- `CONTEXT7_API_KEY` - API key for cloud fallback
- `CONTEXT7_REQUEST_TIMEOUT_MS` - Per-call timeout
- `CONTEXT7_STARTUP_TIMEOUT_MS` - Startup timeout for local MCP child
- `CONTEXT7_API_BASE` - Override cloud API base (default: https://context7.com)
- `CONTEXT7_LEGACY_API_BASE` - Override legacy direct docs fallback base (default: https://api.context7.com)

### Storage Locations

- Source index: `reports/rag-index/` (legacy single-file or sharded with manifest)
- Linear index: `reports/rag-index-linear/` (compact single-file)

## 6. Additional Comments

### Index Storage Format

The source index may be stored in either legacy single-file format or sharded format:

```
reports/rag-index/
  index.json      # legacy single-file format (small indexes)
  manifest.json   # shard manifest (v2 format, large indexes)
  index-0.json    # shard 0 (when sharded)
  index-1.json    # shard 1 (when sharded)
  ...             # additional shards as needed
  meta.json       # per-file mtime + chunk counts
```

### Nightly Automation

The existing automation model applies:
- `anqr-rag-rebuild.timer` fires nightly
- `anqr-rag-rebuild.service` runs rebuild with larger heap
- Mid-run flush still bounds data loss if host or Ollama fails

### Design Goals in This Replacement

- Deterministic, repo-relative storage where practical
- Atomic writes for source and Linear indexes
- Correct index size reporting for both legacy and sharded formats
- Stale shard cleanup when storage layout changes
- Safer library-style behavior from builders that are also called programmatically
- Richer Linear issue chunks for better recall
- Resilient Context7 wrapper adapting to tool/schema drift with cloud fallback

### Chunking Notes

- Code uses lightweight declaration-boundary heuristics with line-aware fallback
- Markdown splits on headings, then re-splits large sections by size
- JSON prefers top-level key boundaries when safely identifiable, otherwise line-aware fallback
- Generic text/config formats chunked by size with overlap and exact line mapping from source offsets