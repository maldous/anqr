# Issue Hygiene

## Purpose
Issue Hygiene contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 15 immediate files
- 0 child directories

## Key Files
- `action-delay-ms.mjs` - Exports `ACTION_DELAY_MS`, a shared constant or state value used by sibling modules.
- `analysis-delay-ms.mjs` - Exports `ANALYSIS_DELAY_MS`, a shared constant or state value used by sibling modules.
- `analyze-comments.mjs` - Exports `analyzeComments`, the main helper defined in this file.
- `analyze-issue.mjs` - Exports `analyzeIssue`, the main helper defined in this file.
- `apply-hygiene.mjs` - Exports `applyHygiene`, the main helper defined in this file.
- `build-failure-summary.mjs` - Exports `buildFailureSummary`, the main helper defined in this file.
- `default-comment-threshold.mjs` - Exports `DEFAULT_COMMENT_THRESHOLD`, a shared constant or state value used by sibling modules.
- `failure-patterns.mjs` - Exports `FAILURE_PATTERNS`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `max-description-length.mjs` - Exports `MAX_DESCRIPTION_LENGTH`, a shared constant or state value used by sibling modules.
- `parse-args.mjs` - Exports `parseArgs`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `systemic-failure-threshold.mjs` - Exports `SYSTEMIC_FAILURE_THRESHOLD`, a shared constant or state value used by sibling modules.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 15 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
