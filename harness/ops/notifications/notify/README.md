# ANQR Notify

## 1. Directory Overview

This directory contains the notification automation module for the ANQR (Agentic Number Query
Runner) harness. It provides functionality to send harness report notifications to various channels
including stdout and email. The module reads the latest harness report and formats/distributes it to
configured notification endpoints. It currently contains 10 files and 0 subdirectories.

## 2. File Summaries

### Files

- **dirname.mjs** - Node.js `__dirname` polyfill for ESM compatibility using `fileURLToPath`.
- **format-email-body.mjs** - Formats harness report as an email body. Shows profile, timestamp, duration, summary, detailed failure list with error messages, and passed checks.
- **format-stdout.mjs** - Formats harness report for stdout output. Displays profile, timestamp, duration, and a list of checks with pass/fail icons and timing information.
- **index.mjs** - Generated facade index that re-exports all public API members including `main`, `parseArgs`, `formatEmailBody`, `formatStdout`, path constants, and utilities.
- **logger.mjs** - Shared logger module using the centralized logger from `../../lib/logger.mjs`. Exports `logInfo` and `logError` functions.
- **main.mjs** - Main orchestration module that reads the harness report from `reports/latest.json`, formats output for different channels, and dispatches notifications via stdout and email. Supports dry-run mode for testing.
- **parse-args.mjs** - Command-line argument parser. Parses `--dry-run` flag and `--channel=` option (values: `stdout`, `email`, `all`). Defaults to `all` if not specified.
- **report-path.mjs** - Path constant for the harness report location (`reports/latest.json`). Resolved relative to the project ROOT.
- **root.mjs** - Path resolution utility that defines the project ROOT by resolving from the module's directory to the project root (4 levels up).
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/notifications/notify/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
