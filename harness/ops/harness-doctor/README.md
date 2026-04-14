# Harness Doctor

## Purpose
Harness Doctor contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 15 immediate files
- 0 child directories

## Key Files

- `check-credit-gate.mjs` - Exports `checkCreditGate`, the main helper defined in this file.
- `check-env-vars.mjs` - Exports `checkEnvVars`, the main helper defined in this file.
- `check-harness-config.mjs` - Exports `checkHarnessConfig`, the main helper defined in this file.
- `check-node-modules.mjs` - Exports `checkNodeModules`, the main helper defined in this file.
- `check-ollama.mjs` - Exports `checkOllama`, the main helper defined in this file.
- `check-queue-state.mjs` - Exports `checkQueueState`, the main helper defined in this file.
- `check-reports-dir.mjs` - Exports `checkReportsDir`, the main helper defined in this file.
- `check-systemd-services.mjs` - Exports `checkSystemdServices`, the main helper defined in this file.
- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-main.mjs` - Exports `isMain`, a shared constant or state value used by sibling modules.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `root.mjs` - Exports `ROOT`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories

- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 15 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
