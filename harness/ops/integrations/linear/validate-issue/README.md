# Validate Issue

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `calculate-validation-score.mjs`, `determine-priority.mjs`, `format-validation-result.mjs`, `get-issue-quality-checklist.mjs`, and others.

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

- Current on-disk inventory: 11 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
