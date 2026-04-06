# export-linear-all

## 1. Directory Overview

This directory contains tooling to fetch and export all Linear issues for a specific team to a JSON
file. It provides a simple interface to retrieve complete issue data including comments, labels, and
state information from the Linear API. It currently contains 3 files and 0 subdirectories.

## 2. File Summaries

### Files

- **fetch-all-issues.mjs** - Exports the `fetchAllIssues()` function which performs paginated GraphQL queries to retrieve all issues from the configured Linear team. The function:
- **index.mjs** - Generated facade index that re-exports `fetchAllIssues` from `./fetch-all-issues.mjs` and `main` from `./main.mjs`. Provides the public API for this module.
- **main.mjs** - Main entry point that orchestrates the full export workflow:

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node export-linear-all/main.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
