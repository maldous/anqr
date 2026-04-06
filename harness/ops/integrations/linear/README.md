# ANQR Linear Integrations

## 1. Directory Overview

This directory contains Linear transport, sync, and issue management utilities for the ANQR (Agentic Number Query Runner) harness. It provides the core API client for interacting with Linear's issue tracking system, along with various automation scripts for issue creation, review, hygiene, incident management, and RAG (Retrieval Augmented Generation) integration.

The directory follows a decomposition pattern where original monolithic files have been split into sibling modules, with facade files (ending in `.mjs`) re-exporting from matching directories containing `index.mjs` and `runtime.mjs` modules.

## 2. File Summaries

### Core Client

- **linear-client.mjs** - Auto-generated facade exporting from `./linear-client/index.mjs`. The central API client for all Linear operations, providing functions like `createIssue`, `updateIssue`, `addComment`, `listIssuesByState`, `findOpenIssuesByTitle`, and constants for `STATES` and `LABELS`.

### Facade Modules (Auto-Generated)

These files are auto-generated facades that re-export from sibling modules under matching directories:

- **get-discord-label-id.mjs** - Exports from `./get-discord-label-id/index.mjs` and `./get-discord-label-id/runtime.mjs`. Utility for retrieving Discord-related label IDs.
- **incident-manager.mjs** - Exports from `./incident-manager/index.mjs`. Handles incident creation and lifecycle management.
- **incident-fingerprint.mjs** - Exports from `./incident-fingerprint/index.mjs`. Provides deduplication logic for incidents.
- **validate-issue.mjs** - Exports from `./validate-issue/index.mjs` and `./validate-issue/runtime.mjs`. Validates Linear issue data and schemas.
- **github-linear-sync-audit.mjs** - Exports from `./github-linear-sync-audit/index.mjs` and `./github-linear-sync-audit/runtime.mjs`. Validates GitHub-Linear sync operations.
- **issue-hygiene.mjs** - Exports from `./issue-hygiene/index.mjs` and `./issue-hygiene/runtime.mjs`. Cleanup automation for issue management.
- **incident-resolution.mjs** - Exports from `./incident-resolution/index.mjs` and `./incident-resolution/runtime.mjs`. Resolution workflows for incidents.
- **review-open-issues.mjs** - Exports from `./review-open-issues/index.mjs` and `./review-open-issues/runtime.mjs`. Review automation for open issues.
- **incident-evidence.mjs** - Exports from `./incident-evidence/index.mjs`. Formats evidence for incidents.
- **export-issues.mjs** - Exports from `./export-issues/index.mjs` and `./export-issues/runtime.mjs`. Exports Linear issues to JSON for RAG indexing.
- **create-issue-template.mjs** - Exports from `./create-issue-template/index.mjs` and `./create-issue-template/runtime.mjs`. Templates for issue creation.
- **analyze-canceled-issues.mjs** - Exports from `./analyze-canceled-issues/index.mjs` and `./analyze-canceled-issues/runtime.mjs`. Analyzes canceled issues.
- **review-specified-issues.mjs** - Exports from `./review-specified-issues/index.mjs` and `./review-specified-issues/runtime.mjs`. Review specific issues by identifier.
- **agent-workflow-create-issue.mjs** - Exports from `./agent-workflow-create-issue/index.mjs` and `./agent-workflow-create-issue/runtime.mjs`. Reusable workflow for AI agents to create Linear issues.
- **test-agent-workflow.mjs** - Exports from `./test-agent-workflow/index.mjs` and `./test-agent-workflow/runtime.mjs`. Tests the agent workflow functionality.
- **reopen-marked-issues.mjs** - Exports from `./reopen-marked-issues/index.mjs` and `./reopen-marked-issues/runtime.mjs`. Reopens issues marked for reopening.
- **delete-sonar-issues.mjs** - Exports from `./delete-sonar-issues/index.mjs` and `./delete-sonar-issues/runtime.mjs`. Deletes Sonar-related issues.

### Utility Scripts

- **close-reviewed-issues.mjs** - Closes issues verified in backlog review. Specifically handles ANQ-1089 (FIXED) and ANQ-1093 (DELETE/no longer applicable).
- **list-canceled-issues.mjs** - Lists all canceled Linear issues for review with details including priority, labels, dates, and description preview.
- **list-open-issues.mjs** - Lists all open Linear issues grouped by state (Backlog, Todo, In Progress, In Review, Blocked, Human Review) with summary by label.
- **close-anq-1097.mjs** - Closes ANQ-1097 issue that's stuck in a loop. The referenced file was already deleted, and an evidence file confirms resolution.
- **update-anq-1063.mjs** - Updates ANQ-1063 to reflect that this is an OpenClaw Gateway integration issue, not a Codebuff SDK bug. Updates title, description, and investigation results.

### Issue Creation Scripts

