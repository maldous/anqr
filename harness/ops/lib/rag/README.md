# Rag

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `build-index-linear.mjs`, `build-index.mjs`, `chunker.mjs`, `embeddings.mjs`, and others, with child directories `build-index/`, `build-index-linear/`, `chunker/`, `embeddings/`, and others.

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
- `build-index/` - Directory for RAG indexing and retrieval support; immediate files include `build-candidate-list.mjs`, `classify-file.mjs`, `detect-project-root.mjs`, `discover-tracked-files.mjs`, and others.
- `build-index-linear/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `build-linear-index.mjs`, `detect-project-root.mjs`, `export-path.mjs`, `index-dir.mjs`, and others.
- `chunker/` - Directory for RAG indexing and retrieval support; immediate files include `build-line-starts.mjs`, `chunk-code.mjs`, `chunk-file.mjs`, `chunk-generic-text.mjs`, and others.
- `embeddings/` - Directory for RAG indexing and retrieval support; immediate files include `cosine-similarity.mjs`, `embedding-model.mjs`, `embedding-timeout-ms.mjs`, `failure-cooldown-ms.mjs`, and others.
- `linear-chunker/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `as-comma-list.mjs`, `chunk-linear-issue.mjs`, `chunk-linear-issues.mjs`, `compact-whitespace.mjs`, and others.
- `vector-store/` - Directory for RAG indexing and retrieval support; immediate files include `atomic-write-json.mjs`, `cleanup-stale-index-files.mjs`, `clear-index.mjs`, `default-extensions.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 6 immediate files and 6 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
