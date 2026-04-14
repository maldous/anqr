# Build Index

## Purpose
Build Index contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 29 immediate files
- 0 child directories

## Key Files
- `build-candidate-list.mjs` - Exports `buildCandidateList`, the main helper defined in this file.
- `classify-file.mjs` - Exports `classifyFile`, the main helper defined in this file.
- `detect-project-root.mjs` - Exports `detectProjectRoot`, the main helper defined in this file.
- `discover-tracked-files.mjs` - Exports `discoverTrackedFiles`, the main helper defined in this file.
- `excluded-path-patterns.mjs` - Exports `EXCLUDED_PATH_PATTERNS`, a shared constant or state value used by sibling modules.
- `get-priority.mjs` - Exports `getPriority`, the main helper defined in this file.
- `i18-n-excluded-path-patterns.mjs` - Exports `I18N_EXCLUDED_PATH_PATTERNS`, a shared constant or state value used by sibling modules.
- `include-i18-n.mjs` - Exports `INCLUDE_I18N`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-supported-env-name.mjs` - Exports `isSupportedEnvName`, the main helper defined in this file.
- `is-truthy.mjs` - Exports `isTruthy`, the main helper defined in this file.
- `json-excluded-names.mjs` - Exports `JSON_EXCLUDED_NAMES`, a shared constant or state value used by sibling modules.
- `log-skip-summary.mjs` - Exports `logSkipSummary`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `max-file-bytes.mjs` - Exports `MAX_FILE_BYTES`, a shared constant or state value used by sibling modules.
- `mirror-preferences.mjs` - Exports `MIRROR_PREFERENCES`, a shared constant or state value used by sibling modules.
- `normalize-path.mjs` - Exports `normalizePath`, the main helper defined in this file.
- `priority-rules.mjs` - Exports `PRIORITY_RULES`, a shared constant or state value used by sibling modules.
- `progress-every.mjs` - Exports `PROGRESS_EVERY`, a shared constant or state value used by sibling modules.
- `project-root.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `save-interval.mjs` - Exports `SAVE_INTERVAL`, a shared constant or state value used by sibling modules.
- `should-include-json.mjs` - Exports `shouldIncludeJson`, the main helper defined in this file.
- `should-skip-mirrored-path.mjs` - Exports `shouldSkipMirroredPath`, the main helper defined in this file.
- `supported-basenames.mjs` - Exports `SUPPORTED_BASENAMES`, a shared constant or state value used by sibling modules.
- `supported-extensions.mjs` - Exports `SUPPORTED_EXTENSIONS`, a shared constant or state value used by sibling modules.
- `to-positive-int.mjs` - Exports `toPositiveInt`, the main helper defined in this file.
- `verbose.mjs` - Exports `VERBOSE`, a shared constant or state value used by sibling modules.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 29 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
