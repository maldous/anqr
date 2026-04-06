# ANQR Linear Search

## 1. Directory Overview

This directory contains the linear search module for the ANQR (Agentic Number Query Runner) harness. It provides hybrid search capabilities for Linear issues combining lexical (keyword-based) and semantic (embedding-based) ranking with recency bonuses. The module indexes Linear issue data and enables fast, relevant issue retrieval for context-aware AI operations.

## 2. File Summaries

### Core Search Implementation

- **search-linear-issues.mjs** - Main search function that combines lexical and semantic scoring. Uses a hybrid approach: semantic score (75%) + lexical score (20%) + recency bonus. Falls back to lexical-only ranking if embedding generation fails. Returns top-K results with scores, identifiers, titles, states, priorities, excerpts, and content.

- **compute-lexical-score.mjs** - Computes lexical matching score based on token coverage (matched tokens / query tokens) plus a 0.25 phrase boost if all query tokens appear as a contiguous phrase in the searchable text.

- **compute-recency-bonus.mjs** - Applies recency bonus: 0.08 for issues updated within 7 days, 0.04 for 8-30 days, 0 beyond 30 days. Encourages fresh issue retrieval.

### Index Management

- **load-linear-index.mjs** - Loads the Linear index JSON file with caching. Checks file modification time (mtime) to avoid reloading unchanged indexes. Parses JSON and transforms entries via buildSearchEntry.

- **linear-index-cache.mjs** - Simple module-level cache for linear index entries. Exports `linearIndexCache` (null initially) and `setLinearIndexCache` function.

- **get-linear-index-stats.mjs** - Returns index statistics including ready status, entry count, built timestamp, file path, or error message if loading fails.

- **warm-linear-index.mjs** - Async wrapper that calls loadLinearIndex to pre-warm the cache.

### Text Processing

- **normalize-text.mjs** - Converts text to lowercase for case-insensitive matching.

- **tokenize.mjs** - Tokenizes text by normalizing, removing non-alphanumeric characters, splitting on whitespace, and filtering tokens shorter than 2 characters.

- **extract-title.mjs** - Extracts issue title from markdown content using regex pattern `^#\s+([A-Z]+-\d+):\s+(.+)$`. Returns "(no title)" if pattern doesn't match.

- **build-search-entry.mjs** - Transforms raw index entry by extracting title, state, priority, updatedAt from metadata; creating searchable text (identifier + title + state + priority + content); generating excerpt (first 300 chars); computing search tokens via tokenize(); and normalizing searchable text.

### Path Resolution

- **detect-project-root.mjs** - Detects project root directory using `git rev-parse --show-toplevel`. Falls back to current working directory if git fails.

- **project-root.mjs** - Exports PROJECT_ROOT constant resolved at module load time via detectProjectRoot.

- **linear-index-dir.mjs** - Resolves LINEAR_INDEX_DIR to `reports/rag-index-linear` relative to PROJECT_ROOT.

- **linear-index-file.mjs** - Resolves LINEAR_INDEX_FILE to `reports/rag-index-linear/index.json`.

### Logging

- **logger.mjs** - Creates a namespaced logger ("linear-search") from the shared logger module. Exports logDebug, logInfo, logWarn, logError.

### Facade

- **index.mjs** - Generated facade that re-exports all public API members: detectProjectRoot, PROJECT_ROOT, LINEAR_INDEX_DIR, LINEAR_INDEX_FILE, linearIndexCache, normalizeText, tokenize, extractTitle, buildSearchEntry, loadLinearIndex, computeLexicalScore, computeRecencyBonus, searchLinearIssues, warmLinearIndex, getLinearIndexStats.

## 3. Overall Directory Function

This directory provides the search infrastructure for retrieving relevant Linear issues. It operates as part of the larger RAG (Retrieval-Augmented Generation) system within the ANQR harness.

The search workflow:

1. **Index Loading**: loadLinearIndex reads the JSON index from `reports/rag-index-linear/index.json`, applies buildSearchEntry transformations, and caches the result.

2. **Query Processing**: searchLinearIssues tokenizes the query, performs initial lexical ranking to select up to 25 candidates, generates query embedding via embeddings.mjs, computes hybrid scores, and returns top-K results.

3. **Hybrid Scoring**: When embeddings are available, uses semantic score (75%) + lexical score (20%) + recency bonus. Falls back to lexical + recency only if embedding generation fails.

4. **Caching**: The index is cached and only reloaded if the file's mtime changes, ensuring efficient repeated searches.

This module enables AI agents to find relevant Linear issues for context injection, reducing hallucinations and improving response accuracy.

## 4. Usage Instructions

### Primary API: Search Linear Issues

```javascript
import { searchLinearIssues } from "./ops/lib/search/linear-search/index.mjs";

// Search for issues matching a query
const results = await searchLinearIssues("authentication error", 5);
// Returns: [{ identifier, title, state, priority, score, excerpt, content, updatedAt }, ...]
```

### Index Management

```javascript
import { loadLinearIndex, warmLinearIndex, getLinearIndexStats } from "./ops/lib/search/linear-search/index.mjs";

// Pre-warm the index cache
await warmLinearIndex();

// Get index statistics
const stats = getLinearIndexStats();
// Returns: { ready: boolean, entries: number, builtAt: string, path: string }
```

### Build Custom Search Entries

```javascript
import { buildSearchEntry, tokenize, computeLexicalScore, computeRecencyBonus } from "./ops/lib/search/linear-search/index.mjs";

// Process raw index entry
const processed = buildSearchEntry(rawEntry);

// Compute individual scores
const tokens = tokenize("your query");
const lexicalScore = computeLexicalScore(tokens, entry);
const recency = computeRecencyBonus(entry.updatedAt);
```

### Prerequisites

- Linear index must exist at `reports/rag-index-linear/index.json`
- Index is built by `ops/lib/rag/build-index-linear.mjs`

## 5. Dependencies

### Internal Dependencies

- **../../rag/embeddings.mjs** - Provides `generateEmbedding` and `cosineSimilarity` for semantic search
- **../../logger.mjs** - Shared logger factory used by logger.mjs

### Runtime Requirements

- **Node.js** - ESM modules with .mjs extension
- **Git** - For project root detection (detectProjectRoot)
- **Ollama** - For embedding generation (fallback to lexical-only if unavailable)

### File System

- Index file: `reports/rag-index-linear/index.json` (must be generated beforehand)

## 6. Additional Comments

- **Fail-Safe Design**: searchLinearIssues gracefully falls back to lexical-only ranking if embedding generation fails, ensuring search still works even without Ollama.

- **Caching Strategy**: Index is cached at the module level and only reloaded when file mtime changes, avoiding redundant parsing on repeated searches.

- **Token Filtering**: Minimum token length of 2 filters out common but uninformative words like "a", "an", "to".

- **Phrase Boost**: The 0.25 lexical phrase boost rewards exact phrase matches, improving precision for multi-word queries.

- **Recency Weighting**: Recent issues receive bonus scoring to surface active work over stale historical issues.

- **Candidate Limit**: Initial lexical filter limits candidates to 25, balancing recall with performance before semantic scoring.

- **Zero-Copy Optimization**: Search tokens are pre-computed during index building, not at query time.