# ANQR Symphony Runtime

## 1. Directory Overview

This directory contains the Symphony runtime, agent system prompt, and runtime-only execution
surfaces for the ANQR (Agentic Number Query Runner) harness. It provides the core execution
environment for the agentic workflow system, including the main agent entry point and watchdog
monitoring capabilities. It currently contains 3 files and 2 subdirectories.

## 2. File Summaries

### Files

- **WORKFLOW.md** - Archived workflow note file. This file is preserved only as historical context for the pre-foundation Symphony workflow notes and must not be treated as live doctrine. Current authoritative sources include: - `AGENTS.md` - `README.md` - `docs/README.md` - `docs/program/01-anqr-1.0-definition.md` - `docs/harness/00-index.md` - `harness/ops/symphony/WORKFLOW.md`
- **symphony-agent.mjs** - Auto-generated facade file that re-exports from `./symphony-agent/index.mjs`. This is the main entry point for the Symphony agent execution. The original file has been decomposed into sibling modules under the matching directory for better organization and maintainability.
- **watchdog-monitor.mjs** - Auto-generated facade file that re-exports from `./watchdog-monitor/index.mjs` and `./watchdog-monitor/runtime.mjs`. Provides watchdog monitoring capabilities for the Symphony runtime to detect and handle stale or unresponsive agent executions.

### Child Directories

- **symphony-agent/** - This directory contains the core Symphony agent implementation for the ANQR (Agentic Number Query Runner) harness.
- **watchdog-monitor/** - This directory contains the watchdog monitoring system for the ANQR (Agentic Number Query Runner) harness.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
