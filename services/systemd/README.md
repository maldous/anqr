# Systemd contract

Keep operator entrypoints stable. Prefer top-level harness shims until the final cleanup phase so service files do not churn unnecessarily.

All services run as **user services** (`systemctl --user`), not system services.

## Install

```bash
cp services/systemd/*.service ~/.config/systemd/user/
cp services/systemd/*.timer ~/.config/systemd/user/
cp services/systemd/anqr-ops.env ~/.config/systemd/user/
systemctl --user daemon-reload
```

## Long-running services

| Service                        | Port | Purpose                                                                 |
| ------------------------------ | ---- | ----------------------------------------------------------------------- |
| `anqr-symphony-bridge.service` | 4319 | OpenAI-compatible HTTP gateway with AI SDK and tool execution           |
| `anqr-codebuff-bridge.service` | 4318 | OpenAI-compatible HTTP gateway for Codebuff SDK                         |
| `anqr-context7-mcp.service`    | 4320 | Context7 MCP documentation service (HTTP wrapper over local MCP server) |
| `anqr-watchdog.service`        | —    | Symphony/Codebuff bridge health monitoring                              |

## Scheduled automation (timers)

| Timer                        | Schedule    | Service                        | Purpose                              |
| ---------------------------- | ----------- | ------------------------------ | ------------------------------------ |
| `anqr-symphony-runner.timer` | Periodic    | `anqr-symphony-runner.service` | Process Linear issues via Symphony   |
| `anqr-queue-feeder.timer`    | Periodic    | `anqr-queue-feeder.service`    | Feed work queue                      |
| `anqr-nightly.timer`         | 02:00 daily | `anqr-nightly.service`         | Full nightly operations pass         |
| `anqr-rag-rebuild.timer`     | 03:00 daily | `anqr-rag-rebuild.service`     | Rebuild RAG vector index (full repo) |
| `anqr-email-ingest.timer`    | Periodic    | `anqr-email-ingest.service`    | Process inbound operational emails   |

## Shared environment

- `services/systemd/anqr-ops.env` — template with all env vars
- `~/.config/systemd/user/anqr-ops.env` — installed copy with real secrets

## Useful commands

```bash
# List all ANQR timers
systemctl --user list-timers | grep anqr

# Check service status
systemctl --user status anqr-symphony-bridge

# View logs
journalctl --user -u anqr-rag-rebuild -f

# Manual RAG rebuild
systemctl --user start anqr-rag-rebuild
```
