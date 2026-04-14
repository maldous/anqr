# Harness Doctor

## Purpose

Directory for systemd topology and host runtime configuration; immediate files include `check-credit-gate.mjs`, `check-env-vars.mjs`, `check-harness-config.mjs`, `check-node-modules.mjs`, and others.

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

- Current on-disk inventory: 15 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
