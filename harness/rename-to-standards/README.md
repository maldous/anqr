# Rename to Standards

## 1. Directory Overview

This directory contains a command-line tool for renaming files to follow consistent naming conventions. The tool analyzes code files, detects naming violations (such as PascalCase file names that should be kebab-case), and can either preview proposed changes or automatically apply them while updating all import references accordingly.

## 2. File Summaries

### Core Utilities

- **require.mjs** - Creates a `require` function using Node's `createRequire` to import TypeScript as a module.
- **ts.mjs** - Exports the TypeScript library instance for use across the toolkit.
- **normalize.mjs** - Normalizes path separators, converting backslashes to forward slashes for cross-platform compatibility.
- **rel.mjs** - Computes the relative path between a root directory and a file path, using normalize.
- **ensureDot.mjs** - Ensures a path string starts with `./` if it doesn't already.

### File Detection and Filtering

- **is-code-file.mjs** - Determines if a file is a code file based on extension (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.d.ts`) or test file patterns (`.spec.ts`, `.test.ts`).
- **should-skip.mjs** - Checks if a file should be skipped during traversal (excludes `node_modules`, `.git`, `dist`, `coverage`, and i18n/content directories).
- **code-extensions.mjs** - Defines the set of code file extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.d.ts`.
- **default-dirs.mjs** - Specifies default directories to scan: `["src", "netlify", "tests"]`.
- **walk.mjs** - Recursively walks a directory tree collecting all code files, skipping excluded paths.

### TypeScript Analysis

- **script-kind-for.mjs** - Determines the TypeScript script kind (TS, TSX, JS, JSX) based on file extension.
- **create-source-file.mjs** - Creates a TypeScript SourceFile AST node from file content.
- **get-declaration-name.mjs** - Extracts the name from a declaration node.
- **is-exported.mjs** - Checks if a declaration has an export modifier.
- **get-top-level-entries.mjs** - Extracts all top-level declarations (functions, classes, interfaces, type aliases, enums, variables) with their kind, name, and export status.
- **collect-module-specifiers.mjs** - Collects all import and export specifiers from a source file for later rewriting.
- **has-jsx.mjs** - Checks if a source file contains JSX elements.
- **is-type-only-statement.mjs** - Determines if a statement is type-only (imports, exports, interfaces, type aliases, enums, empty statements).
- **is-type-only-file.mjs** - Checks if all statements in a file are type-only.

### Naming Conversion

- **to-kebab.mjs** - Converts strings to kebab-case by handling camelCase, PascalCase, and various separators.
- **strip-code-extension.mjs** - Removes code file extensions (`.d.ts`, `.tsx`, `.ts`, `.jsx`, `.js`, `.mjs`, `.cjs`) from a filename.
- **replace-ext.mjs** - Replaces a file's extension while preserving the rest of the path.

### Suggestion and Planning

- **choose-primary-entry.mjs** - Selects the primary entry point from top-level entries, preferring exported named declarations.
- **detect-suggestion.mjs** - Analyzes a file and suggests a rename based on naming violations (legacy type suffixes, PascalCase names, etc.). Returns null if no rename is needed.
- **build-plan.mjs** - Builds a rename plan by analyzing all provided files and collecting suggestions.
- **partition-collisions.mjs** - Partitions the plan into accepted renames and skipped collisions (when multiple files would rename to the same target).

### Rewriting

- **rewrite-text-at-spans.mjs** - Applies multiple text edits to a string, processing from end to start to preserve span positions.
- **rewrite-specifier.mjs** - Rewrites import/export specifiers to point to new file locations, handling both `@/` aliases and relative paths.

### Execution

- **apply-plan.mjs** - Applies the rename plan: updates import references in all files, then moves files to their new locations.

### CLI Interface

- **parse-args.mjs** - Parses command-line arguments: `--apply` to execute renames, `--json` for JSON output, `--root` for custom root directory, `--dirs` for custom directories.
- **main.mjs** - Main entry point that orchestrates the full workflow: parse args, walk directories, build plan, partition collisions, and either preview or apply changes.

### Facade

- **index.mjs** - Generated facade that exports all public APIs from the module for external consumption.

## 3. Overall Directory Function

This directory provides a complete file renaming toolkit that enforces consistent naming standards across a codebase. The tool works in several stages:

1. **Discovery**: Walks specified directories to find all code files, filtering out test files, dependencies, and generated content.
2. **Analysis**: Parses each file using TypeScript to extract top-level declarations and determine if the filename matches the exported symbols.
3. **Suggestion**: Detects naming violations such as:
   - Legacy `.type`, `.interface`, `.props`, `.state` suffixes on type-only files
   - PascalCase file names that should be kebab-case
   - Files with `-fn-`, `-type-`, or `-interface-` markers
4. **Planning**: Builds a rename plan and handles collisions where multiple files would map to the same target name.
5. **Execution**: Either previews the proposed changes or applies them, updating all import/export references throughout the codebase.

The tool is designed to be safe - it updates all internal references before moving files, ensuring the codebase remains functional after renaming.

## 4. Usage Instructions

### Command-Line Usage

```bash
# Preview renames (default)
node rename-to-standards/main.mjs

# Preview with JSON output
node rename-to-standards/main.mjs --json

# Apply renames to filesystem
node rename-to-standards/main.mjs --apply

# Specify custom root directory
node rename-to-standards/main.mjs --root /path/to/project

# Specify custom directories to scan
node rename-to-standards/main.mjs --dirs src,lib,tests
```

### Programmatic Usage

```javascript
import { main } from "./rename-to-standards/index.mjs";

// Run the CLI
main();
```

### Available APIs

```javascript
import {
  walk,
  buildPlan,
  partitionCollisions,
  applyPlan,
  detectSuggestion,
  parseArgs,
} from "./rename-to-standards/index.mjs";
```

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules require Node.js with ESM support
- **TypeScript** - Required as a runtime dependency for AST parsing (`npm install typescript`)

### Internal Dependencies

All modules are internal to this directory and depend on each other through the facade index.mjs.

## 6. Additional Comments

- **Safety First**: The tool updates all import/export specifiers before moving files, preventing broken references.
- **Collision Handling**: When multiple files would rename to the same target, all conflicting renames are skipped to prevent data loss.
- **Legacy Detection**: The tool recognizes common legacy naming patterns (`.types.ts`, `MyComponent.tsx` -> `my-component.tsx`) and suggests modern equivalents.
- **Test File Handling**: The tool distinguishes between source files and test files (`.spec.ts`, `.test.ts`) when analyzing naming.
- **Cross-Platform**: Path normalization ensures the tool works on Windows, macOS, and Linux.
- **Facade Pattern**: The index.mjs file serves as a generated facade that re-exports all public APIs for clean external imports.