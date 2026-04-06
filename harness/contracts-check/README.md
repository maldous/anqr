# Contracts Check

## 1. Directory Overview

This directory implements **Contracts Check** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 13 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **allowed-schema-import-sources.mjs** - Exports `allowedSchemaImportSources`, a regular-expression constant used for validation.
- **collect-files.mjs** - Exports `collectFiles`, which collects files.
- **contracts-root.mjs** - Exports `contractsRoot`, which implements contracts root.
- **errors.mjs** - Exports `errors`, an initially empty array used by sibling modules.
- **file-exists.mjs** - Exports `fileExists`, which implements file exists.
- **forbidden-name-pattern.mjs** - Exports `forbiddenNamePattern`, a regular-expression constant used for validation.
- **index.mjs** - Facade module that re-exports public members from `./repo-root.mjs`, `./contracts-root.mjs`, `./forbidden-name-pattern.mjs`, `./schema-carrying-packages.mjs`, `./allowed-schema-import-sources.mjs`, `./errors.mjs`, and 4 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **path-exists.mjs** - Exports `pathExists`, which implements path exists.
- **repo-root.mjs** - Exports `repoRoot`, the repository-root path resolved from the current module location.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **schema-carrying-packages.mjs** - Exports `schemaCarryingPackages`, a shared `Set` constant used by this module group.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory use file-system access.

## 4. Usage Instructions

```bash
node contracts-check/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs/promises`, `node:path`, `node:process`, `node:url`
- **Internal relative modules** - `../ops/lib/logger.mjs`, `./allowed-schema-import-sources.mjs`, `./collect-files.mjs`, `./contracts-root.mjs`, `./errors.mjs`, `./file-exists.mjs`, `./forbidden-name-pattern.mjs`, `./index.mjs`, `./logger.mjs`, `./path-exists.mjs`, `./repo-root.mjs`, `./schema-carrying-packages.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
