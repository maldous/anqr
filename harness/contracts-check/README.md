# Contracts Check

## Purpose
Directory for runtime service bootstrap or environment support; immediate files include `allowed-schema-import-sources.mjs`, `collect-files.mjs`, `contracts-root.mjs`, `errors.mjs`, and others.

## Contents
- 13 immediate files
- 0 child directories

## Key Files
- `allowed-schema-import-sources.mjs` - Exports `allowedSchemaImportSources`, a shared constant or state value used by sibling modules.
- `collect-files.mjs` - Exports `collectFiles`, the main helper defined in this file.
- `contracts-root.mjs` - Exports `contractsRoot`, a shared constant or state value used by sibling modules.
- `errors.mjs` - Exports `errors`, a shared constant or state value used by sibling modules.
- `file-exists.mjs` - Exports `fileExists`, the main helper defined in this file.
- `forbidden-name-pattern.mjs` - Exports `forbiddenNamePattern`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `path-exists.mjs` - Exports `pathExists`, the main helper defined in this file.
- `repo-root.mjs` - Exports `repoRoot`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `schema-carrying-packages.mjs` - Exports `schemaCarryingPackages`, a shared constant or state value used by sibling modules.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 13 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
