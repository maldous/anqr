# RAG Pipeline — Retrieval Augmented Generation

Local-first RAG pipeline for codebase search and context retrieval, powered by
Ollama embeddings running on the same GPU that serves Symphony agents.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  chunker    │────▶│  embeddings  │────▶│  vector-store  │
│             │     │              │     │               │
│ Split files │     │ Ollama API   │     │ JSON on disk  │
│ into chunks │     │ → vectors    │     │ cosine search │
└─────────────┘     └──────────────┘     └───────────────┘
```

### Modules

| Module | File | Purpose |
|--------|------|---------|
| **Chunker** | `chunker.mjs` | Split source files into semantic chunks |
| **Embeddings** | `embeddings.mjs` | Generate vector embeddings via Ollama |
| **Vector Store** | `vector-store.mjs` | Persist, index, and search embeddings |
| **Index Builder** | `build-index.mjs` | Full-repo index builder using `git ls-files` |

## Quick Start

```js
import { indexDirectory, search, getIndexStats } from './vector-store.mjs';

// Index a directory (incremental — skips unchanged files)
await indexDirectory('src/');

// Search for relevant code chunks
const results = await search('authentication middleware', 5);
for (const r of results) {
  console.log(`${r.filePath}:${r.startLine}-${r.endLine} (score: ${r.score.toFixed(4)})`);
  console.log(r.content.slice(0, 200));
}

// Check index stats
const stats = await getIndexStats();
console.log(`${stats.totalEntries} chunks across ${stats.totalFiles} files`);
```

## Module Details

### Chunker (`chunker.mjs`)

Splits files into semantic chunks based on file type:

- **Code files** (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`): Splits on function, class,
  and export declaration boundaries using regex patterns. JSDoc blocks are kept
  attached to their declarations.
- **Markdown files** (`.md`): Splits on heading boundaries (`#`, `##`, `###`).
- **JSON files** (`.json`): Splits by top-level keys, or treats as a single block
  if small enough.

Each chunk includes:
```ts
{
  id: string;          // Unique identifier
  filePath: string;    // Source file path
  content: string;     // Chunk text
  startLine: number;   // 1-indexed start line
  endLine: number;     // End line in source
  type: 'function' | 'class' | 'section' | 'paragraph' | 'block';
}
```

**Exports:**
- `chunkFile(filePath, options?)` — Chunk a single file
- `chunkDirectory(dirPath, options?)` — Chunk all supported files recursively
- `chunkText(text, options?)` — Chunk raw text (no file-type awareness)

**Options:**
- `maxChunkSize` — Max chunk size in characters (default: 2000, ~500 tokens)
- `overlap` — Character overlap between consecutive chunks (default: 100)
- `extensions` — File extensions to include (default: `.ts .tsx .js .jsx .mjs .md .json`)

### Embeddings (`embeddings.mjs`)

Generates vector embeddings using the local Ollama instance. Uses the same model
as Symphony runners (`qwen2.5-coder:3b-instruct`).

**Exports:**
- `generateEmbedding(text)` — Embed a single string → `number[] | null`
- `generateEmbeddings(texts)` — Batch embed with concurrency limit (2 at a time)
- `cosineSimilarity(a, b)` — Compare two vectors → `number` (-1 to 1)
- `isOllamaAvailable()` — Health check → `boolean`

**Configuration (environment variables):**
- `OLLAMA_API_BASE` — Ollama API URL (default: `http://127.0.0.1:11434`)

**Behavior:**
- 10-second timeout per embedding request
- Returns `null` on failure (never throws)
- Max 2 concurrent requests to avoid GPU contention

### Vector Store (`vector-store.mjs`)

File-based vector store that persists to `reports/rag-index/` (gitignored).

**Exports:**
- `indexFile(filePath, options?)` — Chunk, embed, and store a single file
- `indexDirectory(dirPath, options?)` — Index all files in a directory
- `search(query, topK?)` — Embed query and find top-K similar chunks
- `getIndexStats()` — Return index statistics
- `clearIndex()` — Remove all stored embeddings
- `isIndexReady()` — Check if the index has been built

**Features:**
- **Incremental indexing**: Skips files whose mtime hasn't changed
- **Atomic writes**: Writes to temp file, then renames to prevent corruption
- **Lazy loading**: Index loaded from disk only on first access
- **Cosine similarity search**: Brute-force ranking over all stored embeddings
- **Batch save support**: `indexFile({ skipSave: true })` + `flushIndex()` for efficient bulk indexing

**Storage format:**
```
reports/rag-index/
├── index.json   # Array of { id, filePath, content, embedding, startLine, endLine, type, lastModified }
└── meta.json    # Per-file metadata: { filePath: { lastModified, chunkCount } }
```

### Index Builder (`build-index.mjs`)

Full-repo RAG index builder. Uses `git ls-files` to discover all tracked files
(naturally excludes `.gitignore`'d paths), filters to supported extensions, and
indexes them incrementally with periodic disk flushes every 25 files.

**Supported extensions:** `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.md`,
`.json`, `.css`, `.html`, `.yml`, `.yaml`, `.sh`, `.py`, `.service`, `.timer`

**Usage:**
```bash
# Build/update index (incremental — skips unchanged files)
node --max-old-space-size=8192 scripts/ops/lib/rag/build-index.mjs

# Clear and rebuild from scratch
node --max-old-space-size=8192 scripts/ops/lib/rag/build-index.mjs --clear
```

**Nightly automation:**
- `anqr-rag-rebuild.timer` fires at 03:00 daily (one hour after nightly ops)
- Service: `anqr-rag-rebuild.service` with 8GB heap and 30-minute timeout
- Install: `systemctl --user enable --now anqr-rag-rebuild.timer`

## Prerequisites

- **Ollama** must be running locally (`ollama serve`)
- **Model** must be pulled: `ollama pull qwen2.5-coder:3b-instruct`
- Verify with: `node scripts/ops/integrations/model/ollama-local-audit.mjs`

## Design Decisions

1. **Regex over AST** — The chunker uses regex patterns to detect code boundaries
   instead of full AST parsing. This keeps the module dependency-free and fast,
   at the cost of occasional imprecise splits for deeply nested code.

2. **JSON-on-disk over SQLite** — The vector store uses plain JSON files rather
   than a database. For codebases under ~10k files this is fast enough, and it
   avoids native module dependencies.

3. **Same model for embeddings and generation** — Using `qwen2.5-coder:3b-instruct`
   for both embeddings and code generation means only one model needs to be loaded
   in GPU memory.

4. **Graceful degradation** — All embedding functions return `null` on failure
   rather than throwing, so the pipeline can operate in a degraded mode when
   Ollama is temporarily unavailable.

5. **Concurrency limit of 2** — Ollama has effectively one GPU execution slot;
   2 concurrent requests balance throughput against queueing latency.
