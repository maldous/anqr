# ANQR Linear Search

## 1. Directory Overview

This directory implements **ANQR Linear Search** within the ANQR harness. Key immediate entries include `index.mjs`, `search-linear-issues.mjs`, `build-search-entry.mjs`, `get-linear-index-stats.mjs`. The current inventory is 17 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-search-entry.mjs** - Exports `buildSearchEntry`, which builds search entry.
- **compute-lexical-score.mjs** - Exports `computeLexicalScore`, which implements compute lexical score.
- **compute-recency-bonus.mjs** - Exports `computeRecencyBonus`, which implements compute recency bonus.
- **detect-project-root.mjs** - Exports `detectProjectRoot`, which detects project root.
- **extract-title.mjs** - Exports `extractTitle`, which implements extract title.
- **get-linear-index-stats.mjs** - Exports `getLinearIndexStats`, which gets linear index stats.
- **index.mjs** - Facade module that re-exports public members from `./detect-project-root.mjs`, `./project-root.mjs`, `./linear-index-dir.mjs`, `./linear-index-file.mjs`, `./linear-index-cache.mjs`, `./normalize-text.mjs`, and 9 more siblings.
- **linear-index-cache.mjs** - Exports `linearIndexCache`, `setLinearIndexCache`, providing the reusable API for this directory concern.
- **linear-index-dir.mjs** - Exports `LINEAR_INDEX_DIR`, a shared constant used by sibling modules.
- **linear-index-file.mjs** - Exports `LINEAR_INDEX_FILE`, a shared constant used by sibling modules.
- **load-linear-index.mjs** - Exports `loadLinearIndex`, which loads linear index.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **normalize-text.mjs** - Exports `normalizeText`, which normalizes text.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **search-linear-issues.mjs** - Exports `searchLinearIssues`, which implements search linear issues.
- **tokenize.mjs** - Exports `tokenize`, which implements tokenize.
- **warm-linear-index.mjs** - Exports `warmLinearIndex`, which implements warm linear index.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, subprocess execution, Linear integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/lib/search/linear-search/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:fs/promises`, `node:path`
- **Internal relative modules** - `../../logger.mjs`, `../../rag/embeddings.mjs`, `./build-search-entry.mjs`, `./compute-lexical-score.mjs`, `./compute-recency-bonus.mjs`, `./detect-project-root.mjs`, `./extract-title.mjs`, `./linear-index-cache.mjs`, `./linear-index-dir.mjs`, `./linear-index-file.mjs`, `./load-linear-index.mjs`, `./logger.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
