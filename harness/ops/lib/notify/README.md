# ANQR Notify Library

## 1. Directory Overview

This directory contains the notification library for the ANQR (Agentic Number Query Runner) harness.
It provides email notification capabilities with deduplication, rate limiting, and Linear issue
integration. The library uses `msmtp` to send email notifications and maintains local state to
prevent notification spam. It currently contains 16 files and 0 subdirectories.

## 2. File Summaries

### Files

- **check-dedup.mjs** - Deduplication check function that:
- **dedup-window-ms.mjs** - Deduplication window constant: 3,600,000ms (1 hour).
- **dirname.mjs** - ESM-compatible `__dirname` polyfill using `fileURLToPath` and `path.dirname`.
- **ensure-dir.mjs** - Utility to ensure a directory exists, creating it recursively if needed.
- **format-issue-line.mjs** - Formats notification lines with:
- **index.mjs** - Generated facade that exports all public API members:
- **linear-issue-url.mjs** - Generates Linear issue URLs in format: `https://linear.app/{workspace}/issue/{identifier}`.
- **linear-workspace.mjs** - Exports LINEAR_WORKSPACE from environment variable (default: "anqr").
- **load-state.mjs** - Loads notification state from `state.json`, returns `{ sends: [] }` if file doesn't exist.
- **logger.mjs** - Shared logger using the project's logger library, exports `logInfo` and `logError`.
- **project-root.mjs** - Resolves project root directory by traversing up 4 levels from the module location.
- **rate-limit-file.mjs** - Defines the state file path as `state.json` within STATE_DIR.
- **recipient.mjs** - Exports RECIPIENT email address from `ANQR_NOTIFY_EMAIL` env var (default: matthew.aldous@gmail.com).
- **save-state.mjs** - Saves notification state to `state.json` with pretty-printed JSON formatting.
- **send-notification.mjs** - Core notification function that:
- **state-dir.mjs** - Defines state directory path as `reports/notify` under PROJECT_ROOT.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
