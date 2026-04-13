# Ollama Local Audit

## Purpose
Directory for runtime service bootstrap or environment support; immediate files include `check-model-available.mjs`, `check-model-responds.mjs`, `check-reachable.mjs`, `index.mjs`, and others.

## Contents
- 14 immediate files
- 0 child directories

## Key Files
- `check-model-available.mjs` - Exports `checkModelAvailable`, the main helper defined in this file.
- `check-model-responds.mjs` - Exports `checkModelResponds`, the main helper defined in this file.
- `check-reachable.mjs` - Exports `checkReachable`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `ollama-base.mjs` - Exports `OLLAMA_BASE`, a shared constant or state value used by sibling modules.
- `ping-timeout-ms.mjs` - Exports `PING_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `pinned-model.mjs` - Exports `PINNED_MODEL`, a shared constant or state value used by sibling modules.
- `print-summary.mjs` - Exports `printSummary`, the main helper defined in this file.
- `prompt-timeout-ms.mjs` - Exports `PROMPT_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `record.mjs` - Exports `record`, the main helper defined in this file.
- `results.mjs` - Exports `results`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 14 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
