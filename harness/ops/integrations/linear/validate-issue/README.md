# ANQR Linear Issue Validation

## 1. Directory Overview

This directory contains validation utilities for Linear issues within the ANQR (Agentic Number Query
Runner) harness system. It provides a comprehensive set of functions to validate issue inputs, check
label categorization, determine priority levels, and format validation results. The validation
module ensures that all Linear issues meet quality standards before being created or updated in the
issue tracking system. It currently contains 11 files and 0 subdirectories.

## 2. File Summaries

### Files

- **calculate-validation-score.mjs** - Calculates a numeric validation score (0-100) based on errors and warnings. Applies 20-point penalty per error and 5-point penalty per warning, then rounds to 2 decimal places.
- **determine-priority.mjs** - Maps impact levels to priority values. Converts impact strings (critical/urgent, high, normal, low) to Linear priority numbers (1-4), defaulting to normal (3) for unknown values.
- **format-validation-result.mjs** - Formats validation results into a human-readable string output. Displays validation status (passed/failed), score out of 100, lists errors that must be fixed, warnings for recommended improvements, and suggested recommendations.
- **get-issue-quality-checklist.mjs** - Generates a quality checklist for issue validation. Returns an array of checklist items checking title length, description sections (Problem, Root Cause, Impact, Solution, Acceptance Criteria), labels, state, priority, estimate, and absence of placeholder text.
- **get-recommended-labels.mjs** - Provides label recommendations based on current labels. If no labels are present, recommends "harness" as default. If only "harness" is present, recommends adding "hygiene" as a common secondary label.
- **index.mjs** - Generated facade index that exports all public functions: validateIssueInput, calculateValidationScore, formatValidationResult, getIssueQualityChecklist, validateCategorization, getRecommendedLabels, determinePriority, PRIORITY_LEVELS, and main.
- **main.mjs** - CLI entry point that accepts a JSON file path as argument, parses the issue input, validates it, and prints the formatted result. Exits with code 1 if validation fails.
- **priority-levels.mjs** - Exports priority level constants defining the priority scale: URGENT (1), HIGH (2), NORMAL (3), LOW (4), NONE (0).
- **runtime.mjs** - Generated runtime carry-forward that imports from index.mjs and executes main() when run directly. Exports default object with all validation functions.
- **validate-categorization.mjs** - Validates label combinations for Linear issues. Imports LABELS from linear-client and defines valid label combinations including harness, governance, hygiene, product, release, growth, incident, research, and specific pairs like harness+hygiene and product+release.
- **validate-issue-input.mjs** - Main validation function that validates the complete issue input structure. Checks title (required, max 200 chars, no placeholder text), description (required, min 50 chars, must contain Problem/Root Cause/Impact/Solution/Acceptance Criteria sections), stateId (required, must be valid STATE), labelIds (at least one required, must be valid LABELS), priority (0-4 range), and estimate (1-20 range). Returns validation result with errors, warnings, and recommendations.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/validate-issue/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
