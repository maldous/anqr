# Recover Stale In Progress

## 1. Directory Overview

This directory contains the recover-stale-in-progress automation tool for the ANQR (Agentic Number
Query Runner) harness. The tool identifies and recovers Linear issues that are stuck in "In
Progress" state but have become stale due to expired leases or timeouts, allowing them to be picked
up by runners again. It currently contains 6 files and 0 subdirectories.

## 2. File Summaries

### Files

- **index.mjs** - Generated facade index that re-exports all public API members: `issueAge`, `minutesAgo`, and `main`.
- **issue-age.mjs** - Utility function that calculates the age of an issue in milliseconds. Takes an issue object and a field name (typically "updatedAt"), returning the difference between the current time and the specified timestamp.
- **logger.mjs** - Shared logger module that exports logging functions created from the central logger utility. Provides `logInfo`, `logWarn`, and `logError` functions for structured logging within this tool.
- **main.mjs** - Main orchestration module that implements the recovery logic. Imports queue control functions from symphony-state, Linear client functions, and local utilities. Supports `--dry-run` and `--force` flags. The main function:
- **minutes-ago.mjs** - Utility function that converts issue age from milliseconds to minutes. Imports `issueAge` from the sibling module and divides by 60,000 to return the age in whole minutes.
- **runtime.mjs** - Generated runtime carry-forward file that imports and executes the main function. Provides the CLI entry point for the tool.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/tools/recover-stale-in-progress/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
