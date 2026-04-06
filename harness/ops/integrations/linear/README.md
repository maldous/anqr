# ANQR Linear Integrations

## 1. Directory Overview

This directory implements **ANQR Linear Integrations** within the ANQR harness. Key immediate entries include `linear-client.mjs`, `create-linear-rag-issues.mjs`, `create-ast-audit-issues.mjs`, `create-run-file-change-hooks-bug.mjs`, and `create-test-coverage-issues.mjs`. Legacy hard-coded issue-review automation has been removed; maintained code is limited to direct Linear API creation, updates, export, hygiene, and active issue handling.

## 2. File Summaries

### Files

- **README-workflow.md** - Markdown document titled **Linear Agent Workflow Documentation**.
- **agent-workflow-create-issue.mjs** - Facade module that re-exports public members from `./agent-workflow-create-issue/index.mjs`, `./agent-workflow-create-issue/runtime.mjs`.
- **analyze-canceled-issues.mjs** - Facade module that re-exports public members from `./analyze-canceled-issues/index.mjs`, `./analyze-canceled-issues/runtime.mjs`.
- **create-ast-audit-issues.mjs** - Defines `main`, which orchestrates the main workflow for this directory.
- **create-issue-template.mjs** - Facade module that re-exports public members from `./create-issue-template/index.mjs`, `./create-issue-template/runtime.mjs`.
- **create-linear-rag-issues.mjs** - Exports `chunkLinearIssue`, `searchLinearIssues`, providing the reusable API for this directory concern.
- **create-run-file-change-hooks-bug.mjs** - Defines `main`, which orchestrates the main workflow for this directory.
- **create-test-coverage-issues.mjs** - Defines `main`, which orchestrates the main workflow for this directory.
- **delete-sonar-issues.mjs** - Facade module that re-exports public members from `./delete-sonar-issues/index.mjs`, `./delete-sonar-issues/runtime.mjs`.
- **deprioritize-test-coverage-issues.mjs** - Defines `main`, which orchestrates the main workflow for this directory.
- **export-issues.mjs** - Facade module that re-exports public members from `./export-issues/index.mjs`, `./export-issues/runtime.mjs`.
- **get-discord-label-id.mjs** - Facade module that re-exports public members from `./get-discord-label-id/index.mjs`, `./get-discord-label-id/runtime.mjs`.
- **github-linear-sync-audit.mjs** - Facade module that re-exports public members from `./github-linear-sync-audit/index.mjs`, `./github-linear-sync-audit/runtime.mjs`.
- **incident-evidence.mjs** - Facade module that re-exports public members from `./incident-evidence/index.mjs`.
- **incident-fingerprint.mjs** - Facade module that re-exports public members from `./incident-fingerprint/index.mjs`.
- **incident-manager.mjs** - Facade module that re-exports public members from `./incident-manager/index.mjs`.
- **incident-resolution.mjs** - Facade module that re-exports public members from `./incident-resolution/index.mjs`, `./incident-resolution/runtime.mjs`.
- **issue-hygiene.mjs** - Facade module that re-exports public members from `./issue-hygiene/index.mjs`, `./issue-hygiene/runtime.mjs`.
- **linear-client.mjs** - Facade module that re-exports public members from `./linear-client/index.mjs`.
- **list-canceled-issues.mjs** - Module that lists canceled issues.
- **list-open-issues.mjs** - Module that lists open issues.
- **reopen-marked-issues.mjs** - Facade module that re-exports public members from `./reopen-marked-issues/index.mjs`, `./reopen-marked-issues/runtime.mjs`.
- **review-open-issues.mjs** - Facade module that re-exports public members from `./review-open-issues/index.mjs`, `./review-open-issues/runtime.mjs`.
- **test-agent-workflow.mjs** - Facade module that re-exports public members from `./test-agent-workflow/index.mjs`, `./test-agent-workflow/runtime.mjs`.
- **validate-issue.mjs** - Facade module that re-exports public members from `./validate-issue/index.mjs`, `./validate-issue/runtime.mjs`.

### Subdirectories

- **agent-workflow-create-issue/** - Contains **ANQR Linear - Agent Workflow Create Issue**; it contains 12 immediate files and has 0 child directories.
- **analyze-canceled-issues/** - Contains **ANQR Linear Analyze Canceled Issues**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **create-issue-template/** - Contains **ANQR Linear Issue Template**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **delete-sonar-issues/** - Contains **ANQR Linear Delete Sonar Issues**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **export-issues/** - Contains **ANQR Linear Export Issues**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **get-discord-label-id/** - Contains **ANQR Linear - Get Discord Label ID**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **github-linear-sync-audit/** - Contains **ANQR GitHub-Linear Sync Audit**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **incident-evidence/** - Contains **ANQR Linear Incident Evidence**; it contains 8 immediate files and has 0 child directories.
- **incident-fingerprint/** - Contains **ANQR Linear Incident Fingerprint**; it contains 3 immediate files and has 0 child directories.
- **incident-manager/** - Contains **ANQR Incident Manager**; it contains 8 immediate files and has 0 child directories.
- **incident-resolution/** - Contains **ANQR Incident Resolution**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **issue-hygiene/** - Contains **ANQR Linear Issue Hygiene**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **linear-client/** - Contains **ANQR Linear Client**; it contains 20 immediate files and has 0 child directories.
- **reopen-marked-issues/** - Contains **ANQR Linear Reopen Marked Issues**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **review-open-issues/** - Contains **ANQR Linear Review Open Issues**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **test-agent-workflow/** - Contains **ANQR Linear Agent Workflow Test Suite**; it contains 17 immediate files and has 0 child directories.
- **validate-issue/** - Contains **ANQR Linear Issue Validation**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Discord integration, OpenClaw integration, Symphony integration, SonarQube integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code. Legacy one-off scripts for stale external issue identifiers are no longer part of the maintained surface.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- **Node.js built-ins** - `node:fs/promises`
- **Internal relative modules** - `../../lib/logger.mjs`, `../rag/vector-store.mjs`, `./agent-workflow-create-issue/index.mjs`, `./agent-workflow-create-issue/runtime.mjs`, `./analyze-canceled-issues/index.mjs`, `./analyze-canceled-issues/runtime.mjs`, `./create-issue-template/index.mjs`, `./create-issue-template/runtime.mjs`, `./delete-sonar-issues/index.mjs`, `./delete-sonar-issues/runtime.mjs`, `./embeddings.mjs`, `./export-issues/index.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
