# Integrations

## Purpose

External-system adapter layer that connects the harness to Linear, email, Sonar, model providers, Discord, and OpenClaw notification channels.

## Contents

- 0 immediate files
- 5 child directories

## Key Files

- No immediate non-README files in this directory.

## Subdirectories

- `email/` - Email scope; immediate files include `email-ingest.mjs`; child directories include `email-ingest/`.
- `linear/` - Linear scope; immediate files include `agent-workflow-create-issue.mjs`, `analyze-canceled-issues.mjs`, `create-ast-audit-issues.mjs`, `create-issue-template.mjs`, and others; child directories include `agent-workflow-create-issue/`, `analyze-canceled-issues/`, `create-issue-template/`, `delete-sonar-issues/`, and others.
- `model/` - Model scope; immediate files include `codebuff-cwd-isolation.spec.ts`, `codebuff-direct.mjs`, `codebuff-sdk-runner.mjs`, `discord-request-router.mjs`, and others; child directories include `codebuff-direct/`, `discord-request-router/`, `linear-webhook-receiver/`, `ollama-local-audit/`, and others.
- `notifications/` - Notifications scope; immediate files include `openclaw-discord.mjs`, `test-discord.mjs`; child directories include `openclaw-discord/`, `test-discord/`.
- `sonar/` - Sonar scope; immediate files include `sonar-linear-audit.mjs`, `sonar-linear-sync.mjs`; child directories include `sonar-linear-audit/`, `sonar-linear-sync/`.

## Operational Notes

- Current on-disk inventory: 0 immediate file(s) and 5 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.
