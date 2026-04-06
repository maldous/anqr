# ANQR Linear Issue Validation

## 1. Directory Overview

This directory implements **ANQR Linear Issue Validation** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 11 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **calculate-validation-score.mjs** - Exports `calculateValidationScore`, which calculates validation score.
- **determine-priority.mjs** - Exports `determinePriority`, which implements determine priority.
- **format-validation-result.mjs** - Exports `formatValidationResult`, which formats validation result.
- **get-issue-quality-checklist.mjs** - Exports `getIssueQualityChecklist`, which gets issue quality checklist.
- **get-recommended-labels.mjs** - Exports `getRecommendedLabels`, which gets recommended labels.
- **index.mjs** - Facade module that re-exports public members from `./validate-issue-input.mjs`, `./calculate-validation-score.mjs`, `./format-validation-result.mjs`, `./get-issue-quality-checklist.mjs`, `./validate-categorization.mjs`, `./get-recommended-labels.mjs`, and 3 more siblings.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **priority-levels.mjs** - Exports `PRIORITY_LEVELS`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **validate-categorization.mjs** - Exports `validateCategorization`, which validates categorization.
- **validate-issue-input.mjs** - Exports `validateIssueInput`, which validates issue input.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include Linear integration, and Discord integration.

## 4. Usage Instructions

```bash
node ops/integrations/linear/validate-issue/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../linear-client.mjs`, `./calculate-validation-score.mjs`, `./format-validation-result.mjs`, `./get-recommended-labels.mjs`, `./validate-issue-input.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
