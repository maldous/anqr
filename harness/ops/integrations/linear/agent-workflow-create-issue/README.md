# ANQR Linear - Agent Workflow Create Issue

## 1. Directory Overview

This directory implements **ANQR Linear - Agent Workflow Create Issue** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 12 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **args.mjs** - Exports `args`, which implements args.
- **available-labels.mjs** - Exports `AVAILABLE_LABELS`, a shared constant used by sibling modules.
- **available-states.mjs** - Exports `AVAILABLE_STATES`, a shared constant used by sibling modules.
- **create-linear-issue-workflow.mjs** - Exports `createLinearIssueWorkflow`, which creates linear issue workflow.
- **get-priority-name.mjs** - Exports `getPriorityName`, which gets priority name.
- **index.mjs** - Facade module that re-exports public members from `./available-states.mjs`, `./available-labels.mjs`, `./args.mjs`, `./show-help.mjs`, `./validate-priority.mjs`, `./validate-state-id.mjs`, and 4 more siblings.
- **parse-labels.mjs** - Exports `parseLabels`, which parses labels.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **show-help.mjs** - Exports `showHelp`, which shows help.
- **validate-priority.mjs** - Exports `validatePriority`, which validates priority.
- **validate-state-id.mjs** - Exports `validateStateId`, which validates state id.
- **workflow-create-linear-issue.mjs** - Exports `workflowCreateLinearIssue`, which implements workflow create linear issue.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, and Linear integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/linear/agent-workflow-create-issue/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:util`
- **Internal relative modules** - `../linear-client.mjs`, `./args.mjs`, `./available-labels.mjs`, `./available-states.mjs`, `./create-linear-issue-workflow.mjs`, `./get-priority-name.mjs`, `./index.mjs`, `./parse-labels.mjs`, `./show-help.mjs`, `./validate-priority.mjs`, `./validate-state-id.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
