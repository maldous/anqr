# Integrations

## Purpose

Directory for harness support logic, with child directories `email/`, `linear/`, `model/`, `notifications/`, and others.

## Contents

- 0 immediate files
- 5 child directories

## Key Files

- No immediate non-README files in this directory.

## Subdirectories

- `email/` - Directory for harness support logic; immediate files include `email-ingest.mjs`, with child directories `email-ingest/`.
- `linear/` - Directory for Discord ingress, delivery, or notification support; immediate files include `agent-workflow-create-issue.mjs`, `analyze-canceled-issues.mjs`, `create-ast-audit-issues.mjs`, `create-issue-template.mjs`, and others, with child directories `agent-workflow-create-issue/`, `analyze-canceled-issues/`, `create-issue-template/`, `delete-sonar-issues/`, and others.
- `model/` - Directory for Discord ingress, delivery, or notification support; immediate files include `codebuff-cwd-isolation.spec.ts`, `codebuff-direct.mjs`, `codebuff-sdk-runner.mjs`, `discord-request-router.mjs`, and others, with child directories `codebuff-direct/`, `discord-request-router/`, `linear-webhook-receiver/`, `ollama-local-audit/`, and others.
- `notifications/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `openclaw-discord.mjs`, `test-discord.mjs`, with child directories `openclaw-discord/`, `test-discord/`.
- `sonar/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `sonar-linear-audit.mjs`, `sonar-linear-sync.mjs`, with child directories `sonar-linear-audit/`, `sonar-linear-sync/`.

## Operational Notes

- Current on-disk inventory: 0 immediate files and 5 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
