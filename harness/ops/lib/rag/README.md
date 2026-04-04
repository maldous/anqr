# RAG Pipeline — Retrieval Augmented Generation

Local-first RAG pipeline for ANQR codebase search and context retrieval, backed
by Ollama embeddings on the same machine that serves Symphony agents.

## Design goals in this replacement

This drop-in replacement keeps the existing architecture, but tightens the parts
that matter most for unattended nightly rebuilds and operator trust:

- deterministic, repo-relative storage where practical
- atomic writes for source and Linear indexes
- correct index size reporting for both legacy and sharded formats
- stale shard cleanup when the storage layout changes
- safer library-style behavior from builders that are also called programmatically
- richer Linear issue chunks for better recall
- a more resilient Context7 wrapper that adapts to tool/schema drift and uses a
  current cloud fallback path

## Architecture

```text
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  chunker    │────▶│  embeddings  │────▶│  vector-store │
│             │     │              │     │               │
│ Split files │     │ Ollama API   │     │ JSON on disk  │
│ into chunks │     │ → vectors    │     │ cosine search │
└─────────────┘     └──────────────┘     └───────────────┘
```

## Modules

| Module        | File               | Purpose                                                         |
| ------------- | ------------------ | --------------------------------------------------------------- |
| Chunker       | `chunker.mjs`      | Split code, docs, and config into line-aware semantic chunks    |
| Embeddings    | `embeddings.mjs`   | Generate vector embeddings via Ollama with cached health checks |
| Vector Store  | `vector-store.mjs` | Persist, prune, index, and search embeddings                    |
| Index Builder | `build-index.mjs`  | Full-repo tracked-file index builder with noise filtering       |

## Quick start

```js
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

## Builder behavior

`build-index.mjs` is the primary entry point for the ANQR repo and continues to
chain into the Linear index build after the source index succeeds.

### Included by default

- core source files: TS/JS, Python, shell, Java/Kotlin/Swift
- docs and markdown
- common config formats: JSON, YAML, HTML, CSS, XML, Gradle, service/timer,
  plist/pbxproj/xcconfig
- selected high-signal basenames such as `Makefile`, `Dockerfile`, `.gitignore`,
  `.npmrc`, `.nvmrc`, `.prettierrc`, and `.env*`

### Excluded by default

- `apps/web/src/i18n/locales/**/*.json`
- `apps/web/src/i18n/static/**`
- `node_modules`, `coverage`, `dist`, `build`, `reports`, `.yarn`, `.git`
- obvious generated/template trees and oversized files
- mirrored legacy `android/**` files when the corresponding `apps/android/**`
  file exists

## Environment overrides

### Builder

- `RAG_BUILD_MAX_FILE_BYTES` — max bytes per file before skip (default `262144`)
- `RAG_BUILD_SAVE_INTERVAL` — flush every N indexed files (default `25`)
- `RAG_BUILD_PROGRESS_EVERY` — progress log cadence in files (default `200`)
- `RAG_BUILD_INCLUDE_I18N` — set `1/true` to include excluded i18n trees
- `RAG_BUILD_VERBOSE` — set `1/true` for per-file skip logging
- `RAG_PROJECT_ROOT` — force the repo root used by the vector store
- `RAG_MAX_SHARD_SIZE_BYTES` — max shard size before splitting (default `52428800` = 50MB)

### Embeddings

- `OLLAMA_API_BASE` — Ollama base URL (default `http://127.0.0.1:11434`)
- `RAG_EMBEDDING_MODEL` or `OLLAMA_EMBEDDING_MODEL` — embedding model name
- `RAG_EMBEDDING_TIMEOUT_MS` — request timeout per embedding
- `RAG_EMBEDDING_MAX_CONCURRENCY` — concurrent embedding requests
- `RAG_OLLAMA_PING_TIMEOUT_MS` — health-check timeout
- `RAG_OLLAMA_HEALTH_CACHE_TTL_MS` — positive health cache TTL
- `RAG_OLLAMA_FAILURE_COOLDOWN_MS` — negative health retry cooldown

### Context7 wrapper

- `CONTEXT7_API_KEY` — API key for cloud fallback
- `CONTEXT7_REQUEST_TIMEOUT_MS` — per-call timeout
- `CONTEXT7_STARTUP_TIMEOUT_MS` — startup timeout for the local MCP child
- `CONTEXT7_API_BASE` — override current cloud API base (default `https://context7.com`)
- `CONTEXT7_LEGACY_API_BASE` — override legacy direct docs fallback base (default `https://api.context7.com`)

## Usage

```bash
# Incremental build/update
node --max-old-space-size=8192 harness/ops/lib/rag/build-index.mjs

# Clear and rebuild from scratch
node --max-old-space-size=8192 harness/ops/lib/rag/build-index.mjs --clear
```

## Notes on chunking

- code uses lightweight declaration-boundary heuristics and falls back to
  line-aware size splitting when needed
- markdown splits on headings, then re-splits large sections by size
- JSON prefers top-level key boundaries when it can identify them safely,
  otherwise it falls back to line-aware size splitting
- generic text/config formats are chunked by size with overlap and exact line
  mapping from source offsets

## Notes on storage

The source index lives in `reports/rag-index/` and may be stored either as a
legacy single file or as sharded files tracked by a manifest:

```text
reports/rag-index/
├── index.json      # legacy single-file format (small indexes)
├── manifest.json   # shard manifest (v2 format, large indexes)
├── index-0.json    # shard 0 (when sharded)
├── index-1.json    # shard 1 (when sharded)
├── ...             # additional shards as needed
└── meta.json       # per-file mtime + chunk counts
```

The Linear index continues to live in `reports/rag-index-linear/` as a compact
single-file index for the existing linear-search consumer.

## Nightly automation

The existing automation model still applies:

- `anqr-rag-rebuild.timer` fires nightly
- `anqr-rag-rebuild.service` runs the rebuild with a larger heap
- a mid-run flush still bounds data loss if the host or Ollama fails
