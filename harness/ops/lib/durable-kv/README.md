# Durable Kv

## Purpose
Durable Kv contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 6 immediate files
- 1 child directory

## Key Files

- `create-durable-map.mjs` - Exports `createDurableMap`, the main helper defined in this file.
- `create-durable-queue.mjs` - Exports `createDurableQueue`, the main helper defined in this file.
- `create-durable-set.mjs` - Exports `createDurableSet`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `store-helpers.mjs` - Re-export facade that assembles the public surface for this directory.
- `with-store-lock.mjs` - Exports `withStoreLock`, the main helper defined in this file.

## Subdirectories
- `store-helpers/` - Store Helpers scope; immediate files include `get-store-dir.mjs`, `get-store-path.mjs`, `index.mjs`, `load-store.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 6 immediate file(s) and 1 child directory.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
