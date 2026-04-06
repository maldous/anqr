# Rename to Standards

## 1. Directory Overview

This directory contains a command-line tool for renaming files to follow consistent naming
conventions. The tool analyzes code files, detects naming violations (such as PascalCase file names
that should be kebab-case), and can either preview proposed changes or automatically apply them
while updating all import references accordingly. It currently contains 32 files and 0
subdirectories.

## 2. File Summaries

### Files

- **apply-plan.mjs** - Applies the rename plan: updates import references in all files, then moves files to their new locations.
- **build-plan.mjs** - Builds a rename plan by analyzing all provided files and collecting suggestions.
- **choose-primary-entry.mjs** - Selects the primary entry point from top-level entries, preferring exported named declarations.
- **code-extensions.mjs** - Defines the set of code file extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.d.ts`.
- **collect-module-specifiers.mjs** - Collects all import and export specifiers from a source file for later rewriting.
- **create-source-file.mjs** - Creates a TypeScript SourceFile AST node from file content.
- **default-dirs.mjs** - Specifies default directories to scan: `["src", "netlify", "tests"]`.
- **detect-suggestion.mjs** - Analyzes a file and suggests a rename based on naming violations (legacy type suffixes, PascalCase names, etc.). Returns null if no rename is needed.
- **ensure-dot.mjs** - Module that ensures dot. Exports `ensureDot`.
- **get-declaration-name.mjs** - Extracts the name from a declaration node.
- **get-top-level-entries.mjs** - Extracts all top-level declarations (functions, classes, interfaces, type aliases, enums, variables) with their kind, name, and export status.
- **has-jsx.mjs** - Checks if a source file contains JSX elements.
- **index.mjs** - Generated facade that exports all public APIs from the module for external consumption.
- **is-code-file.mjs** - Determines if a file is a code file based on extension (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.d.ts`) or test file patterns (`.spec.ts`, `.test.ts`).
- **is-exported.mjs** - Checks if a declaration has an export modifier.
- **is-type-only-file.mjs** - Checks if all statements in a file are type-only.
- **is-type-only-statement.mjs** - Determines if a statement is type-only (imports, exports, interfaces, type aliases, enums, empty statements).
- **main.mjs** - Main entry point that orchestrates the full workflow: parse args, walk directories, build plan, partition collisions, and either preview or apply changes.
- **normalize.mjs** - Normalizes path separators, converting backslashes to forward slashes for cross-platform compatibility.
- **parse-args.mjs** - Parses command-line arguments: `--apply` to execute renames, `--json` for JSON output, `--root` for custom root directory, `--dirs` for custom directories.
- **partition-collisions.mjs** - Partitions the plan into accepted renames and skipped collisions (when multiple files would rename to the same target).
- **rel.mjs** - Computes the relative path between a root directory and a file path, using normalize.
- **replace-ext.mjs** - Replaces a file's extension while preserving the rest of the path.
- **require.mjs** - Creates a `require` function using Node's `createRequire` to import TypeScript as a module.
- **rewrite-specifier.mjs** - Rewrites import/export specifiers to point to new file locations, handling both `@/` aliases and relative paths.
- **rewrite-text-at-spans.mjs** - Applies multiple text edits to a string, processing from end to start to preserve span positions.
- **script-kind-for.mjs** - Determines the TypeScript script kind (TS, TSX, JS, JSX) based on file extension.
- **should-skip.mjs** - Checks if a file should be skipped during traversal (excludes `node_modules`, `.git`, `dist`, `coverage`, and i18n/content directories).
- **strip-code-extension.mjs** - Removes code file extensions (`.d.ts`, `.tsx`, `.ts`, `.jsx`, `.js`, `.mjs`, `.cjs`) from a filename.
- **to-kebab.mjs** - Converts strings to kebab-case by handling camelCase, PascalCase, and various separators.
- **ts.mjs** - Exports the TypeScript library instance for use across the toolkit.
- **walk.mjs** - Recursively walks a directory tree collecting all code files, skipping excluded paths.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node rename-to-standards/main.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
