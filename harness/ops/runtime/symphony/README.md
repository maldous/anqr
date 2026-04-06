# ANQR Symphony Runtime

## 1. Directory Overview

This directory implements **ANQR Symphony Runtime** within the ANQR harness. It primarily acts as a namespace and aggregation layer for child directories, with only a small amount of immediate code. The current inventory is 3 non-README files and 2 subdirectories.

## 2. File Summaries

### Files

- **WORKFLOW.md** - Markdown document titled **Archived Workflow Note**.
- **symphony-agent.mjs** - Facade module that re-exports public members from `./symphony-agent/index.mjs`.
- **watchdog-monitor.mjs** - Facade module that re-exports public members from `./watchdog-monitor/index.mjs`, `./watchdog-monitor/runtime.mjs`.

### Subdirectories

- **symphony-agent/** - Contains **ANQR Symphony Agent**; it contains 31 immediate files and has 0 child directories.
- **watchdog-monitor/** - Contains **ANQR Watchdog Monitor**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.

## 3. Overall Directory Function

Most of the behavior lives in child directories; the immediate directory mainly provides namespacing and lightweight aggregation. Verified immediate files in this directory include timer, scheduling, cooldown, or watchdog behavior, and Symphony integration.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- **Internal relative modules** - `./symphony-agent/index.mjs`, `./watchdog-monitor/index.mjs`, `./watchdog-monitor/runtime.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
