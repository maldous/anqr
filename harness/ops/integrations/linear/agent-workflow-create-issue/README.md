# ANQR Linear - Agent Workflow Create Issue

## 1. Directory Overview

This directory contains the Linear issue creation workflow for the ANQR (Agentic Number Query
Runner) harness. It provides both a CLI tool and a programmatic API for creating Linear issues with
validation, priority management, label handling, and state transitions. The module is part of the
Linear integrations layer and supports both command-line usage and programmatic imports. It
currently contains 12 files and 0 subdirectories.

## 2. File Summaries

### Files

- **args.mjs** - CLI argument parsing using Node.js `parseArgs`. Defines options: `--title/-t` (required), `--description/-d`, `--priority/-p` (default: 3), `--labels/-l` (default: harness), `--stateId/-s` (default: backlog), `--help/-h`. Exports `args` object.
- **available-labels.mjs** - Re-exports available labels from linear-client.mjs. Exports `AVAILABLE_LABELS` array.
- **available-states.mjs** - Re-exports available states from linear-client.mjs. Exports `AVAILABLE_STATES` array.
- **create-linear-issue-workflow.mjs** - Main workflow orchestration module that handles the complete issue creation process. Validates inputs, displays issue details, creates the issue via Linear API, and reports success/error outcomes. Exports `createLinearIssueWorkflow()` async function.
- **get-priority-name.mjs** - Maps numeric priority (0-4) to human-readable names: 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low. Exports `getPriorityName(priority)` function.
- **index.mjs** - Facade index exporting all public API members: AVAILABLE_STATES, AVAILABLE_LABELS, args, showHelp, validatePriority, validateStateId, parseLabels, createLinearIssueWorkflow, getPriorityName, workflowCreateLinearIssue.
- **parse-labels.mjs** - Label parsing and validation. Splits comma-separated label string, validates against available labels from LABELS constant, and returns label IDs. Exports `parseLabels(labelString)` function.
- **runtime.mjs** - CLI entry point that imports and executes `createLinearIssueWorkflow()` when run directly.
- **show-help.mjs** - Help text generator displaying usage instructions, available options, and examples. Exports `showHelp()` function.
- **validate-priority.mjs** - Priority validation ensuring value is a number between 0 and 4. Throws error for invalid values. Exports `validatePriority(priority)` function.
- **validate-state-id.mjs** - State ID validation against available states from linear-client.mjs. Throws error for invalid state IDs. Exports `validateStateId(stateId)` function.
- **workflow-create-linear-issue.mjs** - Programmatic API wrapper that allows creating Linear issues from code by passing parameters object instead of CLI arguments. Useful for automated workflows and scripts. Exports `workflowCreateLinearIssue(params)` async function.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/agent-workflow-create-issue/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
