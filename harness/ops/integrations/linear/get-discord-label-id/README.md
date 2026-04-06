# ANQR Linear - Get Discord Label ID

## 1. Directory Overview

This directory contains a utility module for the ANQR (Agentic Number Query Runner) harness that
manages Discord label identification in the Linear workspace. It provides functionality to search
for an existing Discord label or create one if it doesn't exist, then outputs the label ID for use
in system configuration. It currently contains 6 files and 0 subdirectories.

## 2. File Summaries

### Files

- **create-discord-label.mjs** - Creates a new label named "source:discord" with the description "Issue created from Discord via OpenClaw Gateway" and Discord brand color "#7289da". Uses the Linear GraphQL mutation `issueLabelCreate`.
- **get-all-labels.mjs** - Queries the Linear API to fetch all labels for the configured team. Returns an array of label objects containing id, name, description, and color fields.
- **index.mjs** - Generated facade index that exports the public API: `getAllLabels`, `createDiscordLabel`, and `main` functions from sibling modules.
- **logger.mjs** - Shared logger module that re-exports `logInfo` and `logError` from the central logger library (`../../../lib/logger.mjs`).
- **main.mjs** - Main entry point that orchestrates the workflow: searches for an existing Discord label by name or description, displays its ID if found, or creates a new one if missing. Outputs instructions for adding the label ID to systemd user environment.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function. This is the executable entry point when running the module directly.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/get-discord-label-id/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
