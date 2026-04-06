# ANQR Linear Search

## 1. Directory Overview

This directory contains the linear search module for the ANQR (Agentic Number Query Runner) harness.
It provides hybrid search capabilities for Linear issues combining lexical (keyword-based) and
semantic (embedding-based) ranking with recency bonuses. The module indexes Linear issue data and
enables fast, relevant issue retrieval for context-aware AI operations. It currently contains 17
files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-search-entry.mjs** - Transforms raw index entry by extracting title, state, priority, updatedAt from metadata; creating searchable text (identifier + title + state + priority + content); generating excerpt (first 300 chars); computing search tokens via tokenize(); and normalizing searchable text.
- **compute-lexical-score.mjs** - Computes lexical matching score based on token coverage (matched tokens / query tokens) plus a 0.25 phrase boost if all query tokens appear as a contiguous phrase in the searchable text.
- **compute-recency-bonus.mjs** - Applies recency bonus: 0.08 for issues updated within 7 days, 0.04 for 8-30 days, 0 beyond 30 days. Encourages fresh issue retrieval.
- **detect-project-root.mjs** - Detects project root directory using `git rev-parse --show-toplevel`. Falls back to current working directory if git fails.
- **extract-title.mjs** - Extracts issue title from markdown content using regex pattern `^#\s+([A-Z]+-\d+):\s+(.+)$`. Returns "(no title)" if pattern doesn't match.
- **get-linear-index-stats.mjs** - Returns index statistics including ready status, entry count, built timestamp, file path, or error message if loading fails.
- **index.mjs** - Generated facade that re-exports all public API members: detectProjectRoot, PROJECT_ROOT, LINEAR_INDEX_DIR, LINEAR_INDEX_FILE, linearIndexCache, normalizeText, tokenize, extractTitle, buildSearchEntry, loadLinearIndex, computeLexicalScore, computeRecencyBonus, searchLinearIssues, warmLinearIndex, getLinearIndexStats.
- **linear-index-cache.mjs** - Simple module-level cache for linear index entries. Exports `linearIndexCache` (null initially) and `setLinearIndexCache` function.
- **linear-index-dir.mjs** - Resolves LINEAR_INDEX_DIR to `reports/rag-index-linear` relative to PROJECT_ROOT.
- **linear-index-file.mjs** - Resolves LINEAR_INDEX_FILE to `reports/rag-index-linear/index.json`.
- **load-linear-index.mjs** - Loads the Linear index JSON file with caching. Checks file modification time (mtime) to avoid reloading unchanged indexes. Parses JSON and transforms entries via buildSearchEntry.
- **logger.mjs** - Creates a namespaced logger ("linear-search") from the shared logger module. Exports logDebug, logInfo, logWarn, logError.
- **normalize-text.mjs** - Converts text to lowercase for case-insensitive matching.
- **project-root.mjs** - Exports PROJECT_ROOT constant resolved at module load time via detectProjectRoot.
- **search-linear-issues.mjs** - Main search function that combines lexical and semantic scoring. Uses a hybrid approach: semantic score (75%) + lexical score (20%) + recency bonus. Falls back to lexical-only ranking if embedding generation fails. Returns top-K results with scores, identifiers, titles, states, priorities, excerpts, and content.
- **tokenize.mjs** - Tokenizes text by normalizing, removing non-alphanumeric characters, splitting on whitespace, and filtering tokens shorter than 2 characters.
- **warm-linear-index.mjs** - Async wrapper that calls loadLinearIndex to pre-warm the cache.

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
