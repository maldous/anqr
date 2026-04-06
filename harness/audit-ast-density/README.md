# AST Density Audit

## 1. Directory Overview

This directory contains tooling for auditing AST (Abstract Syntax Tree) density in
TypeScript/JavaScript projects. The tool identifies source files with high concentrations of "heavy"
AST nodes such as functions, classes, interfaces, and type declarations, helping developers
understand code complexity and distribution across their codebase. It currently contains 9 files and
0 subdirectories.

## 2. File Summaries

### Files

- **collect-heavy-nodes.mjs** - Core AST traversal logic. Iterates through top-level statements and collects heavy nodes including: functions, classes, interfaces, type aliases, enums, modules, and variable declarations with complex initializers (arrow functions, class expressions, IIFEs, object literals).
- **default-threshold.mjs** - Exports `DEFAULT_THRESHOLD = 1`, used as the minimum node count threshold for filtering results.
- **describe-variable-declaration.mjs** - Analyzes variable declarations and categorizes them by initializer type: arrow functions, class expressions, IIFEs (Immediately Invoked Function Expressions), and object literals. Returns null for simple value initializers.
- **format-entry.mjs** - Output formatter that groups AST nodes by their kind (e.g., function, class, interface) and formats results as: `{count} {path} {kind1:count, kind2:count, ...}`. Nodes are sorted alphabetically by kind within each entry.
- **index.mjs** - Generated facade module that re-exports all public APIs: `DEFAULT_THRESHOLD`, `parseArgs`, `describeVariableDeclaration`, `collectHeavyNodes`, `isPureTypeDeclarationFile`, `formatEntry`, and `main`.
- **is-pure-type-declaration-file.mjs** - Filter predicate that identifies pure type declaration files (`.types.ts` files containing only interfaces and types). These files are excluded from results.
- **main.mjs** - Main orchestration module. Creates a ts-morph Project, loads source files from globs or default patterns, collects heavy nodes per file, filters out pure type declaration files and files below threshold, sorts by count (descending) then path (ascending), outputs in text or JSON format, and exits with code 1 if any results found.
- **parse-args.mjs** - Command-line argument parser. Supports `--json` for JSON output, `--threshold <number>` to set minimum node count filter, and accepts file paths as positional arguments. Defaults to threshold of 1 if not specified.
- **runtime.mjs** - Generated runtime entry point. Sets up EPIPE signal handling (for safe pipe output), wraps main() in try-catch, writes errors to stderr, and sets exit code 1 on failure.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node audit-ast-density/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.
- **Imported packages** - Representative external dependencies referenced here include `ts-morph`.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
