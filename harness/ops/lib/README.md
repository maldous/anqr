# Lib

## Purpose
Lib contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 8 immediate files
- 6 child directories

<<<<<<< ours — heading `Key Files` (F, confidence: medium)
// hint: Logic changed on both sides. Requires understanding intent of each change.
## Key Files
- `correlation-id.mjs` - Re-export facade that assembles the public surface for this directory.
- `durable-kv.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - JavaScript/TypeScript module used by this directory.
- `logger.spec.ts` - JavaScript/TypeScript module used by this directory.
- `notify.mjs` - JavaScript/TypeScript module used by this directory.
- `sonar-linear-sync.mjs` - JavaScript/TypeScript module used by this directory.
- `structured-log.mjs` - Exports `createStructuredLogger`, the main helper defined in this file.
- `update-memory.mjs` - Exports `updateMemory`, the main helper defined in this file.

=======
## Key Files

- `correlation-id.mjs` - Re-export facade that assembles the public surface for this directory.
- `durable-kv.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - JavaScript/TypeScript module used by this directory.
- `logger.spec.ts` - \*
- `notify.mjs` - JavaScript/TypeScript module used by this directory.
- `sonar-linear-sync.mjs` - JavaScript/TypeScript module used by this directory.
- `structured-log.mjs` - Exports `createStructuredLogger`, the main helper defined in this file.
- `update-memory.mjs` - Exports `updateMemory`, the main helper defined in this file.

>>>>>>> theirs — heading `Key Files` (F, confidence: medium)
## Subdirectories
- `correlation-id/` - Correlation Id scope; immediate files include `correlation-id-from-request.mjs`, `extract-correlation-id.mjs`, `generate-correlation-id.mjs`, `index.mjs`.
- `durable-kv/` - Durable Kv scope; immediate files include `create-durable-map.mjs`, `create-durable-queue.mjs`, `create-durable-set.mjs`, `index.mjs`, and others; child directories include `store-helpers/`.
- `logger/` - Logger scope; immediate files include `create-logger.mjs`, `get-caller-info.mjs`, `index.mjs`, `log-levels.mjs`.
- `notify/` - Notify scope; immediate files include `check-dedup.mjs`, `dedup-window-ms.mjs`, `dirname.mjs`, `ensure-dir.mjs`, and others.
- `rag/` - Rag scope; immediate files include `build-index-linear.mjs`, `build-index.mjs`, `chunker.mjs`, `embeddings.mjs`, and others; child directories include `build-index/`, `build-index-linear/`, `chunker/`, `embeddings/`, and others.
- `search/` - Search scope; immediate files include `hybrid-search.mjs`, `linear-search.mjs`; child directories include `hybrid-search/`, `linear-search/`.

## Operational Notes
- Current on-disk inventory: 8 immediate file(s) and 6 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
