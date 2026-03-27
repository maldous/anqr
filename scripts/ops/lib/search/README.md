# Hybrid Search

Combines **BM25 keyword search** (via [MiniSearch](https://lucaong.github.io/minisearch/)) with **embedding-based semantic search** using Reciprocal Rank Fusion (RRF).

## Overview

```
┌─────────────┐     ┌──────────────────┐
│  User Query  │────▶│  BM25 (MiniSearch)│──── ranked list A
└─────────────┘     └──────────────────┘
       │            ┌──────────────────┐
       └───────────▶│ Embedding Search  │──── ranked list B
                    └──────────────────┘
                              │
                    ┌─────────▼────────┐
                    │  Reciprocal Rank  │
                    │     Fusion (RRF)  │
                    └─────────┬────────┘
                              │
                    ┌─────────▼────────┐
                    │  Top-K Results    │
                    └──────────────────┘
```

### Graceful Degradation

The module automatically falls back when components are unavailable:

| Scenario | Method |
|---|---|
| Embeddings + BM25 available | `hybrid` — full RRF fusion |
| Embeddings unavailable | `bm25` — keyword search only |
| No results from either | `basic` — substring matching |

## Exports

### `createHybridSearchIndex(files)`

Build (or rebuild) the BM25 index from an array of file objects.

```js
import { createHybridSearchIndex } from './hybrid-search.mjs';

createHybridSearchIndex([
  { path: 'src/auth.ts', content: 'export function authenticate() { ... }' },
  { path: 'src/db.ts',   content: 'export class Database { ... }' },
]);
```

**Parameters:**
- `files` — `Array<{ path: string, content: string }>` — files to index.

**Returns:** the `MiniSearch` instance (also cached internally).

---

### `hybridSearch(query, options?)`

Perform a hybrid search over the indexed files.

```js
import { hybridSearch } from './hybrid-search.mjs';

const results = await hybridSearch('authentication middleware', {
  topK: 10,
  bm25Weight: 0.5,
  embeddingWeight: 0.5,
  useEmbeddings: true,
});

// results: [{ path, score, bm25Score, embeddingScore, snippet }, ...]
```

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `topK` | `number` | `20` | Maximum results to return |
| `bm25Weight` | `number` | `0.5` | Weight for BM25 scores in RRF (0–1) |
| `embeddingWeight` | `number` | `0.5` | Weight for embedding scores in RRF (0–1) |
| `useEmbeddings` | `boolean` | `true` | Whether to attempt embedding search |

**Returns:** `Promise<Array<{ path, score, bm25Score, embeddingScore, snippet }>>`

---

### `searchFiles(query, options?)`

High-level entry point that handles file collection, index creation, and searching.

```js
import { searchFiles } from './hybrid-search.mjs';

const { files, count, query, method } = await searchFiles('database connection');
// method: 'hybrid' | 'bm25' | 'basic'
```

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `rootDir` | `string` | `process.cwd()` | Project root directory to scan |
| `topK` | `number` | `20` | Maximum results to return |
| `useEmbeddings` | `boolean` | `true` | Whether to attempt embedding search |

**Indexed file types:** `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.json`, `.md`

**Excluded directories:** `node_modules`, `.git`, `coverage`, `dist`, `build`

**Returns:** `Promise<{ files: string[], count: number, query: string, method: string }>`

---

### `getSearchStats()`

Returns statistics about the current search index.

```js
import { getSearchStats } from './hybrid-search.mjs';

const stats = getSearchStats();
// {
//   indexed: true,
//   documentCount: 847,
//   builtAt: '2025-01-15T10:30:00.000Z',
//   embeddingsAvailable: false,
//   vectorStoreReady: false,
// }
```

## Reciprocal Rank Fusion (RRF)

RRF merges multiple ranked lists without requiring score normalisation. For each result in a ranked list:

```
score(d) = 1 / (k + rank)
```

Where `k = 60` (the standard constant from the [original RRF paper](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)).

The final score for each document is the weighted sum of its RRF scores from each retrieval method:

```
final(d) = bm25Weight × rrf_bm25(d) + embeddingWeight × rrf_embedding(d)
```

## Caching

The BM25 index is cached at the module level. It is only rebuilt when:

- No index exists (first call)
- The file set fingerprint changes (files added/removed)

This makes repeated searches over the same codebase fast (~1ms per query after indexing).

## Dependencies

- **`minisearch`** — BM25 full-text search (npm, already installed)
- **`../rag/embeddings.mjs`** — Optional: embedding generation (`generateEmbedding`, `cosineSimilarity`, `isOllamaAvailable`)
- **`../rag/vector-store.mjs`** — Optional: pre-built vector index (`search`, `isIndexReady`)
- **`../logger.mjs`** — Structured logging
