# Symphony Validation

## Purpose
Symphony Validation contains the code, configuration, or support files that implement this part of the harness architecture.

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
- Current on-disk inventory: 15 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
