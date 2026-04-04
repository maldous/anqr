# RAG Pipeline — Retrieval Augmented Generation

Local-first RAG pipeline for ANQR codebase search and context retrieval, backed
by Ollama embeddings on the same machine that serves Symphony agents.

## What changed in this replacement

This drop-in replacement tightens the original implementation in a few places
that materially affect unattended rebuild quality:

- file discovery remains `git ls-files -z` based, but the builder now resolves
  the git repo root explicitly instead of relying on the current working
  directory
- high-noise i18n trees remain excluded by default, with mirrored `android/`
  paths de-duplicated in favour of `apps/android/`
- the chunker now preserves line ranges much more accurately for split chunks
  instead of guessing with `text.indexOf(...)`
- chunk IDs are deterministic for the same file/range, which reduces churn when
  reviewing search output or diffs
- Ollama health checks are cached, so a full index build does not ping the
  server once per file
- the vector store now exposes pruning directly and stores repo-relative paths
  where possible for cleaner retrieval context

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

`build-index.mjs` is the primary entry point for the ANQR repo.

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

The index lives in `reports/rag-index/`:

```text
reports/rag-index/
├── index.json      # legacy single-file format (small indexes)
├── manifest.json   # shard manifest (v2 format, large indexes)
├── index-0.json    # shard 0 (when sharded)
├── index-1.json    # shard 1 (when sharded)
├── ...             # additional shards as needed
└── meta.json       # per-file mtime + chunk counts
```

### Sharding Strategy

To prevent `JSON.stringify` overflow errors with large indexes (>512MB), the
vector store automatically shards the index when it exceeds `RAG_MAX_SHARD_SIZE_BYTES`
(default: 50MB per shard):

- **Small indexes**: Written as a single `index.json` file (legacy format)
- **Large indexes**: Split across multiple `index-N.json` shards tracked by
  `manifest.json` (v2 format)
- **Loading**: Automatically detects and loads either format
- **Migration**: Existing single-file indexes are automatically migrated to
  sharded format on the next rebuild if they exceed the size threshold

Stored `filePath` values are repo-relative when the file lives inside the git
root, which makes retrieved context easier for agents to read and replay.

## Nightly automation

The existing automation model still applies:

- `anqr-rag-rebuild.timer` fires nightly
- `anqr-rag-rebuild.service` runs the rebuild with a larger heap
- a mid-run flush still bounds data loss if the host or Ollama fails
