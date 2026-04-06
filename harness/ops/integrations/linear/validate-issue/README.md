# ANQR Linear Issue Validation

## 1. Directory Overview

This directory contains validation utilities for Linear issues within the ANQR (Agentic Number Query Runner) harness system. It provides a comprehensive set of functions to validate issue inputs, check label categorization, determine priority levels, and format validation results. The validation module ensures that all Linear issues meet quality standards before being created or updated in the issue tracking system.

## 2. File Summaries

### Core Validation Files

- **validate-issue-input.mjs** - Main validation function that validates the complete issue input structure. Checks title (required, max 200 chars, no placeholder text), description (required, min 50 chars, must contain Problem/Root Cause/Impact/Solution/Acceptance Criteria sections), stateId (required, must be valid STATE), labelIds (at least one required, must be valid LABELS), priority (0-4 range), and estimate (1-20 range). Returns validation result with errors, warnings, and recommendations.

- **format-validation-result.mjs** - Formats validation results into a human-readable string output. Displays validation status (passed/failed), score out of 100, lists errors that must be fixed, warnings for recommended improvements, and suggested recommendations.

- **calculate-validation-score.mjs** - Calculates a numeric validation score (0-100) based on errors and warnings. Applies 20-point penalty per error and 5-point penalty per warning, then rounds to 2 decimal places.

- **validate-categorization.mjs** - Validates label combinations for Linear issues. Imports LABELS from linear-client and defines valid label combinations including harness, governance, hygiene, product, release, growth, incident, research, and specific pairs like harness+hygiene and product+release.

- **get-issue-quality-checklist.mjs** - Generates a quality checklist for issue validation. Returns an array of checklist items checking title length, description sections (Problem, Root Cause, Impact, Solution, Acceptance Criteria), labels, state, priority, estimate, and absence of placeholder text.

- **get-recommended-labels.mjs** - Provides label recommendations based on current labels. If no labels are present, recommends "harness" as default. If only "harness" is present, recommends adding "hygiene" as a common secondary label.

### Priority and Scoring

- **determine-priority.mjs** - Maps impact levels to priority values. Converts impact strings (critical/urgent, high, normal, low) to Linear priority numbers (1-4), defaulting to normal (3) for unknown values.

- **priority-levels.mjs** - Exports priority level constants defining the priority scale: URGENT (1), HIGH (2), NORMAL (3), LOW (4), NONE (0).

### Entry Points

- **main.mjs** - CLI entry point that accepts a JSON file path as argument, parses the issue input, validates it, and prints the formatted result. Exits with code 1 if validation fails.

- **index.mjs** - Generated facade index that exports all public functions: validateIssueInput, calculateValidationScore, formatValidationResult, getIssueQualityChecklist, validateCategorization, getRecommendedLabels, determinePriority, PRIORITY_LEVELS, and main.

- **runtime.mjs** - Generated runtime carry-forward that imports from index.mjs and executes main() when run directly. Exports default object with all validation functions.

## 3. Overall Directory Function

This directory serves as the validation layer for Linear issue management in the ANQR harness. The validation system works as a pipeline: main.mjs accepts user input, validate-issue-input.mjs performs comprehensive checks across all issue fields, calculate-validation-score.mjs computes a quality score, and format-validation-result.mjs presents the results clearly.

The validation enforces quality standards by requiring specific description sections (Problem, Root Cause, Impact, Solution, Acceptance Criteria), validating label combinations against allowed patterns, checking for placeholder text (TODO/FIXME/PLACEHOLDER), and ensuring proper field constraints. This ensures all issues created through the harness meet consistent quality standards.

The module integrates with the broader linear-client.mjs for accessing STATES and LABELS constants, making it a critical component in maintaining issue creation quality across the project.

## 4. Usage Instructions

### CLI Usage

To validate an issue from a JSON file:

```bash
node ops/integrations/linear/validate-issue/main.mjs <issue-json-file>
```

Example:

```bash
node ops/integrations/linear/validate-issue/main.mjs issue-input.json
```

The JSON file should contain issue properties matching Linear's issue structure.

### Programmatic Usage

Import and use validation functions directly:

```javascript
import { validateIssueInput, formatValidationResult } from "./ops/integrations/linear/validate-issue/index.mjs";

const issueInput = {
  title: "Fix authentication bug",
  description: "## Problem\n...## Root Cause\n...## Impact\n...## Solution\n...## Acceptance Criteria\n...",
  stateId: "YOUR_STATE_ID",
  labelIds: ["harness-label-id"],
  priority: 2,
  estimate: 5,
};

const result = validateIssueInput(issueInput);
console.log(formatValidationResult(result));
```

### Validation Result Structure

The validation returns an object with:
- `valid` (boolean) - True if no errors found
- `errors` (array) - List of errors that must be fixed
- `warnings` (array) - List of warnings for recommended improvements
- `recommendations` (array) - Suggested improvements
- `score` (number) - Validation score from 0-100

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Provides STATES and LABELS constants for validation
- **../../lib/logger.mjs** - Logger module (referenced by other modules)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- JSON parsing capability (built-in)

### External Services

- **Linear** - Issue tracking platform (labels and states defined in linear-client.mjs)

## 6. Additional Comments

- **Quality Gate Design**: The validation module serves as a quality gate that prevents issues with missing information or improper formatting from being created in Linear. This ensures consistency across all issues managed by the harness.

- **Scoring System**: The 100-point scoring system provides a quick way to assess issue quality. Scores below 100 indicate areas needing improvement, though only errors (not warnings) cause validation failure.

- **Label Validation**: The valid label combinations are intentionally limited to enforce consistent categorization. This prevents arbitrary label combinations that could confuse issue tracking.

- **Description Sections**: The required sections (Problem, Root Cause, Impact, Solution, Acceptance Criteria) follow a standard issue template format that ensures all issues contain sufficient context for developers to understand and act on them.

- **Placeholder Detection**: The validation actively checks for placeholder text patterns (TODO, FIXME, PLACEHOLDER, template syntax like {{...}}) to ensure issues contain actual content rather than template remnants.