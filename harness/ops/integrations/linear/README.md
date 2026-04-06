# ANQR Linear Integrations

## 1. Directory Overview

This directory contains Linear transport, sync, and issue management utilities for the ANQR (Agentic
Number Query Runner) harness. It provides the core API client for interacting with Linear's issue
tracking system, along with various automation scripts for issue creation, review, hygiene, incident
management, and RAG (Retrieval Augmented Generation) integration. It currently contains 29 files and
18 subdirectories.

## 2. File Summaries

### Files

- **README-workflow.md** - Linear Agent Workflow Documentation providing AI agents with instructions and tools to interact with Linear effectively, including usage guide, best practices, and troubleshooting.
- **agent-workflow-create-issue.mjs** - Exports from `./agent-workflow-create-issue/index.mjs` and `./agent-workflow-create-issue/runtime.mjs`. Reusable workflow for AI agents to create Linear issues.
- **analyze-canceled-issues.mjs** - Exports from `./analyze-canceled-issues/index.mjs` and `./analyze-canceled-issues/runtime.mjs`. Analyzes canceled issues.
- **close-anq-1097.mjs** - Closes ANQ-1097 issue that's stuck in a loop. The referenced file was already deleted, and an evidence file confirms resolution.
- **close-reviewed-issues.mjs** - Closes issues verified in backlog review. Specifically handles ANQ-1089 (FIXED) and ANQ-1093 (DELETE/no longer applicable).
- **create-ast-audit-issues.mjs** - Creates 10 Linear issues for ANQ-1131: One AST per file refactor. Breaks down the harness/\*\* surface into phases covering core infrastructure, model integration, Linear, RAG, orchestration, runtime, notifications, governance, utilities, and cleanup.
- **create-issue-template.mjs** - Exports from `./create-issue-template/index.mjs` and `./create-issue-template/runtime.mjs`. Templates for issue creation.
- **create-linear-rag-issues.mjs** - Creates 5 Linear issues for ANQ-1120 Linear RAG integration covering export script, RAG builder, systemd services, search integration, and validation/monitoring.
- **create-run-file-change-hooks-bug.mjs** - Creates a Linear issue documenting the Codebuff SDK bug where run_file_change_hooks receives string instead of array for files parameter.
- **create-test-coverage-issues.mjs** - Creates 6 Linear issues for test coverage >80% initiative across domain core, application services, platform adapters, harness routing, testing infrastructure, and UI/analytics.
- **delete-sonar-issues.mjs** - Exports from `./delete-sonar-issues/index.mjs` and `./delete-sonar-issues/runtime.mjs`. Deletes Sonar-related issues.
- **deprioritize-test-coverage-issues.mjs** - Sets test coverage issues to low priority (P4), focusing instead on harness job stability, invalid tools, and Symphony features.
- **export-issues.mjs** - Exports from `./export-issues/index.mjs` and `./export-issues/runtime.mjs`. Exports Linear issues to JSON for RAG indexing.
- **get-discord-label-id.mjs** - Exports from `./get-discord-label-id/index.mjs` and `./get-discord-label-id/runtime.mjs`. Utility for retrieving Discord-related label IDs.
- **github-linear-sync-audit.mjs** - Exports from `./github-linear-sync-audit/index.mjs` and `./github-linear-sync-audit/runtime.mjs`. Validates GitHub-Linear sync operations.
- **incident-evidence.mjs** - Exports from `./incident-evidence/index.mjs`. Formats evidence for incidents.
- **incident-fingerprint.mjs** - Exports from `./incident-fingerprint/index.mjs`. Provides deduplication logic for incidents.
- **incident-manager.mjs** - Exports from `./incident-manager/index.mjs`. Handles incident creation and lifecycle management.
- **incident-resolution.mjs** - Exports from `./incident-resolution/index.mjs` and `./incident-resolution/runtime.mjs`. Resolution workflows for incidents.
- **issue-hygiene.mjs** - Exports from `./issue-hygiene/index.mjs` and `./issue-hygiene/runtime.mjs`. Cleanup automation for issue management.
- **linear-client.mjs** - Auto-generated facade exporting from `./linear-client/index.mjs`. The central API client for all Linear operations, providing functions like `createIssue`, `updateIssue`, `addComment`, `listIssuesByState`, `findOpenIssuesByTitle`, and constants for `STATES` and `LABELS`.
- **list-canceled-issues.mjs** - Lists all canceled Linear issues for review with details including priority, labels, dates, and description preview.
- **list-open-issues.mjs** - Lists all open Linear issues grouped by state (Backlog, Todo, In Progress, In Review, Blocked, Human Review) with summary by label.
- **reopen-marked-issues.mjs** - Exports from `./reopen-marked-issues/index.mjs` and `./reopen-marked-issues/runtime.mjs`. Reopens issues marked for reopening.
- **review-open-issues.mjs** - Exports from `./review-open-issues/index.mjs` and `./review-open-issues/runtime.mjs`. Review automation for open issues.
- **review-specified-issues.mjs** - Exports from `./review-specified-issues/index.mjs` and `./review-specified-issues/runtime.mjs`. Review specific issues by identifier.
- **test-agent-workflow.mjs** - Exports from `./test-agent-workflow/index.mjs` and `./test-agent-workflow/runtime.mjs`. Tests the agent workflow functionality.
- **update-anq-1063.mjs** - Updates ANQ-1063 to reflect that this is an OpenClaw Gateway integration issue, not a Codebuff SDK bug. Updates title, description, and investigation results.
- **validate-issue.mjs** - Exports from `./validate-issue/index.mjs` and `./validate-issue/runtime.mjs`. Validates Linear issue data and schemas.

