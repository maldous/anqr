# ANQR Linear Agent Workflow Test Suite

## 1. Directory Overview

This directory implements **ANQR Linear Agent Workflow Test Suite** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 17 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **assert-condition.mjs** - Exports `assertCondition`, which implements assert condition.
- **get-current-status.mjs** - Exports `getCurrentStatus`, which gets current status.
- **index.mjs** - Facade module that re-exports public members from `./results.mjs`, `./log-test-result.mjs`, `./assert-condition.mjs`, `./test-basic-issue-creation.mjs`, `./test-issue-categorization.mjs`, `./test-issue-formatting.mjs`, and 7 more siblings.
- **log-test-result.mjs** - Exports `logTestResult`, which implements log test result.
- **print-completion-summary.mjs** - Exports `printCompletionSummary`, which implements print completion summary.
- **print-test-results.mjs** - Exports `printTestResults`, which implements print test results.
- **results.mjs** - Exports `results`, which implements results.
- **run-agent-workflow-tests.mjs** - Exports `runAgentWorkflowTests`, which runs agent workflow tests.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **test-basic-issue-creation.mjs** - Exports `testBasicIssueCreation`, which implements test basic issue creation.
- **test-error-handling.mjs** - Exports `testErrorHandling`, which implements test error handling.
- **test-issue-categorization.mjs** - Exports `testIssueCategorization`, which implements test issue categorization.
- **test-issue-formatting.mjs** - Exports `testIssueFormatting`, which implements test issue formatting.
- **test-priority-handling.mjs** - Exports `testPriorityHandling`, which implements test priority handling.
- **test-programmatic-usage.mjs** - Exports `testProgrammaticUsage`, which implements test programmatic usage.
- **test-state-handling.mjs** - Exports `testStateHandling`, which implements test state handling.
- **test-success-reporting.mjs** - Exports `testSuccessReporting`, which implements test success reporting.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, network/API integration, Linear integration, and Discord integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/linear/test-agent-workflow/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs/promises`
- **Internal relative modules** - `../agent-workflow-create-issue.mjs`, `./assert-condition.mjs`, `./index.mjs`, `./log-test-result.mjs`, `./print-completion-summary.mjs`, `./print-test-results.mjs`, `./results.mjs`, `./test-basic-issue-creation.mjs`, `./test-error-handling.mjs`, `./test-issue-categorization.mjs`, `./test-issue-formatting.mjs`, `./test-priority-handling.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
