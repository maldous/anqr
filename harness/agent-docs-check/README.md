# agent-docs-check

## 1. Directory Overview

This directory contains a documentation consistency checker that validates agent type definitions
are synchronized across three key documentation files in the ANQR repository: `tools.types.ts`
(source of truth), `SPAWN_AGENTS_GUIDE.md`, and `AGENTS.md`. It ensures that all agent names,
required parameters, and documentation tables remain consistent and free of stale references. It
currently contains 12 files and 0 subdirectories.

## 2. File Summaries

### Files

- **compare-sets.mjs** - Exports `compareSets(source, sourceLabel, target, targetLabel)` which cross-checks two sets and records missing or extra entries as errors in the shared `errors` array.
- **errors.mjs** - Exports a shared mutable `errors` array used throughout the module to collect validation error messages.
- **index.mjs** - Generated facade index that re-exports all public modules: `repoRoot`, `errors`, `resolve`, `read`, `parseKnownAgentTypes`, `parseMarkdownTable`, `sorted`, `compareSets`, and `main`.
- **logger.mjs** - Shared logger that wraps `createLogger()` from `../ops/lib/logger.mjs` and exports `logInfo` and `logError` helpers.
- **main.mjs** - Core orchestration logic. Reads three documentation files (`tools.types.ts`, `SPAWN_AGENTS_GUIDE.md`, `AGENTS.md`), parses agent lists from each, cross-compares them for consistency using `tools.types.ts` as the source of truth, checks that basher `params.command` is documented as required, and scans for stale agent names (e.g. `code-reviewer-lite`). Reports errors and sets a non-zero exit code on failure.
- **parse-known-agent-types.mjs** - Exports `parseKnownAgentTypes(content)` which extracts agent names from the `KnownAgentType` TypeScript union type using regex matching. Returns a `Set` of agent name strings.
- **parse-markdown-table.mjs** - Exports `parseMarkdownTable(content, label)` which parses agent names from Markdown table rows (matching backtick-quoted names in pipe-delimited columns). Supports slash-separated aliases. Returns a `Set` of agent names.
- **read.mjs** - Exports an async `read(rel)` function that reads a file relative to the repo root. On failure, pushes an error message to the shared `errors` array and returns an empty string.
- **repo-root.mjs** - Computes and exports `repoRoot`, the absolute path to the repository root, derived from the current file's location (two directories up).
- **resolve.mjs** - Exports a `resolve(rel)` function that joins a relative path against `repoRoot` using `path.join`.
- **runtime.mjs** - Generated runtime carry-forward entry point. Imports and immediately invokes `main()` from `./index.mjs` using top-level `await`.
- **sorted.mjs** - Exports `sorted(set)`, a small utility that spreads a `Set` into a sorted array.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node agent-docs-check/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
