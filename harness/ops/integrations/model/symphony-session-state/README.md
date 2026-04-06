# ANQR Symphony Session State

## 1. Directory Overview

This directory implements **ANQR Symphony Session State** within the ANQR harness. Key immediate entries include `index.mjs`, `get-evaluation-sample-provider.mjs`, `should-trigger-eval-cycle.mjs`, `get-provider-turn-limit.mjs`. The current inventory is 34 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **adaptive-params-file.mjs** - Exports `ADAPTIVE_PARAMS_FILE`, a shared constant used by sibling modules.
- **cleanup-expired-sessions.mjs** - Exports `cleanupExpiredSessions`, which implements cleanup expired sessions.
- **clear-session-messages.mjs** - Exports `clearSessionMessages`, which clears session messages.
- **clear-session-provider.mjs** - Exports `clearSessionProvider`, which clears session provider.
- **default-adaptive-params.mjs** - Exports `DEFAULT_ADAPTIVE_PARAMS`, a shared constant used by sibling modules.
- **detect-codebuff-mode.mjs** - Exports `detectCodebuffMode`, which detects codebuff mode.
- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **ensure-state-dir.mjs** - Exports `ensureStateDir`, which ensures state dir.
- **get-adaptive-params.mjs** - Exports `getAdaptiveParams`, which gets adaptive params.
- **get-evaluation-sample-provider.mjs** - Exports `getEvaluationSampleProvider`, which gets evaluation sample provider.
- **get-provider-turn-limit.mjs** - Exports `getProviderTurnLimit`, which gets provider turn limit.
- **get-session-messages.mjs** - Exports `getSessionMessages`, which gets session messages.
- **get-session-provider.mjs** - Exports `getSessionProvider`, which gets session provider.
- **hash-messages.mjs** - Exports `hashMessages`, which implements hash messages.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./project-root.mjs`, `./state-dir.mjs`, `./session-state-file.mjs`, `./adaptive-params-file.mjs`, `./tier-paid.mjs`, and 26 more siblings.
- **load-adaptive-params.mjs** - Exports `loadAdaptiveParams`, which loads adaptive params.
- **load-session-state.mjs** - Exports `loadSessionState`, which loads session state.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **params-cache.mjs** - Exports `paramsCache`, `setParamsCache`, providing the reusable API for this directory concern.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **reset-adaptive-params.mjs** - Exports `resetAdaptiveParams`, which implements reset adaptive params.
- **save-adaptive-params.mjs** - Exports `saveAdaptiveParams`, which implements save adaptive params.
- **save-session-state.mjs** - Exports `saveSessionState`, which implements save session state.
- **session-state-file.mjs** - Exports `SESSION_STATE_FILE`, a shared constant used by sibling modules.
- **session-ttl-ms.mjs** - Exports `SESSION_TTL_MS`, a shared constant used by sibling modules.
- **set-session-messages.mjs** - Exports `setSessionMessages`, which implements set session messages.
- **should-trigger-eval-cycle.mjs** - Exports `shouldTriggerEvalCycle`, which implements should trigger eval cycle.
- **state-dir.mjs** - Exports `STATE_DIR`, a shared constant used by sibling modules.
- **tier-free.mjs** - Exports `TIER_FREE`, a shared constant used by sibling modules.
- **tier-local.mjs** - Exports `TIER_LOCAL`, a shared constant used by sibling modules.
- **tier-paid.mjs** - Exports `TIER_PAID`, a shared constant used by sibling modules.
- **tune-adaptive-params.mjs** - Exports `tuneAdaptiveParams`, which implements tune adaptive params.
- **update-session-provider.mjs** - Exports `updateSessionProvider`, which implements update session provider.
- **verify-session-messages.mjs** - Exports `verifySessionMessages`, which verifies session messages.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, and Symphony integration.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/model/symphony-session-state/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:crypto`, `node:fs`, `node:path`, `node:url`
- **Internal relative modules** - `../../../lib/logger.mjs`, `./adaptive-params-file.mjs`, `./default-adaptive-params.mjs`, `./dirname.mjs`, `./ensure-state-dir.mjs`, `./get-adaptive-params.mjs`, `./hash-messages.mjs`, `./load-adaptive-params.mjs`, `./load-session-state.mjs`, `./logger.mjs`, `./params-cache.mjs`, `./project-root.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
