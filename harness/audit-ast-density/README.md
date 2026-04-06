# AST Density Audit

## 1. Directory Overview

This directory implements **AST Density Audit** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 9 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **collect-heavy-nodes.mjs** - Exports `collectHeavyNodes`, which collects heavy nodes.
- **default-threshold.mjs** - Exports `DEFAULT_THRESHOLD`, a shared constant used by sibling modules.
- **describe-variable-declaration.mjs** - Exports `describeVariableDeclaration`, which describes variable declaration.
- **format-entry.mjs** - Exports `formatEntry`, which formats entry.
- **index.mjs** - Facade module that re-exports public members from `./default-threshold.mjs`, `./parse-args.mjs`, `./describe-variable-declaration.mjs`, `./collect-heavy-nodes.mjs`, `./is-pure-type-declaration-file.mjs`, `./format-entry.mjs`, and 1 more siblings.
- **is-pure-type-declaration-file.mjs** - Exports `isPureTypeDeclarationFile`, which checks whether pure type declaration file.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **parse-args.mjs** - Exports `parseArgs`, which parses args.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node audit-ast-density/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:path`, `node:process`
- **External packages/services referenced in immediate code** - `ts-morph`
- **Internal relative modules** - `../lib/ast-helpers.mjs`, `./collect-heavy-nodes.mjs`, `./default-threshold.mjs`, `./describe-variable-declaration.mjs`, `./format-entry.mjs`, `./index.mjs`, `./is-pure-type-declaration-file.mjs`, `./parse-args.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
