# Durable Kv

## Purpose
Directory for harness support logic; immediate files include `create-durable-map.mjs`, `create-durable-queue.mjs`, `create-durable-set.mjs`, `index.mjs`, and others, with child directories `store-helpers/`.

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
- `store-helpers/` - Directory for harness support logic; immediate files include `get-store-dir.mjs`, `get-store-path.mjs`, `index.mjs`, `load-store.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 6 immediate files and 1 child directory.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
