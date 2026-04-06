# ANQR Linear - Agent Workflow Create Issue

## 1. Directory Overview

This directory contains the Linear issue creation workflow for the ANQR (Agentic Number Query Runner) harness. It provides both a CLI tool and a programmatic API for creating Linear issues with validation, priority management, label handling, and state transitions. The module is part of the Linear integrations layer and supports both command-line usage and programmatic imports.

## 2. File Summaries

### Core Workflow Files

- **create-linear-issue-workflow.mjs** - Main workflow orchestration module that handles the complete issue creation process. Validates inputs, displays issue details, creates the issue via Linear API, and reports success/error outcomes. Exports `createLinearIssueWorkflow()` async function.

- **workflow-create-linear-issue.mjs** - Programmatic API wrapper that allows creating Linear issues from code by passing parameters object instead of CLI arguments. Useful for automated workflows and scripts. Exports `workflowCreateLinearIssue(params)` async function.

### Argument Handling

- **args.mjs** - CLI argument parsing using Node.js `parseArgs`. Defines options: `--title/-t` (required), `--description/-d`, `--priority/-p` (default: 3), `--labels/-l` (default: harness), `--stateId/-s` (default: backlog), `--help/-h`. Exports `args` object.

- **show-help.mjs** - Help text generator displaying usage instructions, available options, and examples. Exports `showHelp()` function.

### Validation

- **validate-priority.mjs** - Priority validation ensuring value is a number between 0 and 4. Throws error for invalid values. Exports `validatePriority(priority)` function.

- **validate-state-id.mjs** - State ID validation against available states from linear-client.mjs. Throws error for invalid state IDs. Exports `validateStateId(stateId)` function.

- **parse-labels.mjs** - Label parsing and validation. Splits comma-separated label string, validates against available labels from LABELS constant, and returns label IDs. Exports `parseLabels(labelString)` function.

### Helper Utilities

- **get-priority-name.mjs** - Maps numeric priority (0-4) to human-readable names: 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low. Exports `getPriorityName(priority)` function.

- **available-states.mjs** - Re-exports available states from linear-client.mjs. Exports `AVAILABLE_STATES` array.

- **available-labels.mjs** - Re-exports available labels from linear-client.mjs. Exports `AVAILABLE_LABELS` array.

### Module Structure

- **index.mjs** - Facade index exporting all public API members: AVAILABLE_STATES, AVAILABLE_LABELS, args, showHelp, validatePriority, validateStateId, parseLabels, createLinearIssueWorkflow, getPriorityName, workflowCreateLinearIssue.

- **runtime.mjs** - CLI entry point that imports and executes `createLinearIssueWorkflow()` when run directly.

## 3. Overall Directory Function

This directory provides a complete Linear issue creation solution with two usage modes:

**CLI Mode:** Run the script directly with command-line arguments to create issues interactively. Supports all issue properties (title, description, priority, labels, state).

**Programmatic Mode:** Import and call `workflowCreateLinearIssue(params)` from other scripts to create issues programmatically with a parameters object.

The workflow enforces validation at every step: priority must be 0-4, state must be valid, labels must exist in the LABELS constant. On success, it outputs the issue URL, ID, identifier, and other details. On failure, it provides helpful error messages including environment variable requirements.

This module integrates with the broader Linear integration layer, using `../linear-client.mjs` for API operations and constants like STATES, LABELS, and TEAM_ID.

## 4. Usage Instructions

### CLI Usage

```bash
# Show help
node ops/integrations/linear/agent-workflow-create-issue.mjs --help

# Create a high-priority harness issue
node ops/integrations/linear/agent-workflow-create-issue.mjs \
  --title "Fix validation error in QR generation" \
  --description "QR generation fails when input contains special characters" \
  --priority 2 \
  --labels harness,bug

# Create a normal-priority documentation issue
node ops/integrations/linear/agent-workflow-create-issue.mjs \
  --title "Update README with new agent workflow" \
  --description "Document the new agent workflow for creating Linear issues" \
  --labels documentation,governance

# Create issue in a specific state
node ops/integrations/linear/agent-workflow-create-issue.mjs \
  --title "New feature request" \
  --stateId "triage"
```

### Programmatic Usage

```javascript
import { workflowCreateLinearIssue } from "./ops/integrations/linear/agent-workflow-create-issue.mjs";

const issue = await workflowCreateLinearIssue({
  title: "Fix validation error",
  description: "QR generation fails with special characters",
  priority: 2,
  labels: ["harness", "bug"],
  stateId: "backlog",
});
```

### Priority Values

- 0 = None
- 1 = Urgent
- 2 = High
- 3 = Normal (default)
- 4 = Low

### Available States

Run with `--help` to see current available states from linear-client.mjs.

### Available Labels

Run with `--help` to see current available labels from linear-client.mjs (typically: harness, bug, feature, documentation, governance, etc.).

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Linear API client providing `createIssue`, `STATES`, `LABELS`, and `TEAM_ID` constants

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid `LINEAR_API_KEY` environment variable
- Network access to Linear API (https://linear.app/anqr)

### Environment Variables

- `LINEAR_API_KEY` - Required. Get from https://linear.app/settings/api

## 6. Additional Comments

- **Default Values:** Priority defaults to 3 (Normal), labels default to "harness", state defaults to "backlog", estimate defaults to 1 point.

- **Fail-Fast Validation:** All validation happens before API call, preventing wasted requests with invalid inputs.

- **Dual Interface:** Supports both CLI (for human use) and programmatic (for automation) usage patterns.

- **Error Handling:** Comprehensive error messages guide users to correct issues, including environment variable setup instructions.

- **Success Output:** On successful creation, displays issue URL for easy navigation to Linear.
