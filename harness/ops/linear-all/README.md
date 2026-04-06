# ANQR Linear All

## 1. Directory Overview

This directory contains the Linear backlog issue exporter for the ANQR (Agentic Number Query Runner)
harness. It fetches all issues in "backlog" state from a Linear team and provides summary statistics
organized by project. The module uses the Linear GraphQL API with pagination to handle large numbers
of issues efficiently. It currently contains 9 files and 0 subdirectories.

## 2. File Summaries

### Files

- **api-key.mjs** - API key configuration. Exports `API_KEY` from the `LINEAR_API_KEY` environment variable, required for authenticating with the Linear API.
- **fetch-page.mjs** - Pagination handler. Exports `fetchPage(after)` function that makes POST requests to the Linear GraphQL API with the query and variables. Handles errors and returns the issues data with pagination info.
- **index.mjs** - Facade index. Re-exports all public API members from the sibling modules: `API_KEY`, `TEAM_ID`, `query`, `fetchPage`, `main`, and `isMain`.
- **is-main.mjs** - Entry point detection utility. Exports `isMain` which checks if the current module is the main entry point by comparing `process.argv[1]` against `fileURLToPath(import.meta.url)`.
- **logger.mjs** - Shared logging utility. Imports `createLogger` from `../lib/logger.mjs` and exports `logInfo` and `logError` functions for consistent logging throughout the module.
- **main.mjs** - Main orchestration logic. Exports an async `main()` function that iterates through all backlog issues using pagination, collects them into an array, prints progress for each page, and outputs a summary grouped by project. Saves the full data to `/tmp/linear-all-backlog.json`.
- **query.mjs** - GraphQL query definition. Contains a `query` constant that fetches backlog issues with pagination support. The query retrieves issue `id`, `identifier`, `team.name`, and `project.name` for each issue, along with `pageInfo` for cursor-based pagination.
- **runtime.mjs** - Runtime carry-forward. Entry point that checks for the `LINEAR_API_KEY` environment variable, validates it exists, and executes `main()` if running as the main module. Handles errors gracefully with logging.
- **team-id.mjs** - Team identifier configuration. Exports `TEAM_ID` from the `LINEAR_TEAM_ID` environment variable, with a default fallback to `"01534c1e-4041-474d-a81e-24f917f33912"`.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/linear-all/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
