# List AST Names

## 1. Directory Overview

This directory implements **List AST Names** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 11 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **collect-top-level-entries.mjs** - Exports `collectTopLevelEntries`, which collects top level entries.
- **describe-variable-declaration.mjs** - Exports `describeVariableDeclaration`, which describes variable declaration.
- **flatten-results.mjs** - Exports `flattenResults`, which flattens results.
- **format-flat.mjs** - Exports `formatFlat`, which formats flat.
- **format-grouped-file.mjs** - Exports `formatGroupedFile`, which formats grouped file.
- **group-by-file.mjs** - Exports `groupByFile`, which groups by file.
- **index.mjs** - Facade module that re-exports public members from `./parse-args.mjs`, `./is-exported-node.mjs`, `./describe-variable-declaration.mjs`, `./collect-top-level-entries.mjs`, `./flatten-results.mjs`, `./group-by-file.mjs`, and 3 more siblings.
- **is-exported-node.mjs** - Exports `isExportedNode`, which checks whether exported node.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **parse-args.mjs** - Exports `parseArgs`, which parses args.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node list-ast-names/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:path`, `node:process`
- **External packages/services referenced in immediate code** - `ts-morph`
- **Internal relative modules** - `../lib/ast-helpers.mjs`, `./collect-top-level-entries.mjs`, `./describe-variable-declaration.mjs`, `./flatten-results.mjs`, `./format-flat.mjs`, `./format-grouped-file.mjs`, `./group-by-file.mjs`, `./index.mjs`, `./is-exported-node.mjs`, `./parse-args.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
