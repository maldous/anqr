# ANQR Runtime

## 1. Directory Overview

This directory contains runtime-specific harness surfaces for the ANQR (Agentic Number Query Runner)
harness. It provides the execution infrastructure for Discord/OpenClaw integration, MCP
documentation services, Symphony agent execution, watchdog monitoring, and OpenClaw configuration.
The runtime layer bridges the gap between the orchestration logic in `ops/` and the actual execution
environments. It currently contains 0 files and 5 subdirectories.

## 2. File Summaries

### Files

This directory does not contain any non-README files.

### Child Directories

- **discord/** - This directory contains the Discord runtime integration for the ANQR (Agentic Number Query Runner) harness.
- **mcp/** - This directory contains the MCP (Model Context Protocol) runtime wrapper for Context7 documentation resolution.
- **openclaw-config/** - This directory contains the local copy of the OpenClaw gateway configuration for the ANQR (Agentic Number Query Runner) harness.
- **symphony/** - This directory contains the Symphony runtime, agent system prompt, and runtime-only execution surfaces for the ANQR (Agentic Number Query Runner) harness.
- **watchdog/** - This directory contains the watchdog automation modules for the ANQR (Agentic Number Query Runner) harness system.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **No dedicated runtime dependency** - This directory mainly stores generated assets or supporting files.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
