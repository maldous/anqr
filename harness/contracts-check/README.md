# Contracts Check

## 1. Directory Overview

This directory contains validation tooling for the ANQR contracts package structure. It provides a set of checks and utilities to ensure that all contracts packages within the `packages/contracts/` workspace follow consistent structural conventions, naming patterns, and import rules.

## 2. File Summaries

- **index.mjs** - Generated facade index. Re-exports all public members from the module including `repoRoot`, `contractsRoot`, `forbiddenNamePattern`, `schemaCarryingPackages`, `allowedSchemaImportSources`, `errors`, path/file utilities, `collectFiles`, and `main`.

- **main.mjs** - Core validation logic. Performs structural checks on all packages under `packages/contracts/`, including verifying README.md exists, src/ directory exists, package.json has correct type ("module"), sideEffects is false, exports["."] is defined, package naming follows `@anqr/contracts-<name>` pattern, contract files use .contract.ts extension, no .tsx files, no forbidden naming patterns, no default exports, type-only imports in non-schema packages, no runtime functions/classes, and more.

- **runtime.mjs** - Generated runtime carry-forward. Imports and executes the main function.

- **repo-root.mjs** - Utility to resolve the repository root path using `fileURLToPath` and `path.resolve`.

- **contracts-root.mjs** - Constructs the contracts package root path by joining repoRoot with "packages/contracts".

- **forbidden-name-pattern.mjs** - Regex pattern that forbids contract filenames from using runtime-oriented names: store, state, adapter, factory, helper, apply, patch, compat, workflow, service, import (case-insensitive).

- **schema-carrying-packages.mjs** - Set containing package names that carry runtime schemas ("api" and "mcp"). These packages are allowed to import runtime values from allowed sources.

- **allowed-schema-import-sources.mjs** - Regex that validates allowed runtime import sources for schema-carrying packages: zod, @ts-rest/core, tslib, or relative imports.

- **errors.mjs** - Shared errors array for collecting validation failures during checks.

- **logger.mjs** - Shared logger for this module using the custom logger from `../ops/lib/logger.mjs`. Exports `logInfo` and `logError`.

- **path-exists.mjs** - Async utility that checks if a directory path exists using `readdir`.

- **file-exists.mjs** - Async utility that checks if a file exists using `readFile`.

- **collect-files.mjs** - Recursive utility that collects all file paths within a directory tree.

## 3. Overall Directory Function

This directory serves as a validation and enforcement layer for the contracts package workspace. It ensures that all contract packages follow consistent patterns:

- **Structural consistency**: Each contract package must have a README.md, src/ directory, and src/index.ts
- **Package.json conventions**: Type must be "module", sideEffects must be false, exports["."] must be defined, naming must follow `@anqr/contracts-<name>` format
- **File naming conventions**: Contract files must end with .contract.ts (except index.ts), no .tsx allowed, no runtime-oriented names
- **Import discipline**: Non-schema packages must use type-only imports; schema-carrying packages may only import runtime values from zod, @ts-rest/core, tslib, or relative paths
- **Export restrictions**: No default exports, no helper functions, no classes, only const exports in schema-carrying packages

The `main.mjs` is the entry point that scans all packages in `packages/contracts/` and validates them against these rules, collecting errors and exiting with code 1 if any violations are found.

## 4. Usage Instructions

```bash
node contracts-check/runtime.mjs
```

Or via the facade:

```bash
node contracts-check/index.mjs
```

The tool will skip validation if `packages/contracts/` does not exist yet or contains no workspace packages. On success, it logs the number of validated packages. On failure, it exits with code 1 and prints all validation errors.

## 5. Dependencies

- **Node.js** - Runtime environment
- **../ops/lib/logger.mjs** - Custom logger module (shared dependency)

No external npm packages required.

## 6. Additional Comments

- This is an auto-generated facade module structure where index.mjs and runtime.mjs are generated files that re-export from the actual implementation files
- The tool is designed to run early in the development workflow to catch contract structural issues before they propagate
- Schema-carrying packages ("api" and "mcp") have relaxed import rules compared to pure type-only contract packages
- The forbidden name pattern enforces noun-oriented contract naming to maintain conceptual clarity between contracts (data definitions) and runtime code (services, adapters, etc.)
