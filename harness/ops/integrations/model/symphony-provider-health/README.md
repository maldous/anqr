# Symphony Provider Health

## Purpose

Directory for harness support logic; immediate files include `get-provider-health-state.mjs`, `health-state-file.mjs`, `health-states.mjs`, `index.mjs`, and others.

## Contents

- 13 immediate files
- 0 child directories

## Key Files

- `get-provider-health-state.mjs` - Exports `getProviderHealthState`, the main helper defined in this file.
- `health-state-file.mjs` - Exports `HEALTH_STATE_FILE`, a shared constant or state value used by sibling modules.
- `health-states.mjs` - Exports `HEALTH_STATES`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `load-health-state.mjs` - Exports `loadHealthState`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `project-root.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `record-provider-health-failure.mjs` - Exports `recordProviderHealthFailure`, the main helper defined in this file.
- `record-provider-health-success.mjs` - Exports `recordProviderHealthSuccess`, the main helper defined in this file.
- `save-health-state.mjs` - Exports `saveHealthState`, the main helper defined in this file.
- `set-provider-health-state.mjs` - Exports `setProviderHealthState`, the main helper defined in this file.
- `should-retry-provider.mjs` - Exports `shouldRetryProvider`, the main helper defined in this file.
- `state-dir.mjs` - Exports `STATE_DIR`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 13 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
