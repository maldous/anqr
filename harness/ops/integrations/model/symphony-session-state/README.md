# Symphony Session State

## Purpose
Directory for harness support logic; immediate files include `adaptive-params-file.mjs`, `cleanup-expired-sessions.mjs`, `clear-session-messages.mjs`, `clear-session-provider.mjs`, and others.

## Contents
- 34 immediate files
- 0 child directories

## Key Files
- `adaptive-params-file.mjs` - Exports `ADAPTIVE_PARAMS_FILE`, a shared constant or state value used by sibling modules.
- `cleanup-expired-sessions.mjs` - Exports `cleanupExpiredSessions`, the main helper defined in this file.
- `clear-session-messages.mjs` - Exports `clearSessionMessages`, the main helper defined in this file.
- `clear-session-provider.mjs` - Exports `clearSessionProvider`, the main helper defined in this file.
- `default-adaptive-params.mjs` - Exports `DEFAULT_ADAPTIVE_PARAMS`, a shared constant or state value used by sibling modules.
- `detect-codebuff-mode.mjs` - Exports `detectCodebuffMode`, the main helper defined in this file.
- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `ensure-state-dir.mjs` - Exports `ensureStateDir`, the main helper defined in this file.
- `get-adaptive-params.mjs` - Exports `getAdaptiveParams`, the main helper defined in this file.
- `get-evaluation-sample-provider.mjs` - Exports `getEvaluationSampleProvider`, the main helper defined in this file.
- `get-provider-turn-limit.mjs` - Exports `getProviderTurnLimit`, the main helper defined in this file.
- `get-session-messages.mjs` - Exports `getSessionMessages`, the main helper defined in this file.
- `get-session-provider.mjs` - Exports `getSessionProvider`, the main helper defined in this file.
- `hash-messages.mjs` - Exports `hashMessages`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `load-adaptive-params.mjs` - Exports `loadAdaptiveParams`, the main helper defined in this file.
- `load-session-state.mjs` - Exports `loadSessionState`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `params-cache.mjs` - Exports `setParamsCache`, the main helper defined in this file.
- `project-root.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `reset-adaptive-params.mjs` - Exports `resetAdaptiveParams`, the main helper defined in this file.
- `save-adaptive-params.mjs` - Exports `saveAdaptiveParams`, the main helper defined in this file.
- `save-session-state.mjs` - Exports `saveSessionState`, the main helper defined in this file.
- `session-state-file.mjs` - Exports `SESSION_STATE_FILE`, a shared constant or state value used by sibling modules.
- `session-ttl-ms.mjs` - Exports `SESSION_TTL_MS`, a shared constant or state value used by sibling modules.
- `set-session-messages.mjs` - Exports `setSessionMessages`, the main helper defined in this file.
- `should-trigger-eval-cycle.mjs` - Exports `shouldTriggerEvalCycle`, the main helper defined in this file.
- `state-dir.mjs` - Exports `STATE_DIR`, a shared constant or state value used by sibling modules.
- `tier-free.mjs` - Exports `TIER_FREE`, a shared constant or state value used by sibling modules.
- `tier-local.mjs` - Exports `TIER_LOCAL`, a shared constant or state value used by sibling modules.
- `tier-paid.mjs` - Exports `TIER_PAID`, a shared constant or state value used by sibling modules.
- `tune-adaptive-params.mjs` - Exports `tuneAdaptiveParams`, the main helper defined in this file.
- `update-session-provider.mjs` - Exports `updateSessionProvider`, the main helper defined in this file.
- `verify-session-messages.mjs` - Exports `verifySessionMessages`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 34 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
