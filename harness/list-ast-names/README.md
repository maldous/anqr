# List Ast Names

## Purpose
Directory for runtime service bootstrap or environment support; immediate files include `collect-top-level-entries.mjs`, `describe-variable-declaration.mjs`, `flatten-results.mjs`, `format-flat.mjs`, and others.

## Contents
- 11 immediate files
- 0 child directories

## Key Files
- `collect-top-level-entries.mjs` - Exports `collectTopLevelEntries`, a shared constant or state value used by sibling modules.
- `describe-variable-declaration.mjs` - Exports `describeVariableDeclaration`, a shared constant or state value used by sibling modules.
- `flatten-results.mjs` - Exports `flattenResults`, a shared constant or state value used by sibling modules.
- `format-flat.mjs` - Exports `formatFlat`, a shared constant or state value used by sibling modules.
- `format-grouped-file.mjs` - Exports `formatGroupedFile`, a shared constant or state value used by sibling modules.
- `group-by-file.mjs` - Exports `groupByFile`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-exported-node.mjs` - Exports `isExportedNode`, a shared constant or state value used by sibling modules.
- `main.mjs` - Exports `main`, a shared constant or state value used by sibling modules.
- `parse-args.mjs` - Exports `parseArgs`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 11 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
