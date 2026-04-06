# RAG Build Index

## 1. Directory Overview

This directory implements **RAG Build Index** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 29 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-candidate-list.mjs** - Exports `buildCandidateList`, which builds candidate list.
- **classify-file.mjs** - Exports `classifyFile`, which implements classify file.
- **detect-project-root.mjs** - Exports `detectProjectRoot`, which detects project root.
- **discover-tracked-files.mjs** - Exports `discoverTrackedFiles`, which implements discover tracked files.
- **excluded-path-patterns.mjs** - Exports `EXCLUDED_PATH_PATTERNS`, a shared constant used by sibling modules.
- **get-priority.mjs** - Exports `getPriority`, which gets priority.
- **i18-n-excluded-path-patterns.mjs** - Exports `I18N_EXCLUDED_PATH_PATTERNS`, a shared constant used by sibling modules.
- **include-i18-n.mjs** - Exports `INCLUDE_I18N`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./detect-project-root.mjs`, `./project-root.mjs`, `./save-interval.mjs`, `./progress-every.mjs`, `./max-file-bytes.mjs`, `./include-i18-n.mjs`, and 20 more siblings.
- **is-supported-env-name.mjs** - Exports `isSupportedEnvName`, which checks whether supported env name.
- **is-truthy.mjs** - Exports `isTruthy`, which checks whether truthy.
- **json-excluded-names.mjs** - Exports `JSON_EXCLUDED_NAMES`, a shared `Set` constant used by this module group.
- **log-skip-summary.mjs** - Exports `logSkipSummary`, which implements log skip summary.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **max-file-bytes.mjs** - Exports `MAX_FILE_BYTES`, a shared constant used by sibling modules.
- **mirror-preferences.mjs** - Exports `MIRROR_PREFERENCES`, a shared constant used by sibling modules.
- **normalize-path.mjs** - Exports `normalizePath`, which normalizes path.
- **priority-rules.mjs** - Exports `PRIORITY_RULES`, a shared constant used by sibling modules.
- **progress-every.mjs** - Exports `PROGRESS_EVERY`, a shared constant used by sibling modules.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **save-interval.mjs** - Exports `SAVE_INTERVAL`, a shared constant used by sibling modules.
- **should-include-json.mjs** - Exports `shouldIncludeJson`, which implements should include json.
- **should-skip-mirrored-path.mjs** - Exports `shouldSkipMirroredPath`, which implements should skip mirrored path.
- **supported-basenames.mjs** - Exports `SUPPORTED_BASENAMES`, a shared `Set` constant used by this module group.
- **supported-extensions.mjs** - Exports `SUPPORTED_EXTENSIONS`, a shared `Set` constant used by this module group.
- **to-positive-int.mjs** - Exports `toPositiveInt`, which implements to positive int.
- **verbose.mjs** - Exports `VERBOSE`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, network/API integration, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/lib/rag/build-index/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs/promises`, `node:path`
- **Internal relative modules** - `../../logger.mjs`, `../build-index-linear/build-linear-index.mjs`, `../embeddings.mjs`, `../vector-store.mjs`, `./build-candidate-list.mjs`, `./classify-file.mjs`, `./detect-project-root.mjs`, `./discover-tracked-files.mjs`, `./excluded-path-patterns.mjs`, `./get-priority.mjs`, `./i18-n-excluded-path-patterns.mjs`, `./include-i18-n.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
