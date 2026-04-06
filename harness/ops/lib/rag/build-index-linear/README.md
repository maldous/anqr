# Linear RAG Index Builder

## 1. Directory Overview

This directory implements **Linear RAG Index Builder** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 12 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-linear-index.mjs** - Exports `buildLinearIndex`, which builds linear index.
- **detect-project-root.mjs** - Exports `detectProjectRoot`, which detects project root.
- **export-path.mjs** - Exports `EXPORT_PATH`, a shared constant used by sibling modules.
- **index-dir.mjs** - Exports `INDEX_DIR`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./detect-project-root.mjs`, `./project-root.mjs`, `./export-path.mjs`, `./index-dir.mjs`, `./linear-embedding-concurrency.mjs`, `./save-index.mjs`, and 2 more siblings.
- **linear-embedding-concurrency.mjs** - Exports `LINEAR_EMBEDDING_CONCURRENCY`, a shared constant used by sibling modules.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`, `logWarn`.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **save-index.mjs** - Exports `saveIndex`, which implements save index.
- **sort-entries.mjs** - Exports `sortEntries`, which sorts entries.
- **write-file.mjs** - Exports `writeFile`, which writes file.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, network/API integration, subprocess execution, Linear integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/lib/rag/build-index-linear/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:crypto`, `node:fs/promises`, `node:path`
- **Internal relative modules** - `../../logger.mjs`, `../embeddings.mjs`, `../linear-chunker.mjs`, `./detect-project-root.mjs`, `./export-path.mjs`, `./index-dir.mjs`, `./index.mjs`, `./linear-embedding-concurrency.mjs`, `./logger.mjs`, `./project-root.mjs`, `./save-index.mjs`, `./sort-entries.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
