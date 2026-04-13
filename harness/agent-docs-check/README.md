# Agent Docs Check

## Purpose
Directory for runtime service bootstrap or environment support; immediate files include `compare-sets.mjs`, `errors.mjs`, `index.mjs`, `logger.mjs`, and others.

## Contents
- 12 immediate files
- 0 child directories

## Key Files
- `compare-sets.mjs` - Exports `compareSets`, the main helper defined in this file.
- `errors.mjs` - Exports `errors`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `parse-known-agent-types.mjs` - Exports `parseKnownAgentTypes`, the main helper defined in this file.
- `parse-markdown-table.mjs` - Exports `parseMarkdownTable`, the main helper defined in this file.
- `read.mjs` - Exports `read`, the main helper defined in this file.
- `repo-root.mjs` - Exports `repoRoot`, a shared constant or state value used by sibling modules.
- `resolve.mjs` - Exports `resolve`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `sorted.mjs` - Exports `sorted`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 12 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
