# Validate Issue

## Purpose
Validate Issue contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 11 immediate files
- 0 child directories

## Key Files
- `calculate-validation-score.mjs` - Exports `calculateValidationScore`, the main helper defined in this file.
- `determine-priority.mjs` - Exports `determinePriority`, the main helper defined in this file.
- `format-validation-result.mjs` - Exports `formatValidationResult`, the main helper defined in this file.
- `get-issue-quality-checklist.mjs` - Exports `getIssueQualityChecklist`, the main helper defined in this file.
- `get-recommended-labels.mjs` - Exports `getRecommendedLabels`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `priority-levels.mjs` - Exports `PRIORITY_LEVELS`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `validate-categorization.mjs` - Exports `validateCategorization`, the main helper defined in this file.
- `validate-issue-input.mjs` - Exports `validateIssueInput`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 11 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
