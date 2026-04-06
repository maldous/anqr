# List AST Names

## 1. Directory Overview

This directory contains a CLI tool that parses TypeScript and JavaScript files using ts-morph to
extract and list all top-level declarations. It provides visibility into the structure of source
code by identifying functions, classes, interfaces, type aliases, enums, modules, and variables
along with their export status. It currently contains 11 files and 0 subdirectories.

## 2. File Summaries

### Files

- **collect-top-level-entries.mjs** - Core AST collector. Uses ts-morph's SyntaxKind to identify and extract top-level declarations including functions, classes, interfaces, type aliases, enums, modules, and variable statements. Each entry includes kind, name, exported status, and line number.
- **describe-variable-declaration.mjs** - Variable descriptor. Analyzes variable initializers to determine their kind: arrow functions, class expressions, IIFEs, object literals, or plain variables. Uses helpers from `../lib/ast-helpers.mjs` to detect initializer types.
- **flatten-results.mjs** - Results flattening utility. Uses ts-morph to parse source files and normalizes paths using `../lib/ast-helpers.mjs`. Transforms raw AST entries into a standardized format with path, line, kind, name, and exported properties.
- **format-flat.mjs** - Flat result formatter. Outputs entries in the format: `path:line kind export/local name`. Uses padded formatting for alignment.
- **format-grouped-file.mjs** - Grouped file formatter. Groups results by file path with entries sorted by line number, displaying file path as header followed by indented entry details.
- **group-by-file.mjs** - Grouping utility. Groups items by file path using a Map, then converts to a sorted array of groups with path and entries properties. Sorts entries by line number then name, and groups by file path alphabetically.
- **index.mjs** - Facade module. Re-exports all public APIs from sibling modules including parseArgs, isExportedNode, describeVariableDeclaration, collectTopLevelEntries, flattenResults, groupByFile, formatFlat, formatGroupedFile, and main.
- **is-exported-node.mjs** - Export checker. Determines if a node is exported by checking for the `isExported()` method. Returns false if the method doesn't exist.
- **main.mjs** - Main entry point. Creates a ts-morph Project with TypeScript configuration, loads source files matching globs (defaults to DEFAULT_GLOBS if no paths provided), flattens results, and outputs in flat, grouped, or JSON format based on CLI options.
- **parse-args.mjs** - Command-line argument parser. Handles `--json` for JSON output, `--by-file` for grouping by file, and accepts file paths as arguments. Returns an options object with `json`, `byFile`, and `paths` properties.
- **runtime.mjs** - Runtime bootstrapper. Sets up EPIPE handler, imports and executes the main function, and handles errors by writing to stderr and setting exit code.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node list-ast-names/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.
- **Imported packages** - Representative external dependencies referenced here include `ts-morph`.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
