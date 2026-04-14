# Linear

## Purpose

Directory for Discord ingress, delivery, or notification support; immediate files include `agent-workflow-create-issue.mjs`, `analyze-canceled-issues.mjs`, `create-ast-audit-issues.mjs`, `create-issue-template.mjs`, and others, with child directories `agent-workflow-create-issue/`, `analyze-canceled-issues/`, `create-issue-template/`, `delete-sonar-issues/`, and others.

## Contents

- 25 immediate files
- 17 child directories

## Key Files

- `agent-workflow-create-issue.mjs` - JavaScript/TypeScript module used by this directory.
- `analyze-canceled-issues.mjs` - JavaScript/TypeScript module used by this directory.
- `create-ast-audit-issues.mjs` - \*
- `create-issue-template.mjs` - JavaScript/TypeScript module used by this directory.
- `create-linear-rag-issues.mjs` - Exports `chunkLinearIssue`, the main helper defined in this file.
- `create-run-file-change-hooks-bug.mjs` - \*
- `create-test-coverage-issues.mjs` - \*
- `delete-sonar-issues.mjs` - JavaScript/TypeScript module used by this directory.
- `deprioritize-test-coverage-issues.mjs` - \*
- `export-issues.mjs` - JavaScript/TypeScript module used by this directory.
- `get-discord-label-id.mjs` - JavaScript/TypeScript module used by this directory.
- `github-linear-sync-audit.mjs` - JavaScript/TypeScript module used by this directory.
- `incident-evidence.mjs` - JavaScript/TypeScript module used by this directory.
- `incident-fingerprint.mjs` - JavaScript/TypeScript module used by this directory.
- `incident-manager.mjs` - JavaScript/TypeScript module used by this directory.
- `incident-resolution.mjs` - JavaScript/TypeScript module used by this directory.
- `issue-hygiene.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-client.mjs` - JavaScript/TypeScript module used by this directory.
- `list-canceled-issues.mjs` - \*
- `list-open-issues.mjs` - \*
- `README-workflow.md` - Documentation file headed by "Linear Agent Workflow Documentation".
- `reopen-marked-issues.mjs` - JavaScript/TypeScript module used by this directory.
- `review-open-issues.mjs` - JavaScript/TypeScript module used by this directory.
- `test-agent-workflow.mjs` - JavaScript/TypeScript module used by this directory.
- `validate-issue.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories

- `agent-workflow-create-issue/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `args.mjs`, `available-labels.mjs`, `available-states.mjs`, `create-linear-issue-workflow.mjs`, and others.
- `analyze-canceled-issues/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `correct-cancel-patterns.mjs`, `index.mjs`, `logger.mjs`, `main.mjs`, and others.
- `create-issue-template/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `customize-issue.mjs`, `index.mjs`, `issue-template.mjs`, `main.mjs`, and others.
- `delete-sonar-issues/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `delete-issue.mjs`, `index.mjs`, `logger.mjs`, `main.mjs`, and others.
- `export-issues/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `done-days-lookback.mjs`, `fetch-recent-done-issues.mjs`, `index.mjs`, `logger.mjs`, and others.
- `get-discord-label-id/` - Directory for Discord ingress, delivery, or notification support; immediate files include `create-discord-label.mjs`, `get-all-labels.mjs`, `index.mjs`, `logger.mjs`, and others.
- `github-linear-sync-audit/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `audit-sync.mjs`, `close-git-hub-issue.mjs`, `extract-linear-identifier.mjs`, `fetch-git-hub-issues.mjs`, and others.
- `incident-evidence/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `collect-incident-evidence.mjs`, `format-evidence-for-issue.mjs`, `get-git-context.mjs`, `get-service-journal.mjs`, and others.
- `incident-fingerprint/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `build-fingerprint-marker.mjs`, `generate-incident-fingerprint.mjs`, `index.mjs`.
- `incident-manager/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `build-incident-description.mjs`, `build-incident-title.mjs`, `create-or-update-incident.mjs`, `dedup-window-ms.mjs`, and others.
- `incident-resolution/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `auto-resolve-incident.mjs`, `can-auto-resolve.mjs`, `check-service-health.mjs`, `extract-service-name.mjs`, and others.
- `issue-hygiene/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `action-delay-ms.mjs`, `analysis-delay-ms.mjs`, `analyze-comments.mjs`, `analyze-issue.mjs`, and others.
- `linear-client/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `add-comment.mjs`, `create-issue.mjs`, `find-open-issues-by-description-fragment.mjs`, `find-open-issues-by-identifier.mjs`, and others.
- `reopen-marked-issues/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `index.mjs`, `logger.mjs`, `main.mjs`, `reopen-patterns.mjs`, and others.
- `review-open-issues/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `dirname.mjs`, `exec-async.mjs`, `extract-check-name.mjs`, `extract-sonar-dup-key.mjs`, and others.
- `test-agent-workflow/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `assert-condition.mjs`, `get-current-status.mjs`, `index.mjs`, `log-test-result.mjs`, and others.
- `validate-issue/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `calculate-validation-score.mjs`, `determine-priority.mjs`, `format-validation-result.mjs`, `get-issue-quality-checklist.mjs`, and others.

## Operational Notes

- Current on-disk inventory: 25 immediate files and 17 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