- **create-ast-audit-issues.mjs** - Creates 10 Linear issues for ANQ-1131: One AST per file refactor. Breaks down the harness/** surface into phases covering core infrastructure, model integration, Linear, RAG, orchestration, runtime, notifications, governance, utilities, and cleanup.
- **create-test-coverage-issues.mjs** - Creates 6 Linear issues for test coverage >80% initiative across domain core, application services, platform adapters, harness routing, testing infrastructure, and UI/analytics.
- **create-linear-rag-issues.mjs** - Creates 5 Linear issues for ANQ-1120 Linear RAG integration covering export script, RAG builder, systemd services, search integration, and validation/monitoring.
- **create-run-file-change-hooks-bug.mjs** - Creates a Linear issue documenting the Codebuff SDK bug where run_file_change_hooks receives string instead of array for files parameter.
- **deprioritize-test-coverage-issues.mjs** - Sets test coverage issues to low priority (P4), focusing instead on harness job stability, invalid tools, and Symphony features.

### Documentation

- **README-workflow.md** - Linear Agent Workflow Documentation providing AI agents with instructions and tools to interact with Linear effectively, including usage guide, best practices, and troubleshooting.

## 3. Overall Directory Function

This directory serves as the central integration layer between the ANQR harness and Linear's issue tracking system. The files work together to provide:

- **API Connectivity**: The linear-client.mjs provides a robust API client with authentication, error handling, and type-safe operations for all Linear interactions.
- **Issue Automation**: Various scripts automate common issue management tasks like closing reviewed issues, listing issues by state, and bulk updates.
- **Incident Management**: Dedicated modules handle incident creation, fingerprinting (deduplication), evidence formatting, and resolution workflows.
- **Agent Workflows**: The agent-workflow-create-issue.mjs provides a reusable pattern for AI agents to create properly formatted Linear issues following best practices.
- **RAG Integration**: The export-issues.mjs enables nightly exports of Linear issues to JSON for downstream RAG indexing, allowing AI agents to search historical Linear context.
- **Governance**: Issue hygiene and review automation help maintain a healthy backlog.

The directory follows a decomposition pattern where original files have been split into sibling modules (index.mjs and runtime.mjs) with facade files (_.mjs) providing backward-compatible re-exports.

## 4. Usage Instructions

### Basic Usage

```bash
# List open issues
node ops/integrations/linear/list-open-issues.mjs

# List canceled issues
node ops/integrations/linear/list-canceled-issues.mjs

# Export issues for RAG
node ops/integrations/linear/export-issues.mjs
```

### Issue Creation

```bash
# Create AST audit issues
node ops/integrations/linear/create-ast-audit-issues.mjs

# Create test coverage issues
node ops/integrations/linear/create-test-coverage-issues.mjs

# Create Linear RAG issues
node ops/integrations/linear/create-linear-rag-issues.mjs
```

### Agent Workflow (for AI agents)

```bash
# Using the reusable workflow
node ops/integrations/linear/agent-workflow-create-issue.mjs \
  --title "Fix validation error in QR generation" \
  --description "QR generation fails when input contains special characters" \
  --priority 2 \
  --labels harness,bug
```

### Programmatic Usage

```javascript
import { createIssue, updateIssue, addComment, STATES, LABELS } from "./ops/integrations/linear/linear-client.mjs";

// Create an issue
const issue = await createIssue({
  title: "New issue title",
  description: "Issue description with markdown",
  stateId: STATES.backlog,
  labelIds: [LABELS.harness],
  priority: 2,
});
```

## 5. Dependencies

### Internal Dependencies

- **../../lib/logger.mjs** - Logger factory for all scripts
- **../../core/symphony-config.mjs** - Configuration constants
- **../../lib/rag/** - RAG infrastructure (export-issues.mjs uses embeddings and vector-store)

### External Dependencies

- **Linear API** - Requires `LINEAR_API_KEY` environment variable
- **Node.js** - ESM modules with .mjs extension
- **Ollama** - For embeddings generation (RAG features)

### Environment Variables

- `LINEAR_API_KEY` - Your Linear API key (required for all operations)
- `ANQR_SYMPHONY_STATE_DIR` - State directory (used by some scripts)

## 6. Additional Comments

- **Facade Pattern**: Many files follow an auto-generated facade pattern where `_.mjs` files re-export from `./_/index.mjs` and `./_/runtime.mjs`. This decomposition allows for better organization while maintaining backward compatibility.

- **Incident Management**: The directory has comprehensive incident management capabilities including fingerprinting (deduplication), evidence formatting, and resolution workflows. This is critical for the ANQR operational model.

- **RAG Integration**: The Linear RAG integration (ANQ-1120) enables AI agents to semantically search historical Linear issues. This is a key capability for agents to understand prior work and avoid duplicate efforts.

- **Agent Workflows**: The agent-workflow-create-issue.mjs provides a standardized pattern for AI agents to create issues, ensuring consistent formatting, proper labeling, and appropriate priority assignment.

- **Issue Templates**: The create-issue-template.mjs and various issue creation scripts demonstrate best practices for structuring Linear issues with proper sections (Summary, Scope Class, Owned Surfaces, Constraints, Definition Of Done, Verification, Evidence Payload, Escalate If).

- **Governance**: The directory supports governance automation through issue hygiene, review automation, and bulk update capabilities.

- **Error Handling**: All scripts include proper error handling with descriptive messages and appropriate exit codes.