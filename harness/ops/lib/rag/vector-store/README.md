# Vector Store

## Purpose
Vector Store contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 39 immediate files
- 0 child directories

## Key Files

- `atomic-write-json.mjs` - Exports `atomicWriteJSON`, the main helper defined in this file.
- `cleanup-stale-index-files.mjs` - Exports `cleanupStaleIndexFiles`, the main helper defined in this file.
- `clear-index.mjs` - Exports `clearIndex`, the main helper defined in this file.
- `default-extensions.mjs` - Exports `DEFAULT_EXTENSIONS`, a shared constant or state value used by sibling modules.
- `detect-project-root.mjs` - Exports `detectProjectRoot`, the main helper defined in this file.
- `directory-save-interval.mjs` - Exports `DIRECTORY_SAVE_INTERVAL`, a shared constant or state value used by sibling modules.
- `ensure-index-dir.mjs` - Exports `ensureIndexDir`, the main helper defined in this file.
- `flush-index.mjs` - Exports `flushIndex`, the main helper defined in this file.
- `get-file-mtime.mjs` - Exports `getFileMtime`, the main helper defined in this file.
- `get-file-size.mjs` - Exports `getFileSize`, the main helper defined in this file.
- `get-index-stats.mjs` - Exports `getIndexStats`, the main helper defined in this file.
- `index-cache.mjs` - Exports `setIndexCache`, the main helper defined in this file.
- `index-dir.mjs` - Exports `INDEX_DIR`, a shared constant or state value used by sibling modules.
- `index-directory.mjs` - Exports `indexDirectory`, the main helper defined in this file.
- `index-dirty.mjs` - Exports `setIndexDirty`, the main helper defined in this file.
- `index-file-2.mjs` - Exports `indexFile`, the main helper defined in this file.
- `index-file.mjs` - Exports `INDEX_FILE`, a shared constant or state value used by sibling modules.
- `index-loaded.mjs` - Exports `setIndexLoaded`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-index-ready.mjs` - Exports `isIndexReady`, the main helper defined in this file.
- `is-valid-entry.mjs` - Exports `isValidEntry`, the main helper defined in this file.
- `load-index.mjs` - Exports `loadIndex`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `manifest-file.mjs` - Exports `MANIFEST_FILE`, a shared constant or state value used by sibling modules.
- `mark-dirty.mjs` - Exports `markDirty`, the main helper defined in this file.
- `max-shard-size-bytes.mjs` - Exports `MAX_SHARD_SIZE_BYTES`, a shared constant or state value used by sibling modules.
- `meta-cache.mjs` - Exports `setMetaCache`, the main helper defined in this file.
- `meta-file.mjs` - Exports `META_FILE`, a shared constant or state value used by sibling modules.
- `normalize-path-string.mjs` - Exports `normalizePathString`, the main helper defined in this file.
- `project-root.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `prune-index.mjs` - Exports `pruneIndex`, the main helper defined in this file.
- `remove-entries-for-resolved-path.mjs` - Exports `removeEntriesForResolvedPath`, the main helper defined in this file.
- `sanitize-meta-record.mjs` - Exports `sanitizeMetaRecord`, the main helper defined in this file.
- `save-index.mjs` - Exports `saveIndex`, the main helper defined in this file.
- `search.mjs` - Exports `search`, the main helper defined in this file.
- `sort-entries.mjs` - Exports `sortEntries`, the main helper defined in this file.
- `to-name-set.mjs` - Exports `toNameSet`, the main helper defined in this file.
- `to-resolved-path.mjs` - Exports `toResolvedPath`, the main helper defined in this file.
- `to-stored-path.mjs` - Exports `toStoredPath`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 39 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
