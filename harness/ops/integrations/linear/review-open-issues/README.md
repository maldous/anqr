# ANQR Linear Review Open Issues

## 1. Directory Overview

This directory contains automation for reviewing open Linear issues and providing recommendations
for issue resolution. The module analyzes open issues to identify those that can likely be resolved,
detecting conditions such as files no longer existing in the repository, harness checks that have
become passing, stale issues, missing labels, and potential duplicates. It currently contains 15
files and 0 subdirectories.

## 2. File Summaries

### Files

- **dirname.mjs** - ESM-compatible `__dirname` polyfill using fileURLToPath.
- **exec-async.mjs** - Promisified version of child_process.exec for async command execution.
- **extract-check-name.mjs** - Extracts harness check name from issue description using regex pattern `\*\*Check:\*\* \`([^\`]+)\``.
- **extract-sonar-dup-key.mjs** - Extracts Sonar duplicate key from issue description using regex pattern `<!-- sonar-dup-key:([a-f0-9-]+) -->`.
- **extract-sonar-key.mjs** - Extracts Sonar issue key from issue description using regex pattern `<!-- sonar-key:([a-f0-9-]+) -->`.
- **file-exists-in-git.mjs** - Uses `git ls-files --error-unmatched` to verify if a file path exists in the repository.
- **get-harness-status.mjs** - Reads the harness report from `reports/latest.json` and returns a Set of failing check names.
- **index.mjs** - Facade that re-exports all public API members from sibling modules, including utility functions and the main entry point.
- **is-stale.mjs** - Determines if an issue is stale by comparing its creation date against STALE_DAYS threshold.
- **logger.mjs** - Shared logger module re-exporting logInfo and logError from the project's logger library.
- **main.mjs** - Core orchestration module that fetches open issues, analyzes them against harness status, and categorizes recommendations into: canResolve, needsUpdate, stale, needsLabels, and duplicate. Outputs detailed analysis results with issue identifiers, reasons, and confidence levels.
- **open-states.mjs** - Defines OPEN_STATES array containing the Linear states considered "open" for analysis: Backlog, Todo, In Progress, In Review, Blocked, and Human Review.
- **root.mjs** - Exports ROOT constant pointing to the project root directory.
- **runtime.mjs** - Runtime carry-forward that imports and executes the main function via `await main()`.
- **stale-days.mjs** - Exports STALE_DAYS constant (30) for stale issue threshold.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/review-open-issues/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
