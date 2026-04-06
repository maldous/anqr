# ANQR Linear Agent Workflow Test Suite

## 1. Directory Overview

This directory contains a comprehensive test suite for verifying the Linear agent workflow
functionality within the ANQR (Agentic Number Query Runner) harness. The test suite validates that
AI agents can read instructions and create Linear issues following best practices for
categorization, formatting, priority handling, and state management. It currently contains 17 files
and 0 subdirectories.

## 2. File Summaries

### Files

- **assert-condition.mjs** - Assertion helper that throws errors when conditions are not met, logging results appropriately.
- **get-current-status.mjs** - Pre-flight check that validates environment variables, required files, and Linear client tool availability.
- **index.mjs** - Facade index that exports all test functions, utilities, and constants for external consumption.
- **log-test-result.mjs** - Logging utility that records test results with timestamps and console output formatting.
- **print-completion-summary.mjs** - Prints completion summary showing goal achievement and acceptance criteria status.
- **print-test-results.mjs** - Displays detailed test results with success metrics, evidence summary, workflow capabilities, resources for agents, programmatic usage examples, and next steps.
- **results.mjs** - Mutable results object tracking passed/failed test counts and test case details.
- **run-agent-workflow-tests.mjs** - Main test runner that executes all 8 test suites and displays comprehensive results including acceptance criteria verification, best practices implemented, and extensibility options.
- **runtime.mjs** - CLI entry point that executes the full test suite and exits with appropriate status code (0 for success, 1 for failure).
- **test-basic-issue-creation.mjs** - Test Suite 1: Verifies basic Linear issue creation, identifier format (ANQ-####), and URL construction.
- **test-error-handling.mjs** - Test Suite 6: Validates input validation for missing required parameters, invalid state IDs, invalid labels, and out-of-range priority values.
- **test-issue-categorization.mjs** - Test Suite 2: Validates label application with various combinations (harness, bug, documentation, governance, product, feature).
- **test-issue-formatting.mjs** - Test Suite 3: Tests comprehensive issue formatting with structured descriptions including summary, scope class, required context, touched paths, constraints, verification commands, expected evidence, and escalation rules.
- **test-priority-handling.mjs** - Test Suite 4: Verifies all priority levels (0-4: None, Urgent, High, Normal, Low) are correctly preserved.
- **test-programmatic-usage.mjs** - Test Suite 7: Verifies the workflow function can be imported and used programmatically.
- **test-state-handling.mjs** - Test Suite 5: Tests state assignment (backlog, todo, inProgress, inReview, done, canceled) and state transitions.
- **test-success-reporting.mjs** - Test Suite 8: Validates success reporting format including issue identifier, URL construction, state, priority, and next steps.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/test-agent-workflow/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
