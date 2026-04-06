# ANQR Linear Delete Sonar Issues

## 1. Directory Overview

This directory contains functionality to identify and delete Sonar-generated issues from Linear. It
is part of the Linear integrations layer in the ANQR (Agentic Number Query Runner) harness system.
The module scans all Linear issues across all states and removes issues with "[Sonar]" in their
title, helping to clean up stale or obsolete Sonar code quality tracking issues. It currently
contains 5 files and 0 subdirectories.

## 2. File Summaries

### Files

- **delete-issue.mjs** - Provides the `deleteIssue` function that executes a GraphQL mutation to delete a specific issue by ID. Uses the `query` helper from `../linear-client.mjs` to perform the `issueDelete` mutation. Throws an error if deletion fails and returns the success status on success.
- **index.mjs** - Auto-generated facade index that exports the public API surface: `deleteIssue` from `delete-issue.mjs` and `main` from `main.mjs`. This provides a clean public interface for importing the module's functionality.
- **logger.mjs** - Shared logging utility module that creates a module-specific logger using `createLogger` from the centralized `../../../lib/logger.mjs`. Exports `logInfo`, `logWarn`, and `logError` functions for consistent logging across the module.
- **main.mjs** - Main orchestration module that coordinates the entire deletion workflow. It fetches all issues across 8 states (Backlog, Todo, In Progress, In Review, Blocked, Human Review, Done, Canceled), filters for issues containing "[Sonar]" in the title, displays them for review, and then deletes each one with proper error handling. Reports summary statistics (deleted, failed, total counts) upon completion.
- **runtime.mjs** - Auto-generated runtime carry-forward that imports the main function from `./index.mjs` and executes it. This serves as the CLI entry point for running the module directly.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/delete-sonar-issues/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
