# ANQR Symphony Control

## 1. Directory Overview

This directory contains system control utilities for managing the ANQR (Agentic Number Query Runner)
Symphony orchestration timers. It provides command-line tools to control systemd timers that manage
Linear runner worktrees (wt1-wt4). The clean architecture separates Linear worktrees (wt1-wt4) from
Discord worktrees (wt5-wt8), which use executor services instead of runner timers. It currently
contains 9 files and 0 subdirectories.

## 2. File Summaries

### Files

- **disable-all-timers.mjs** - Stops and disables all Linear runner timers using a glob pattern (`anqr-linear-runner@*.timer`). Intentionally broader than enable-all-timers to catch any stale wrong-ID instances, then enable-all-timers narrower to only start the correct subset (wt1-wt4).
- **enable-all-timers.mjs** - Enables and starts Linear runner timers for worktrees wt1-wt4 only. Intentionally excludes Discord worktrees (wt5-wt8) which use executor services. Uses `systemctl --user enable` and `systemctl --user start` commands.
- **get-enabled-timers.mjs** - Parses the list-timers output to extract enabled timer unit names. Filters for units starting with `anqr-linear-runner@`.
- **get-timer-status.mjs** - Queries systemd for timer status using `systemctl --user list-timers anqr-linear-runner@*.timer --all`. Returns the raw output or null on error.
- **index.mjs** - Generated facade index that exports all public API members: `getTimerStatus`, `getEnabledTimers`, `disableAllTimers`, `enableAllTimers`, `showStatus`, and `main`.
- **logger.mjs** - Shared logger module that imports from `../../lib/logger.mjs` and exports `logInfo` and `logError` functions.
- **main.mjs** - Main CLI orchestration module with argument parsing. Supports four commands: `--stop` (disable all timers), `--start` (enable Linear runner timers), `--restart` (stop then start), and `--status` (show current timer status). Returns appropriate exit codes (0 for success, 1 for failure, 2 for usage error).
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`.
- **show-status.mjs** - Displays formatted system status including raw timer status and count of enabled timers. Shows "RUNNING" or "STOPPED" state with list of active timers.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-control/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
