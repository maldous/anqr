# Audit Ast Density

## Purpose
Directory for runtime service bootstrap or environment support; immediate files include `collect-heavy-nodes.mjs`, `default-threshold.mjs`, `describe-variable-declaration.mjs`, `format-entry.mjs`, and others.

## Contents
- 9 immediate files
- 0 child directories

## Key Files
- `collect-heavy-nodes.mjs` - Exports `collectHeavyNodes`, a shared constant or state value used by sibling modules.
- `default-threshold.mjs` - Exports `DEFAULT_THRESHOLD`, a shared constant or state value used by sibling modules.
- `describe-variable-declaration.mjs` - Exports `describeVariableDeclaration`, a shared constant or state value used by sibling modules.
- `format-entry.mjs` - Exports `formatEntry`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-pure-type-declaration-file.mjs` - Exports `isPureTypeDeclarationFile`, a shared constant or state value used by sibling modules.
- `main.mjs` - Exports `main`, a shared constant or state value used by sibling modules.
- `parse-args.mjs` - Exports `parseArgs`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 9 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
