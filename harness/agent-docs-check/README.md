# agent-docs-check

## 1. Directory Overview

This directory contains a documentation consistency checker that validates agent type definitions are synchronized across three key documentation files in the ANQR repository: `tools.types.ts` (source of truth), `SPAWN_AGENTS_GUIDE.md`, and `AGENTS.md`. It ensures that all agent names, required parameters, and documentation tables remain consistent and free of stale references.

## 2. File Summaries

- **index.mjs** — Generated facade index that re-exports all public modules: `repoRoot`, `errors`, `resolve`, `read`, `parseKnownAgentTypes`, `parseMarkdownTable`, `sorted`, `compareSets`, and `main`.

- **runtime.mjs** — Generated runtime carry-forward entry point. Imports and immediately invokes `main()` from `./index.mjs` using top-level `await`.

- **main.mjs** — Core orchestration logic. Reads three documentation files (`tools.types.ts`, `SPAWN_AGENTS_GUIDE.md`, `AGENTS.md`), parses agent lists from each, cross-compares them for consistency using `tools.types.ts` as the source of truth, checks that basher `params.command` is documented as required, and scans for stale agent names (e.g. `code-reviewer-lite`). Reports errors and sets a non-zero exit code on failure.

- **errors.mjs** — Exports a shared mutable `errors` array used throughout the module to collect validation error messages.

- **logger.mjs** — Shared logger that wraps `createLogger()` from `../ops/lib/logger.mjs` and exports `logInfo` and `logError` helpers.

- **repo-root.mjs** — Computes and exports `repoRoot`, the absolute path to the repository root, derived from the current file's location (two directories up).

- **resolve.mjs** — Exports a `resolve(rel)` function that joins a relative path against `repoRoot` using `path.join`.

- **read.mjs** — Exports an async `read(rel)` function that reads a file relative to the repo root. On failure, pushes an error message to the shared `errors` array and returns an empty string.

- **parse-known-agent-types.mjs** — Exports `parseKnownAgentTypes(content)` which extracts agent names from the `KnownAgentType` TypeScript union type using regex matching. Returns a `Set` of agent name strings.

- **parse-markdown-table.mjs** — Exports `parseMarkdownTable(content, label)` which parses agent names from Markdown table rows (matching backtick-quoted names in pipe-delimited columns). Supports slash-separated aliases. Returns a `Set` of agent names.

- **compare-sets.mjs** — Exports `compareSets(source, sourceLabel, target, targetLabel)` which cross-checks two sets and records missing or extra entries as errors in the shared `errors` array.

- **sorted.mjs** — Exports `sorted(set)`, a small utility that spreads a `Set` into a sorted array.

## 3. Overall Directory Function

The files form a validation pipeline that ensures agent documentation stays in sync across the repository:

1. **read.mjs** and **resolve.mjs** handle file I/O relative to the repo root.
2. **parse-known-agent-types.mjs** and **parse-markdown-table.mjs** extract agent names from TypeScript source and Markdown tables respectively.
3. **compare-sets.mjs** performs bidirectional set comparison to detect drift.
4. **main.mjs** orchestrates the full check: read → parse → compare → report.
5. **errors.mjs** acts as a shared error accumulator across all modules.
6. **runtime.mjs** provides the executable entry point.

This directory plays a CI/governance role in the larger ANQR project, preventing documentation drift that could cause agent spawning failures or developer confusion.

## 4. Usage Instructions

Run the checker via the runtime entry point:

```bash
node agent-docs-check/runtime.mjs
```

Or use the facade module:

```bash
node -e "import('./agent-docs-check.mjs').then(m => m.main())"
```

The script exits with code `1` if any inconsistencies are found, making it suitable for CI pipelines. On success, it logs the number of consistent agent types across all three documentation files.

## 5. Dependencies

- **Node.js** (ES modules with top-level `await` support)
- **`node:fs/promises`** — For file reading (`readFile`)
- **`node:path`** — For path resolution
- **`node:url`** — For `import.meta.url` handling
- **`node:process`** — For setting exit codes
- **`../ops/lib/logger.mjs`** — Shared ANQR harness logger (`createLogger`)

### Required Repository Files (checked at runtime)

- `.agents/types/tools.types.ts` — Source of truth for `KnownAgentType`
- `.agents/SPAWN_AGENTS_GUIDE.md` — Agent spawning guide with params table
- `AGENTS.md` — Top-level agent documentation with agent types table

## 6. Additional Comments

- `tools.types.ts` is treated as the single source of truth; discrepancies in the other two files are reported as errors against them.
- The stale-name check currently flags `code-reviewer-lite` and `code_reviewer_lite` as deprecated agent names that should no longer appear in any documentation.
- The module follows the ANQR facade decomposition pattern where `index.mjs` re-exports all members and `runtime.mjs` serves as the executable entry point.
- The shared mutable `errors` array pattern means modules are stateful — the array accumulates across the entire run and is not reset between calls.
