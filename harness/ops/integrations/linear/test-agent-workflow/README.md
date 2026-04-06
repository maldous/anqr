# ANQR Linear Agent Workflow Test Suite

## 1. Directory Overview

This directory contains a comprehensive test suite for verifying the Linear agent workflow functionality within the ANQR (Agentic Number Query Runner) harness. The test suite validates that AI agents can read instructions and create Linear issues following best practices for categorization, formatting, priority handling, and state management.

The test suite is designed to ensure the `workflowCreateLinearIssue()` function meets all acceptance criteria and provides reliable issue creation capabilities for autonomous AI agents.

## 2. File Summaries

### Test Infrastructure

- **results.mjs** - Mutable results object tracking passed/failed test counts and test case details.
- **log-test-result.mjs** - Logging utility that records test results with timestamps and console output formatting.
- **assert-condition.mjs** - Assertion helper that throws errors when conditions are not met, logging results appropriately.

### Test Suites

- **test-basic-issue-creation.mjs** - Test Suite 1: Verifies basic Linear issue creation, identifier format (ANQ-####), and URL construction.
- **test-issue-categorization.mjs** - Test Suite 2: Validates label application with various combinations (harness, bug, documentation, governance, product, feature).
- **test-issue-formatting.mjs** - Test Suite 3: Tests comprehensive issue formatting with structured descriptions including summary, scope class, required context, touched paths, constraints, verification commands, expected evidence, and escalation rules.
- **test-priority-handling.mjs** - Test Suite 4: Verifies all priority levels (0-4: None, Urgent, High, Normal, Low) are correctly preserved.
- **test-state-handling.mjs** - Test Suite 5: Tests state assignment (backlog, todo, inProgress, inReview, done, canceled) and state transitions.
- **test-error-handling.mjs** - Test Suite 6: Validates input validation for missing required parameters, invalid state IDs, invalid labels, and out-of-range priority values.
- **test-programmatic-usage.mjs** - Test Suite 7: Verifies the workflow function can be imported and used programmatically.
- **test-success-reporting.mjs** - Test Suite 8: Validates success reporting format including issue identifier, URL construction, state, priority, and next steps.

### Orchestration

- **run-agent-workflow-tests.mjs** - Main test runner that executes all 8 test suites and displays comprehensive results including acceptance criteria verification, best practices implemented, and extensibility options.
- **get-current-status.mjs** - Pre-flight check that validates environment variables, required files, and Linear client tool availability.
- **runtime.mjs** - CLI entry point that executes the full test suite and exits with appropriate status code (0 for success, 1 for failure).

### Output Utilities

- **print-test-results.mjs** - Displays detailed test results with success metrics, evidence summary, workflow capabilities, resources for agents, programmatic usage examples, and next steps.
- **print-completion-summary.mjs** - Prints completion summary showing goal achievement and acceptance criteria status.

### Facade

- **index.mjs** - Facade index that exports all test functions, utilities, and constants for external consumption.

## 3. Overall Directory Function

This directory serves as the validation layer for the Linear agent workflow functionality. The test suite ensures that:

- **Issue Creation**: AI agents can successfully create Linear issues using the provided workflow function.
- **Best Practices**: Issues follow established best practices for categorization (label taxonomy), formatting (structured descriptions), priority levels, and state management.
- **Reliability**: Error handling works correctly for invalid inputs, and success reporting provides complete information to users.
- **Extensibility**: The workflow can be extended with new parameters, specialized workflows, validation steps, automation triggers, and reporting integration.

The test suite validates all 5 acceptance criteria:
1. Linear issue is created successfully using provided tools
2. Issue has appropriate title and description
3. Issue is properly categorized with labels
4. Issue is assigned to correct team and state
5. Issue URL is returned and displayed

## 4. Usage Instructions

### Running the Test Suite

```bash
# Via runtime (recommended)
node ops/integrations/linear/test-agent-workflow/runtime.mjs
```

Or directly:

```bash
node ops/integrations/linear/test-agent-workflow/index.mjs
```

### Prerequisites

- **LINEAR_API_KEY** environment variable must be set
- Required files must exist:
  - AGENTS.md
  - README.md
  - harness/ops/integrations/linear/linear-client.mjs
  - harness/ops/integrations/linear/agent-workflow-create-issue.mjs
  - harness/ops/integrations/linear/README-workflow.md

### Test Output

The test suite displays:
- Current system status check
- 8 comprehensive test suites with pass/fail results
- Final test results with success rate percentage
- Acceptance criteria verification
- Evidence requirements summary
- Best practices implemented
- Extensibility options for future development

### Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

## 5. Dependencies

### Internal Dependencies

- **../agent-workflow-create-issue.mjs** - The workflow function being tested (`workflowCreateLinearIssue`)
- **../../linear-client.mjs** - Linear API client providing `createIssue()`, `STATES`, `LABELS`, `TEAM_ID` constants

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid LINEAR_API_KEY environment variable
- Network access to Linear API

### External Services

- **Linear** - Issue tracking platform (https://linear.app/anqr)

## 6. Additional Comments

- **Test-Driven Design**: The test suite follows a comprehensive test-driven approach with 8 distinct test suites covering all aspects of issue creation.
- **Acceptance Criteria Focus**: Every test verifies specific acceptance criteria, ensuring the workflow meets all requirements for production use.
- **Label Taxonomy**: Tests validate the established label taxonomy including: harness, governance, hygiene, product, release, growth, incident, research, bug, reliability, documentation, feature.
- **Best Practices Enforcement**: The test suite verifies that issues follow best practices including descriptive titles, structured descriptions with required sections, appropriate label application, correct priority levels, and proper state assignment.
- **Error-First Validation**: The error handling test suite validates that the workflow correctly rejects invalid inputs with helpful error messages.
- **Success Reporting**: All tests verify that success is reported back with complete information including issue URL, identifier, state, priority, and next steps.
- **Production Ready**: When all tests pass, the workflow is considered ready for production use by autonomous AI agents.