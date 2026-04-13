# Linear Search

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `build-search-entry.mjs`, `compute-lexical-score.mjs`, `compute-recency-bonus.mjs`, `detect-project-root.mjs`, and others.

## Contents
- 17 immediate files
- 0 child directories

## Key Files
- `build-search-entry.mjs` - Exports `buildSearchEntry`, the main helper defined in this file.
- `compute-lexical-score.mjs` - Exports `computeLexicalScore`, the main helper defined in this file.
- `compute-recency-bonus.mjs` - Exports `computeRecencyBonus`, the main helper defined in this file.
- `detect-project-root.mjs` - Exports `detectProjectRoot`, the main helper defined in this file.
- `extract-title.mjs` - Exports `extractTitle`, the main helper defined in this file.
- `get-linear-index-stats.mjs` - Exports `getLinearIndexStats`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `linear-index-cache.mjs` - Exports `setLinearIndexCache`, the main helper defined in this file.
- `linear-index-dir.mjs` - Exports `LINEAR_INDEX_DIR`, a shared constant or state value used by sibling modules.
- `linear-index-file.mjs` - Exports `LINEAR_INDEX_FILE`, a shared constant or state value used by sibling modules.
- `load-linear-index.mjs` - Exports `loadLinearIndex`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `normalize-text.mjs` - Exports `normalizeText`, the main helper defined in this file.
- `project-root.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `search-linear-issues.mjs` - Exports `searchLinearIssues`, the main helper defined in this file.
- `tokenize.mjs` - Exports `tokenize`, the main helper defined in this file.
- `warm-linear-index.mjs` - Exports `warmLinearIndex`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 17 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
