# Review Open Issues

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `dirname.mjs`, `exec-async.mjs`, `extract-check-name.mjs`, `extract-sonar-dup-key.mjs`, and others.

## Contents

- 15 immediate files
- 0 child directories

## Key Files

- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `exec-async.mjs` - Exports `execAsync`, a shared constant or state value used by sibling modules.
- `extract-check-name.mjs` - Exports `extractCheckName`, the main helper defined in this file.
- `extract-sonar-dup-key.mjs` - Exports `extractSonarDupKey`, the main helper defined in this file.
- `extract-sonar-key.mjs` - Exports `extractSonarKey`, the main helper defined in this file.
- `file-exists-in-git.mjs` - Exports `fileExistsInGit`, the main helper defined in this file.
- `get-harness-status.mjs` - Exports `getHarnessStatus`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-stale.mjs` - Exports `isStale`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `open-states.mjs` - Exports `OPEN_STATES`, a shared constant or state value used by sibling modules.
- `root.mjs` - Exports `ROOT`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `stale-days.mjs` - Exports `STALE_DAYS`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 15 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
