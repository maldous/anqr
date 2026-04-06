# ANQR Symphony Session State

## 1. Directory Overview

This directory contains the session state management functionality for the ANQR (Agentic Number
Query Runner) Symphony orchestration system. It provides a file-based state management layer that
persists per-issue execution state across agent turns, enabling long-running conversations with
persistent context. The session state module tracks issue metadata, execution history, and maintains
state continuity across multiple runner invocations. It currently contains 34 files and 0
subdirectories.

## 2. File Summaries

### Files

- **adaptive-params-file.mjs** - Module that supports adaptive params file. Exports `ADAPTIVE_PARAMS_FILE`.
- **cleanup-expired-sessions.mjs** - Module that supports cleanup expired sessions. Exports `cleanupExpiredSessions`.
- **clear-session-messages.mjs** - Module that supports clear session messages. Exports `clearSessionMessages`.
- **clear-session-provider.mjs** - Module that supports clear session provider. Exports `clearSessionProvider`.
- **default-adaptive-params.mjs** - Module that supports default adaptive params. Exports `DEFAULT_ADAPTIVE_PARAMS`.
- **detect-codebuff-mode.mjs** - Module that supports detect codebuff mode. Exports `detectCodebuffMode`.
- **dirname.mjs** - Module that supports dirname. Exports `__dirname`.
- **ensure-state-dir.mjs** - Module that ensures state dir. Exports `ensureStateDir`.
- **get-adaptive-params.mjs** - Module that retrieves adaptive params. Exports `getAdaptiveParams`.
- **get-evaluation-sample-provider.mjs** - Module that retrieves evaluation sample provider. Exports `getEvaluationSampleProvider`.
- **get-provider-turn-limit.mjs** - Module that retrieves provider turn limit. Exports `getProviderTurnLimit`.
- **get-session-messages.mjs** - Module that retrieves session messages. Exports `getSessionMessages`.
- **get-session-provider.mjs** - Module that retrieves session provider. Exports `getSessionProvider`.
- **hash-messages.mjs** - Module that supports hash messages. Exports `hashMessages`.
- **index.mjs** - Main module exporting the public API including `loadSessionState`, `saveSessionState`, `clearSessionState`, `getStatePath`, and `SESSION_STATE_DIR` constant. Provides file-based session persistence with JSON serialization.
- **load-adaptive-params.mjs** - Module that loads adaptive params. Exports `loadAdaptiveParams`.
- **load-session-state.mjs** - Implements session state loading logic. Reads persisted JSON state files for a given issueIdentifier, returning the parsed state object or null if no session exists.
- **logger.mjs** - Module that provides logging helpers for. Exports `logInfo, logWarn, logError, logDebug`.
- **params-cache.mjs** - Module that supports params cache. Exports `setParamsCache, paramsCache`.
- **project-root.mjs** - Module that supports project root. Exports `PROJECT_ROOT`.
- **reset-adaptive-params.mjs** - Module that supports reset adaptive params. Exports `resetAdaptiveParams`.
- **save-adaptive-params.mjs** - Module that saves adaptive params. Exports `saveAdaptiveParams`.
- **save-session-state.mjs** - Implements session state persistence. Serializes state object to JSON and writes to the appropriate state file path, creating directories as needed.
- **session-state-file.mjs** - Module that supports session state file. Exports `SESSION_STATE_FILE`.
- **session-ttl-ms.mjs** - Module that supports session ttl ms. Exports `SESSION_TTL_MS`.
- **set-session-messages.mjs** - Module that sets or updates session messages. Exports `setSessionMessages`.
- **should-trigger-eval-cycle.mjs** - Module that supports should trigger eval cycle. Exports `shouldTriggerEvalCycle`.
- **state-dir.mjs** - Module that supports state dir. Exports `STATE_DIR`.
- **tier-free.mjs** - Module that supports tier free. Exports `TIER_FREE`.
- **tier-local.mjs** - Module that supports tier local. Exports `TIER_LOCAL`.
- **tier-paid.mjs** - Module that supports tier paid. Exports `TIER_PAID`.
- **tune-adaptive-params.mjs** - Module that supports tune adaptive params. Exports `tuneAdaptiveParams`.
- **update-session-provider.mjs** - Module that supports update session provider. Exports `updateSessionProvider`.
- **verify-session-messages.mjs** - Module that verifies session messages. Exports `verifySessionMessages`.

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
