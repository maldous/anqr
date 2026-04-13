# Symphony Validation

## Purpose
Directory for harness support logic; immediate files include `filter-changed-files.mjs`, `format-validation-feedback.mjs`, `index.mjs`, `run-ast-density.mjs`, and others.

## Contents
- 15 immediate files
- 0 child directories

## Key Files
- `filter-changed-files.mjs` - Exports `filterChangedFiles`, the main helper defined in this file.
- `format-validation-feedback.mjs` - Exports `formatValidationFeedback`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `run-ast-density.mjs` - Exports `runAstDensity`, the main helper defined in this file.
- `run-command-with-heartbeat.mjs` - Exports `runCommandWithHeartbeat`, the main helper defined in this file.
- `run-command.mjs` - Exports `runCommand`, the main helper defined in this file.
- `run-cspell.mjs` - Exports `runCspell`, the main helper defined in this file.
- `run-global-preflights.mjs` - Exports `runGlobalPreflights`, the main helper defined in this file.
- `run-lint.mjs` - Exports `runLint`, the main helper defined in this file.
- `run-tests.mjs` - Exports `runTests`, the main helper defined in this file.
- `run-typecheck.mjs` - Exports `runTypecheck`, the main helper defined in this file.
- `run-validation.mjs` - Exports `runValidation`, the main helper defined in this file.
- `trim-output.mjs` - Exports `trimOutput`, the main helper defined in this file.
- `validation-manifest-hash.mjs` - Exports `validationManifestHash`, the main helper defined in this file.
- `validation-manifest.mjs` - Exports `VALIDATION_MANIFEST`, a shared constant or state value used by sibling modules.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 15 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
