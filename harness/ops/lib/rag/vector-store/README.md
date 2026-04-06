# ANQR Vector Store

## 1. Directory Overview

This directory implements **ANQR Vector Store** within the ANQR harness. Key immediate entries include `index.mjs`, `remove-entries-for-resolved-path.mjs`, `max-shard-size-bytes.mjs`, `cleanup-stale-index-files.mjs`. The current inventory is 39 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **atomic-write-json.mjs** - Exports `atomicWriteJSON`, which implements atomic write json.
- **cleanup-stale-index-files.mjs** - Exports `cleanupStaleIndexFiles`, which implements cleanup stale index files.
- **clear-index.mjs** - Exports `clearIndex`, which clears index.
- **default-extensions.mjs** - Exports `DEFAULT_EXTENSIONS`, a shared constant used by sibling modules.
- **detect-project-root.mjs** - Exports `detectProjectRoot`, which detects project root.
- **directory-save-interval.mjs** - Exports `DIRECTORY_SAVE_INTERVAL`, a shared constant used by sibling modules.
- **ensure-index-dir.mjs** - Exports `ensureIndexDir`, which ensures index dir.
- **flush-index.mjs** - Exports `flushIndex`, which implements flush index.
- **get-file-mtime.mjs** - Exports `getFileMtime`, which gets file mtime.
- **get-file-size.mjs** - Exports `getFileSize`, which gets file size.
- **get-index-stats.mjs** - Exports `getIndexStats`, which gets index stats.
- **index-cache.mjs** - Exports `indexCache`, `setIndexCache`, providing the reusable API for this directory concern.
- **index-dir.mjs** - Exports `INDEX_DIR`, a shared constant used by sibling modules.
- **index-directory.mjs** - Exports `indexDirectory`, which re-exports the directory's public modules.
- **index-dirty.mjs** - Exports `indexDirty`, `setIndexDirty`, providing the reusable API for this directory concern.
- **index-file-2.mjs** - Exports `indexFile`, which re-exports the directory's public modules.
- **index-file.mjs** - Exports `INDEX_FILE`, a shared constant used by sibling modules.
- **index-loaded.mjs** - Exports `indexLoaded`, `setIndexLoaded`, providing the reusable API for this directory concern.
- **index.mjs** - Facade module that re-exports public members from `./detect-project-root.mjs`, `./project-root.mjs`, `./index-dir.mjs`, `./index-file.mjs`, `./meta-file.mjs`, `./manifest-file.mjs`, and 28 more siblings.
- **is-index-ready.mjs** - Exports `isIndexReady`, which checks whether index ready.
- **is-valid-entry.mjs** - Exports `isValidEntry`, which checks whether valid entry.
- **load-index.mjs** - Exports `loadIndex`, which loads index.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **manifest-file.mjs** - Exports `MANIFEST_FILE`, a shared constant used by sibling modules.
- **mark-dirty.mjs** - Exports `markDirty`, which marks dirty.
- **max-shard-size-bytes.mjs** - Exports `MAX_SHARD_SIZE_BYTES`, a shared constant used by sibling modules.
- **meta-cache.mjs** - Exports `metaCache`, `setMetaCache`, providing the reusable API for this directory concern.
- **meta-file.mjs** - Exports `META_FILE`, a shared constant used by sibling modules.
- **normalize-path-string.mjs** - Exports `normalizePathString`, which normalizes path string.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **prune-index.mjs** - Exports `pruneIndex`, which implements prune index.
- **remove-entries-for-resolved-path.mjs** - Exports `removeEntriesForResolvedPath`, which implements remove entries for resolved path.
- **sanitize-meta-record.mjs** - Exports `sanitizeMetaRecord`, which implements sanitize meta record.
- **save-index.mjs** - Exports `saveIndex`, which implements save index.
- **search.mjs** - Exports `search`, which implements search.
- **sort-entries.mjs** - Exports `sortEntries`, which sorts entries.
- **to-name-set.mjs** - Exports `toNameSet`, which implements to name set.
- **to-resolved-path.mjs** - Exports `toResolvedPath`, which implements to resolved path.
- **to-stored-path.mjs** - Exports `toStoredPath`, which implements to stored path.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/lib/rag/vector-store/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:crypto`, `node:fs`, `node:fs/promises`, `node:path`
- **Internal relative modules** - `../../logger.mjs`, `../chunker.mjs`, `../embeddings.mjs`, `./atomic-write-json.mjs`, `./cleanup-stale-index-files.mjs`, `./default-extensions.mjs`, `./detect-project-root.mjs`, `./directory-save-interval.mjs`, `./ensure-index-dir.mjs`, `./get-file-mtime.mjs`, `./get-file-size.mjs`, `./index-cache.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
