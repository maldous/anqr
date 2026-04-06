# ANQR Symphony Control

## 1. Directory Overview

This directory contains system control utilities for managing the ANQR (Agentic Number Query Runner) Symphony orchestration timers. It provides command-line tools to control systemd timers that manage Linear runner worktrees (wt1-wt4). The clean architecture separates Linear worktrees (wt1-wt4) from Discord worktrees (wt5-wt8), which use executor services instead of runner timers.

## 2. File Summaries

### Facade and Entry Points

- **index.mjs** - Generated facade index that exports all public API members: `getTimerStatus`, `getEnabledTimers`, `disableAllTimers`, `enableAllTimers`, `showStatus`, and `main`.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`.

- **main.mjs** - Main CLI orchestration module with argument parsing. Supports four commands: `--stop` (disable all timers), `--start` (enable Linear runner timers), `--restart` (stop then start), and `--status` (show current timer status). Returns appropriate exit codes (0 for success, 1 for failure, 2 for usage error).

### Timer Management

- **enable-all-timers.mjs** - Enables and starts Linear runner timers for worktrees wt1-wt4 only. Intentionally excludes Discord worktrees (wt5-wt8) which use executor services. Uses `systemctl --user enable` and `systemctl --user start` commands.

- **disable-all-timers.mjs** - Stops and disables all Linear runner timers using a glob pattern (`anqr-linear-runner@*.timer`). Intentionally broader than enable-all-timers to catch any stale wrong-ID instances, then enable-all-timers narrower to only start the correct subset (wt1-wt4).

- **get-timer-status.mjs** - Queries systemd for timer status using `systemctl --user list-timers anqr-linear-runner@*.timer --all`. Returns the raw output or null on error.

- **get-enabled-timers.mjs** - Parses the list-timers output to extract enabled timer unit names. Filters for units starting with `anqr-linear-runner@`.

### Utilities

- **show-status.mjs** - Displays formatted system status including raw timer status and count of enabled timers. Shows "RUNNING" or "STOPPED" state with list of active timers.

- **logger.mjs** - Shared logger module that imports from `../../lib/logger.mjs` and exports `logInfo` and `logError` functions.

## 3. Overall Directory Function

This directory serves as the control plane for the Linear runner worktrees (wt1-wt4). The files work together to provide:

- **Timer Discovery**: Query which timers are enabled and their current status
- **Timer Control**: Start, stop, enable, disable timers for Linear runners
- **Status Reporting**: Display current system state in a readable format

The key architectural distinction is that Linear worktrees (wt1-wt4) use systemd timers for periodic task pickup, while Discord worktrees (wt5-wt8) rely on executor services. This module only manages the Linear runner timers.

The CLI follows a simple pattern: `--stop` to halt task pickup, `--start` to resume, `--restart` to cycle, and `--status` to inspect current state.

## 4. Usage Instructions

### Running the CLI

```bash
# Via facade (recommended)
node ops/orchestration/symphony-control.mjs <command>

# Or directly
node ops/orchestration/symphony-control/runtime.mjs <command>
```

### Commands

| Command | Description |
|---------|-------------|
| `--stop` | Disable all runner timers (stop picking new tasks) |
| `--start` | Enable all runner timers (start picking new tasks) |
| `--restart` | Restart all runner timers (stop, wait 2s, start) |
| `--status` | Show current timer status |

### Examples

```bash
# Check current status
node ops/orchestration/symphony-control.mjs --status

# Stop all runners (maintenance window)
node ops/orchestration/symphony-control.mjs --stop

# Restart runners (after config change)
node ops/orchestration/symphony-control.mjs --restart
```

### Exit Codes

- `0` - Success
- `1` - Command failed (e.g., systemctl error)
- `2` - Usage error (missing or invalid command)

## 5. Dependencies

### Runtime Requirements

- **Node.js** - ESM modules with .mjs extension
- **systemd** - Systemd must be running (user instance)
- **systemctl** - Available in PATH for user-level commands

### Internal Dependencies

- **../../lib/logger.mjs** - Logger factory for `logInfo` and `logError`

### Environment

- Requires a running systemd user instance (`systemd --user`)
- Must have permission to run systemctl --user commands

## 6. Additional Comments

- **Clean Architecture**: The directory follows a decomposition pattern where facade files (.mjs) re-export from matching directories containing `index.mjs` and runtime modules.

- **Timer Scope**: Only manages Linear runner timers (wt1-wt4). Discord worktrees (wt5-wt8) are managed by separate executor services and are intentionally excluded from this control module.

- **Glob vs Narrow**: The disable function uses a broad glob pattern to catch any stale or misconfigured timers, while the enable function is narrowly scoped to only the correct worktrees (wt1-wt4). This ensures cleanup of misconfigured instances while maintaining correct startup behavior.

- **Timing**: The restart command includes a 2-second delay between stop and start to allow systemd to fully release resources before re-enabling.