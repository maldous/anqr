# ANQR Symphony Session State

## 1. Directory Overview

This directory contains the session state management functionality for the ANQR (Agentic Number Query Runner) Symphony orchestration system. It provides a file-based state management layer that persists per-issue execution state across agent turns, enabling long-running conversations with persistent context. The session state module tracks issue metadata, execution history, and maintains state continuity across multiple runner invocations.

## 2. File Summaries

### Core State Management

- **index.mjs** - Main module exporting the public API including `loadSessionState`, `saveSessionState`, `clearSessionState`, `getStatePath`, and `SESSION_STATE_DIR` constant. Provides file-based session persistence with JSON serialization.

- **runtime.mjs** - Runtime carry-forward that imports and executes the main index module. Provides a CLI entry point for direct execution when needed.

- **load-session-state.mjs** - Implements session state loading logic. Reads persisted JSON state files for a given issueIdentifier, returning the parsed state object or null if no session exists.

- **save-session-state.mjs** - Implements session state persistence. Serializes state object to JSON and writes to the appropriate state file path, creating directories as needed.

- **clear-session-state.mjs** - Implements session state cleanup. Removes state files for a given issueIdentifier, used when issues complete or are cancelled.

- **get-state-path.mjs** - Utility that resolves the absolute file path for a given issue's session state file. Handles directory creation and path normalization.

## 3. Overall Directory Function

This directory provides the persistent state layer for Symphony agent execution. Each issue gets its own session state file that persists across agent turns, enabling:

- **Context Continuity**: Maintains conversation history and context across multiple runner invocations
- **Execution Tracking**: Stores execution metadata, turn counts, and completion status
- **Failure Recovery**: Enables resume of interrupted sessions by loading previous state
- **Issue Isolation**: Each issue's state is isolated in its own file to prevent cross-contamination

The session state is stored as JSON files in the configured state directory, with filenames based on the issue identifier (typically the Linear issue ID).

## 4. Usage Instructions

### Loading Session State

```javascript
import { loadSessionState } from "./index.mjs";

const state = await loadSessionState(issueIdentifier);
if (state) {
  // Resume from previous session
  console.log(`Resuming issue with ${state.turnCount} previous turns`);
}
```

### Saving Session State

```javascript
import { saveSessionState } from "./index.mjs";

await saveSessionState(issueIdentifier, {
  turnCount: 5,
  messages: [...],
  metadata: { startedAt: Date.now() }
});
```

### Clearing Session State

```javascript
import { clearSessionState } from "./index.mjs";

await clearSessionState(issueIdentifier); // Clean up after completion
```

### Direct Execution

```bash
node runtime.mjs
```

## 5. Dependencies

### Internal Dependencies

- **../../lib/logger.mjs** - Logger factory for debug and error output

### Configuration

- **SESSION_STATE_DIR** - Environment variable or default directory for state files (default: `~/.anqr/state` or project-relative)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- File system write access to state directory

## 6. Additional Comments

- **Failure Atomicity**: State writes use temporary files and atomic rename to prevent corruption from interrupted writes
- **JSON Validation**: Loaded state is validated against expected schema, invalid files are treated as missing
- **Cleanup Strategy**: State files should be cleared upon issue completion to prevent accumulation
- **Path Isolation**: State files use URL-safe encoding of issue identifiers to prevent path traversal issues