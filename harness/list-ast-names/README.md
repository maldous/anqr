# List Ast Names

## Purpose
List Ast Names contains the code, configuration, or support files that implement this part of the harness architecture.

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
- Current on-disk inventory: 11 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