### Child Directories

- **agent-workflow-create-issue/** - This directory contains the Linear issue creation workflow for the ANQR (Agentic Number Query Runner) harness.
- **analyze-canceled-issues/** - This directory contains automation for analyzing canceled Linear issues to identify which ones may have been incorrectly canceled and should potentially be reopened.
- **create-issue-template/** - This directory contains the Linear issue creation template system for the ANQR (Agentic Number Query Runner) harness.
- **delete-sonar-issues/** - This directory contains functionality to identify and delete Sonar-generated issues from Linear.
- **export-issues/** - This directory contains the Linear issue export functionality for the ANQR (Agentic Number Query Runner) harness.
- **get-discord-label-id/** - This directory contains a utility module for the ANQR (Agentic Number Query Runner) harness that manages Discord label identification in the Linear workspace.
- **github-linear-sync-audit/** - This directory contains automation for auditing the synchronization between GitHub Issues and Linear issue tracking.
- **incident-evidence/** - This directory contains incident evidence collection and formatting utilities for the ANQR (Agentic Number Query Runner) harness.
- **incident-fingerprint/** - This directory contains functionality for generating unique fingerprints for incidents in the ANQR (Agentic Number Query Runner) Linear integration.
- **incident-manager/** - This directory contains incident management functionality for the ANQR (Agentic Number Query Runner) harness.
- **incident-resolution/** - This directory contains automatic incident resolution functionality for the ANQR (Agentic Number Query Runner) harness.
- **issue-hygiene/** - This directory contains the Linear issue hygiene automation module for the ANQR (Agentic Number Query Runner) harness.
- **linear-client/** - This directory contains the Linear API client implementation for the ANQR (Agentic Number Query Runner) harness.
- **reopen-marked-issues/** - This directory contains automation for reopening canceled Linear issues that have been marked for reevaluation.
- **review-open-issues/** - This directory contains automation for reviewing open Linear issues and providing recommendations for issue resolution.
- **review-specified-issues/** - This directory contains automation for reviewing and updating specific Linear issues based on pre- defined completion checks.
- **test-agent-workflow/** - This directory contains a comprehensive test suite for verifying the Linear agent workflow functionality within the ANQR (Agentic Number Query Runner) harness.
- **validate-issue/** - This directory contains validation utilities for Linear issues within the ANQR (Agentic Number Query Runner) harness system.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
