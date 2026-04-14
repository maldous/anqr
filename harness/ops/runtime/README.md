# Runtime

## Purpose
Runtime contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 0 immediate files
- 5 child directories

## Key Files
- No immediate non-README files in this directory.

## Subdirectories
- `discord/` - Discord scope; immediate files include `openclaw-gateway-singleton.mjs`; child directories include `openclaw-gateway-singleton/`.
- `mcp/` - Mcp scope; immediate files include `context7-http-service.mjs`, `context7-server.mjs`; child directories include `context7-http-service/`, `context7-server/`.
- `openclaw-config/` - Openclaw Config scope; immediate files include `.env.example`, `clawdbot.json`, `config.json`, `exec-approvals.json`, and others; child directories include `agents/`, `canvas/`, `credentials/`, `cron/`, and others.
- `symphony/` - Symphony scope; immediate files include `symphony-agent.mjs`, `watchdog-monitor.mjs`, `WORKFLOW.md`; child directories include `symphony-agent/`, `watchdog-monitor/`.
- `watchdog/` - Watchdog scope; immediate files include `bridge-watchdog.mjs`; child directories include `bridge-watchdog/`.

## Operational Notes
- Current on-disk inventory: 0 immediate file(s) and 5 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
