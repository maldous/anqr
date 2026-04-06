# ANQR Watchdog

## 1. Directory Overview

This directory contains the watchdog automation modules for the ANQR (Agentic Number Query Runner)
harness system. The watchdog provides automated monitoring and self-healing capabilities for the
Symphony bridge service, detecting failures and triggering automatic recovery actions including git
rollbacks and Discord notifications. It currently contains 1 file and 1 subdirectory.

## 2. File Summaries

### Files

- **bridge-watchdog.mjs** - Auto-generated facade that re-exports from `./bridge-watchdog/index.mjs` and `./bridge-watchdog/runtime.mjs`. Provides the CLI entry point for the bridge watchdog monitoring system.

### Child Directories

- **bridge-watchdog/** - This directory contains the bridge watchdog module for the ANQR (Agentic Number Query Runner) harness system.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
