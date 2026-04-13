# Lib

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `correlation-id.mjs`, `durable-kv.mjs`, `logger.mjs`, `logger.spec.ts`, and others, with child directories `correlation-id/`, `durable-kv/`, `logger/`, `notify/`, and others.

## Contents
- 8 immediate files
- 6 child directories

## Key Files
- `correlation-id.mjs` - Re-export facade that assembles the public surface for this directory.
- `durable-kv.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - JavaScript/TypeScript module used by this directory.
- `logger.spec.ts` - *
- `notify.mjs` - JavaScript/TypeScript module used by this directory.
- `sonar-linear-sync.mjs` - JavaScript/TypeScript module used by this directory.
- `structured-log.mjs` - Exports `createStructuredLogger`, the main helper defined in this file.
- `update-memory.mjs` - Exports `updateMemory`, the main helper defined in this file.

## Subdirectories
- `correlation-id/` - Directory for harness support logic; immediate files include `correlation-id-from-request.mjs`, `extract-correlation-id.mjs`, `generate-correlation-id.mjs`, `index.mjs`.
- `durable-kv/` - Directory for harness support logic; immediate files include `create-durable-map.mjs`, `create-durable-queue.mjs`, `create-durable-set.mjs`, `index.mjs`, and others, with child directories `store-helpers/`.
- `logger/` - Directory for harness support logic; immediate files include `create-logger.mjs`, `get-caller-info.mjs`, `index.mjs`, `log-levels.mjs`.
- `notify/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `check-dedup.mjs`, `dedup-window-ms.mjs`, `dirname.mjs`, `ensure-dir.mjs`, and others.
- `rag/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `build-index-linear.mjs`, `build-index.mjs`, `chunker.mjs`, `embeddings.mjs`, and others, with child directories `build-index/`, `build-index-linear/`, `chunker/`, `embeddings/`, and others.
- `search/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `hybrid-search.mjs`, `linear-search.mjs`, with child directories `hybrid-search/`, `linear-search/`.

## Operational Notes
- Current on-disk inventory: 8 immediate files and 6 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
