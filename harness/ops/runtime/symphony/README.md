# ANQR Symphony Runtime

## 1. Directory Overview

This directory contains the Symphony runtime, agent system prompt, and runtime-only execution surfaces for the ANQR (Agentic Number Query Runner) harness. It provides the core execution environment for the agentic workflow system, including the main agent entry point and watchdog monitoring capabilities.

## 2. File Summaries

### WORKFLOW.md

Archived workflow note file. This file is preserved only as historical context for the pre-foundation Symphony workflow notes and must not be treated as live doctrine. Current authoritative sources include:
- `AGENTS.md`
- `README.md`
- `docs/README.md`
- `docs/program/01-anqr-1.0-definition.md`
- `docs/harness/00-index.md`
- `harness/ops/symphony/WORKFLOW.md`

If this file disagrees with the current repo or canonical docs, this file is wrong.

### symphony-agent.mjs

Auto-generated facade file that re-exports from `./symphony-agent/index.mjs`. This is the main entry point for the Symphony agent execution. The original file has been decomposed into sibling modules under the matching directory for better organization and maintainability.

### watchdog-monitor.mjs

Auto-generated facade file that re-exports from `./watchdog-monitor/index.mjs` and `./watchdog-monitor/runtime.mjs`. Provides watchdog monitoring capabilities for the Symphony runtime to detect and handle stale or unresponsive agent executions.

### README.md (this file)

The contract document establishing this directory's purpose: Symphony runtime, agent system prompt, and runtime-only execution surfaces.

## 3. Overall Directory Function

This directory serves as the core runtime layer for the ANQR Symphony system. It provides:

- **Agent Execution**: The main agent entry point (`symphony-agent.mjs`) handles the execution of agentic workflows
- **Monitoring**: Watchdog monitoring (`watchdog-monitor.mjs`) ensures agents remain healthy and responsive during execution
- **System Prompt**: Agent system prompt configuration for guiding agent behavior
- **Runtime Surface**: Pure runtime-only execution surfaces that don't depend on broader harness infrastructure

The directory follows a decomposition pattern where facade files (.mjs) re-export from matching directories containing `index.mjs` and optional `runtime.mjs` modules.

## 4. Usage Instructions

This directory is primarily accessed through imports from other harness modules or executed as part of the broader Symphony workflow:

```javascript
// Import the agent
import { main } from "./ops/runtime/symphony/symphony-agent.mjs";

// Or import watchdog monitoring
import { startMonitor } from "./ops/runtime/symphony/watchdog-monitor.mjs";
```

For direct execution:

```bash
# Run the Symphony agent
node ops/runtime/symphony/symphony-agent.mjs

# Run watchdog monitoring
node ops/runtime/symphony/watchdog-monitor.mjs
```

Refer to `AGENTS.md` and the canonical docs in `docs/` for detailed workflow and usage information.

## 5. Dependencies

### Internal Dependencies

- **symphony-agent/** - Directory containing the decomposed agent implementation modules
- **watchdog-monitor/** - Directory containing the decomposed watchdog monitoring implementation
- **../** - Parent runtime directory for shared utilities

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid ANQR harness environment configured
- Symphony bridge connectivity for agent execution

### External Services

- **Symphony Bridge** - For provider routing and execution coordination
- **Linear** - For issue tracking (if integrated with agent workflows)

## 6. Additional Comments

- **Decomposition Pattern**: This directory follows the facade module pattern where original monolithic files have been split into sibling modules (index.mjs and runtime.mjs) for better maintainability. The facade files (.mjs at root) re-export from these modules.

- **Archived vs Current**: WORKFLOW.md is explicitly marked as archived and should not be used as reference for current operations. Always refer to the canonical documentation sources listed in that file.

- **Runtime-Only**: This directory contains runtime-only execution surfaces, meaning it does not include build-time or development-time dependencies that exist in other parts of the harness.

- **Watchdog Design**: The watchdog-monitor provides health checking for agent executions, detecting stale or unresponsive processes and enabling recovery actions.