# Build Index Linear

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `build-linear-index.mjs`, `detect-project-root.mjs`, `export-path.mjs`, `index-dir.mjs`, and others.

## Contents
- 12 immediate files
- 0 child directories

## Key Files
- `build-linear-index.mjs` - Exports `buildLinearIndex`, the main helper defined in this file.
- `detect-project-root.mjs` - Exports `detectProjectRoot`, the main helper defined in this file.
- `export-path.mjs` - Exports `EXPORT_PATH`, a shared constant or state value used by sibling modules.
- `index-dir.mjs` - Exports `INDEX_DIR`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `linear-embedding-concurrency.mjs` - Exports `LINEAR_EMBEDDING_CONCURRENCY`, a shared constant or state value used by sibling modules.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `project-root.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `save-index.mjs` - Exports `saveIndex`, the main helper defined in this file.
- `sort-entries.mjs` - Exports `sortEntries`, the main helper defined in this file.
- `write-file.mjs` - Exports `writeFile`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 12 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
