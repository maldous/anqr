# ANQR Symphony Validation

## 1. Directory Overview

This directory implements **ANQR Symphony Validation** within the ANQR harness. Key immediate entries include `index.mjs`, `run-command-with-heartbeat.mjs`, `run-ast-density.mjs`, `run-global-preflights.mjs`. The current inventory is 15 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **filter-changed-files.mjs** - Exports `filterChangedFiles`, which implements filter changed files.
- **format-validation-feedback.mjs** - Exports `formatValidationFeedback`, which formats validation feedback.
- **index.mjs** - Facade module that re-exports public members from `./validation-manifest.mjs`, `./validation-manifest-hash.mjs`, `./trim-output.mjs`, `./run-command.mjs`, `./run-command-with-heartbeat.mjs`, `./run-typecheck.mjs`, and 8 more siblings.
- **run-ast-density.mjs** - Exports `runAstDensity`, which runs ast density.
- **run-command-with-heartbeat.mjs** - Exports `runCommandWithHeartbeat`, which runs command with heartbeat.
- **run-command.mjs** - Exports `runCommand`, which runs command.
- **run-cspell.mjs** - Exports `runCspell`, which runs cspell.
- **run-global-preflights.mjs** - Exports `runGlobalPreflights`, which runs global preflights.
- **run-lint.mjs** - Exports `runLint`, which runs lint.
- **run-tests.mjs** - Exports `runTests`, which runs tests.
- **run-typecheck.mjs** - Exports `runTypecheck`, which runs typecheck.
- **run-validation.mjs** - Exports `runValidation`, which runs validation.
- **trim-output.mjs** - Exports `trimOutput`, which implements trim output.
- **validation-manifest-hash.mjs** - Exports `validationManifestHash`, which implements validation manifest hash.
- **validation-manifest.mjs** - Exports `VALIDATION_MANIFEST`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include subprocess execution, timer, scheduling, cooldown, or watchdog behavior, and Symphony integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/core/symphony-validation/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:crypto`
- **Internal relative modules** - `./filter-changed-files.mjs`, `./run-ast-density.mjs`, `./run-command-with-heartbeat.mjs`, `./run-command.mjs`, `./run-cspell.mjs`, `./run-lint.mjs`, `./run-tests.mjs`, `./run-typecheck.mjs`, `./trim-output.mjs`, `./validation-manifest.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
