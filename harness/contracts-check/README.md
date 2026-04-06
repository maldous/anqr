# Contracts Check

## 1. Directory Overview

This directory contains validation tooling for the ANQR contracts package structure. It provides a
set of checks and utilities to ensure that all contracts packages within the `packages/contracts/`
workspace follow consistent structural conventions, naming patterns, and import rules. It currently
contains 13 files and 0 subdirectories.

## 2. File Summaries

### Files

- **allowed-schema-import-sources.mjs** - Regex that validates allowed runtime import sources for schema-carrying packages: zod, @ts-rest/core, tslib, or relative imports.
- **collect-files.mjs** - Recursive utility that collects all file paths within a directory tree.
- **contracts-root.mjs** - Constructs the contracts package root path by joining repoRoot with "packages/contracts".
- **errors.mjs** - Shared errors array for collecting validation failures during checks.
- **file-exists.mjs** - Async utility that checks if a file exists using `readFile`.
- **forbidden-name-pattern.mjs** - Regex pattern that forbids contract filenames from using runtime-oriented names: store, state, adapter, factory, helper, apply, patch, compat, workflow, service, import (case-insensitive).
- **index.mjs** - Generated facade index. Re-exports all public members from the module including `repoRoot`, `contractsRoot`, `forbiddenNamePattern`, `schemaCarryingPackages`, `allowedSchemaImportSources`, `errors`, path/file utilities, `collectFiles`, and `main`.
- **logger.mjs** - Shared logger for this module using the custom logger from `../ops/lib/logger.mjs`. Exports `logInfo` and `logError`.
- **main.mjs** - Core validation logic. Performs structural checks on all packages under `packages/contracts/`, including verifying README.md exists, src/ directory exists, package.json has correct type ("module"), sideEffects is false, exports["."] is defined, package naming follows `@anqr/contracts-<name>` pattern, contract files use .contract.ts extension, no .tsx files, no forbidden naming patterns, no default exports, type-only imports in non-schema packages, no runtime functions/classes, and more.
- **path-exists.mjs** - Async utility that checks if a directory path exists using `readdir`.
- **repo-root.mjs** - Utility to resolve the repository root path using `fileURLToPath` and `path.resolve`.
- **runtime.mjs** - Generated runtime carry-forward. Imports and executes the main function.
- **schema-carrying-packages.mjs** - Set containing package names that carry runtime schemas ("api" and "mcp"). These packages are allowed to import runtime values from allowed sources.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node contracts-check/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
