# Test Agent Workflow

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `assert-condition.mjs`, `get-current-status.mjs`, `index.mjs`, `log-test-result.mjs`, and others.

## Contents

- 17 immediate files
- 0 child directories

## Key Files

- `assert-condition.mjs` - Exports `assertCondition`, the main helper defined in this file.
- `get-current-status.mjs` - Exports `getCurrentStatus`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `log-test-result.mjs` - Exports `logTestResult`, the main helper defined in this file.
- `print-completion-summary.mjs` - Exports `printCompletionSummary`, the main helper defined in this file.
- `print-test-results.mjs` - Exports `printTestResults`, the main helper defined in this file.
- `results.mjs` - Exports `results`, a shared constant or state value used by sibling modules.
- `run-agent-workflow-tests.mjs` - Exports `runAgentWorkflowTests`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `test-basic-issue-creation.mjs` - Exports `testBasicIssueCreation`, the main helper defined in this file.
- `test-error-handling.mjs` - Exports `testErrorHandling`, the main helper defined in this file.
- `test-issue-categorization.mjs` - Exports `testIssueCategorization`, the main helper defined in this file.
- `test-issue-formatting.mjs` - Exports `testIssueFormatting`, the main helper defined in this file.
- `test-priority-handling.mjs` - Exports `testPriorityHandling`, the main helper defined in this file.
- `test-programmatic-usage.mjs` - Exports `testProgrammaticUsage`, the main helper defined in this file.
- `test-state-handling.mjs` - Exports `testStateHandling`, the main helper defined in this file.
- `test-success-reporting.mjs` - Exports `testSuccessReporting`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 17 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
