# Agent Docs Check

## 1. Directory Overview

This directory implements **agent-docs-check** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 12 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **compare-sets.mjs** - Exports `compareSets`, which compares sets.
- **errors.mjs** - Exports `errors`, an initially empty array used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./repo-root.mjs`, `./errors.mjs`, `./resolve.mjs`, `./read.mjs`, `./parse-known-agent-types.mjs`, `./parse-markdown-table.mjs`, and 3 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **parse-known-agent-types.mjs** - Exports `parseKnownAgentTypes`, which parses known agent types.
- **parse-markdown-table.mjs** - Exports `parseMarkdownTable`, which parses markdown table.
- **read.mjs** - Exports `read`, which implements read.
- **repo-root.mjs** - Exports `repoRoot`, the repository-root path resolved from the current module location.
- **resolve.mjs** - Exports `resolve`, which implements resolve.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **sorted.mjs** - Exports `sorted`, which implements sorted.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, and subprocess execution.

## 4. Usage Instructions

```bash
node agent-docs-check/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs/promises`, `node:path`, `node:process`, `node:url`
- **Internal relative modules** - `../ops/lib/logger.mjs`, `./compare-sets.mjs`, `./errors.mjs`, `./index.mjs`, `./logger.mjs`, `./parse-known-agent-types.mjs`, `./parse-markdown-table.mjs`, `./read.mjs`, `./repo-root.mjs`, `./resolve.mjs`, `./sorted.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
