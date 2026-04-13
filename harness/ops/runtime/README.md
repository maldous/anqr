# Runtime

## Purpose
Directory for runtime service bootstrap or environment support, with child directories `discord/`, `mcp/`, `openclaw-config/`, `symphony/`, and others.

## Contents
- 0 immediate files
- 5 child directories

## Key Files
- No immediate non-README files in this directory.

## Subdirectories
- `discord/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `openclaw-gateway-singleton.mjs`, with child directories `openclaw-gateway-singleton/`.
- `mcp/` - Directory for runtime service bootstrap or environment support; immediate files include `context7-http-service.mjs`, `context7-server.mjs`, with child directories `context7-http-service/`, `context7-server/`.
- `openclaw-config/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `.env.example`, `clawdbot.json`, `config.json`, `exec-approvals.json`, and others, with child directories `agents/`, `canvas/`, `credentials/`, `cron/`, and others.
- `symphony/` - Directory for fleet recovery, quarantine, and health enforcement; immediate files include `symphony-agent.mjs`, `watchdog-monitor.mjs`, `WORKFLOW.md`, with child directories `symphony-agent/`, `watchdog-monitor/`.
- `watchdog/` - Directory for fleet recovery, quarantine, and health enforcement; immediate files include `bridge-watchdog.mjs`, with child directories `bridge-watchdog/`.

## Operational Notes
- Current on-disk inventory: 0 immediate files and 5 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether runtime bootstrap assumptions and configuration boundaries still match the service topology described in the ADRs and workspace model.
