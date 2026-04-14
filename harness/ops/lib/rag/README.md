# Rag

## Purpose
Rag contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 6 immediate files
- 6 child directories

## Key Files
- `build-index-linear.mjs` - JavaScript/TypeScript module used by this directory.
- `build-index.mjs` - JavaScript/TypeScript module used by this directory.
- `chunker.mjs` - JavaScript/TypeScript module used by this directory.
- `embeddings.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-chunker.mjs` - JavaScript/TypeScript module used by this directory.
- `vector-store.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `build-index/` - Build Index scope; immediate files include `build-candidate-list.mjs`, `classify-file.mjs`, `detect-project-root.mjs`, `discover-tracked-files.mjs`, and others.
- `build-index-linear/` - Build Index Linear scope; immediate files include `build-linear-index.mjs`, `detect-project-root.mjs`, `export-path.mjs`, `index-dir.mjs`, and others.
- `chunker/` - Chunker scope; immediate files include `build-line-starts.mjs`, `chunk-code.mjs`, `chunk-file.mjs`, `chunk-generic-text.mjs`, and others.
- `embeddings/` - Embeddings scope; immediate files include `cosine-similarity.mjs`, `embedding-model.mjs`, `embedding-timeout-ms.mjs`, `failure-cooldown-ms.mjs`, and others.
- `linear-chunker/` - Linear Chunker scope; immediate files include `as-comma-list.mjs`, `chunk-linear-issue.mjs`, `chunk-linear-issues.mjs`, `compact-whitespace.mjs`, and others.
- `vector-store/` - Vector Store scope; immediate files include `atomic-write-json.mjs`, `cleanup-stale-index-files.mjs`, `clear-index.mjs`, `default-extensions.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 6 immediate file(s) and 6 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
