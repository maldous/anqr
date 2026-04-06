# List AST Names

## 1. Directory Overview

This directory contains a CLI tool that parses TypeScript and JavaScript files using ts-morph to extract and list all top-level declarations. It provides visibility into the structure of source code by identifying functions, classes, interfaces, type aliases, enums, modules, and variables along with their export status.

## 2. File Summaries

- **parse-args.mjs** - Command-line argument parser. Handles `--json` for JSON output, `--by-file` for grouping by file, and accepts file paths as arguments. Returns an options object with `json`, `byFile`, and `paths` properties.

- **format-flat.mjs** - Flat result formatter. Outputs entries in the format: `path:line  kind  export/local  name`. Uses padded formatting for alignment.

- **format-grouped-file.mjs** - Grouped file formatter. Groups results by file path with entries sorted by line number, displaying file path as header followed by indented entry details.

- **flatten-results.mjs** - Results flattening utility. Uses ts-morph to parse source files and normalizes paths using `../lib/ast-helpers.mjs`. Transforms raw AST entries into a standardized format with path, line, kind, name, and exported properties.

- **runtime.mjs** - Runtime bootstrapper. Sets up EPIPE handler, imports and executes the main function, and handles errors by writing to stderr and setting exit code.

- **collect-top-level-entries.mjs** - Core AST collector. Uses ts-morph's SyntaxKind to identify and extract top-level declarations including functions, classes, interfaces, type aliases, enums, modules, and variable statements. Each entry includes kind, name, exported status, and line number.

- **is-exported-node.mjs** - Export checker. Determines if a node is exported by checking for the `isExported()` method. Returns false if the method doesn't exist.

- **index.mjs** - Facade module. Re-exports all public APIs from sibling modules including parseArgs, isExportedNode, describeVariableDeclaration, collectTopLevelEntries, flattenResults, groupByFile, formatFlat, formatGroupedFile, and main.

- **group-by-file.mjs** - Grouping utility. Groups items by file path using a Map, then converts to a sorted array of groups with path and entries properties. Sorts entries by line number then name, and groups by file path alphabetically.

- **describe-variable-declaration.mjs** - Variable descriptor. Analyzes variable initializers to determine their kind: arrow functions, class expressions, IIFEs, object literals, or plain variables. Uses helpers from `../lib/ast-helpers.mjs` to detect initializer types.

- **main.mjs** - Main entry point. Creates a ts-morph Project with TypeScript configuration, loads source files matching globs (defaults to DEFAULT_GLOBS if no paths provided), flattens results, and outputs in flat, grouped, or JSON format based on CLI options.

## 3. Overall Directory Function

This directory provides a code analysis utility that helps developers understand the structure of their TypeScript/JavaScript codebases. By extracting top-level declarations, it enables visibility into what functions, classes, types, and other symbols are defined and which are exported for external use.

The tool works by:

1. Parsing command-line arguments to determine output format and target files
2. Creating a ts-morph Project that loads source files
3. Walking each source file's AST to identify top-level statements
4. Collecting metadata (name, kind, line number, export status) for each declaration
5. Formatting and outputting the results in the requested format

This is useful for code auditing, understanding module exports, identifying API surfaces, and generating documentation about code structure.

## 4. Usage Instructions

```bash
# Run with default glob patterns (from lib/ast-helpers.mjs)
node list-ast-names/runtime.mjs

# List specific files or directories
node list-ast-names/runtime.mjs src/components

# Output grouped by file
node list-ast-names/runtime.mjs --by-file src

# Output as JSON
node list-ast-names/runtime.mjs --json src

# JSON output grouped by file
node list-ast-names/runtime.mjs --json --by-file src

# Combine with other shell tools
node list-ast-names/runtime.mjs src | grep export
```

### Command-line Options

- `--json` - Output results as JSON instead of human-readable format
- `--by-file` - Group results by file path
- `paths...` - One or more file or directory paths to analyze (optional, defaults to DEFAULT_GLOBS)

## 5. Dependencies

- **ts-morph** - TypeScript AST manipulation library for parsing source files and extracting declarations
- **../lib/ast-helpers.mjs** - Shared utilities including normalizePath, DEFAULT_GLOBS, and initializer type detection functions (isFunctionLikeInitializer, isClassLikeInitializer, isObjectLikeInitializer, isIifeInitializer)
- **tsconfig.json** - Required in the working directory for ts-morph to configure the project

## 6. Additional Comments

- The tool uses ts-morph's SyntaxKind enum to identify different declaration types
- Variable declarations are further classified by their initializer type (arrow function, class expression, IIFE, object literal)
- The JSON output format differs based on `--by-file`: without it, returns a flat array; with it, returns an array of grouped objects
- Entry sorting is deterministic: by path, then line number, then kind, then name
- The runtime.mjs file provides a convenient entry point with built-in error handling for script usage
