# AST Density Audit

## 1. Directory Overview

This directory contains tooling for auditing AST (Abstract Syntax Tree) density in TypeScript/JavaScript projects. The tool identifies source files with high concentrations of "heavy" AST nodes such as functions, classes, interfaces, and type declarations, helping developers understand code complexity and distribution across their codebase.

## 2. File Summaries

- **parse-args.mjs** - Command-line argument parser. Supports `--json` for JSON output, `--threshold <number>` to set minimum node count filter, and accepts file paths as positional arguments. Defaults to threshold of 1 if not specified.

- **format-entry.mjs** - Output formatter that groups AST nodes by their kind (e.g., function, class, interface) and formats results as: `{count} {path} {kind1:count, kind2:count, ...}`. Nodes are sorted alphabetically by kind within each entry.

- **default-threshold.mjs** - Exports `DEFAULT_THRESHOLD = 1`, used as the minimum node count threshold for filtering results.

- **runtime.mjs** - Generated runtime entry point. Sets up EPIPE signal handling (for safe pipe output), wraps main() in try-catch, writes errors to stderr, and sets exit code 1 on failure.

- **collect-heavy-nodes.mjs** - Core AST traversal logic. Iterates through top-level statements and collects heavy nodes including: functions, classes, interfaces, type aliases, enums, modules, and variable declarations with complex initializers (arrow functions, class expressions, IIFEs, object literals).

- **is-pure-type-declaration-file.mjs** - Filter predicate that identifies pure type declaration files (`.types.ts` files containing only interfaces and types). These files are excluded from results.

- **index.mjs** - Generated facade module that re-exports all public APIs: `DEFAULT_THRESHOLD`, `parseArgs`, `describeVariableDeclaration`, `collectHeavyNodes`, `isPureTypeDeclarationFile`, `formatEntry`, and `main`.

- **describe-variable-declaration.mjs** - Analyzes variable declarations and categorizes them by initializer type: arrow functions, class expressions, IIFEs (Immediately Invoked Function Expressions), and object literals. Returns null for simple value initializers.

- **main.mjs** - Main orchestration module. Creates a ts-morph Project, loads source files from globs or default patterns, collects heavy nodes per file, filters out pure type declaration files and files below threshold, sorts by count (descending) then path (ascending), outputs in text or JSON format, and exits with code 1 if any results found.

## 3. Overall Directory Function

This directory provides a code audit tool that analyzes TypeScript/JavaScript source files to identify files with high AST node density. The tool works by:

1. Loading a TypeScript project via ts-morph
2. Traversing source files and collecting "heavy" declarations (functions, classes, interfaces, types, enums, modules, complex variables)
3. Filtering out pure type declaration files (`.types.ts` with only interfaces/types)
4. Filtering by configurable threshold
5. Sorting results by density
6. Outputting in human-readable or JSON format

This helps teams identify areas of code that may need refactoring or modularization due to high structural complexity.

## 4. Usage Instructions

```bash
# Run with default settings (threshold=1, all source files)
node audit-ast-density/runtime.mjs

# Run with custom threshold
node audit-ast-density/runtime.mjs --threshold 5

# Output as JSON
node audit-ast-density/runtime.mjs --json

# Target specific paths
node audit-ast-density/runtime.mjs src/components src/utils

# Combine options
node audit-ast-density/runtime.mjs --threshold 3 --json src/
```

## 5. Dependencies

- **ts-morph** - TypeScript AST manipulation library used for parsing and traversing source files
- **Node.js** - Runtime environment (ESM modules)
- **tsconfig.json** - Required in the working directory for ts-morph to configure the project

## 6. Additional Comments

- The tool excludes `.types.ts` files that contain only interfaces and types, as these are typically declaration files with minimal runtime complexity
- Exit code 1 indicates files were found exceeding the threshold (useful for CI gates)
- The default glob patterns are inherited from `../lib/ast-helpers.mjs` (DEFAULT_GLOBS)
- Heavy nodes are defined as top-level declarations that typically contribute to code complexity: functions, classes, interfaces, type aliases, enums, modules, and variables with complex initializers
