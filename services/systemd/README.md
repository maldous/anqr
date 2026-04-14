# Services Systemd

## Purpose
User-level systemd unit inventory for the harness control plane, authoritative scheduler, executor fleet, recovery loops, timers, ingress surfaces, and support gateways.

<<<<<<< ours — heading `Contents` (F, confidence: medium)
// hint: Logic changed on both sides. Requires understanding intent of each change.
## Contents
- 27 immediate files
- 4 child directories

=======
## Contents

- 29 immediate files
- 4 child directories

>>>>>>> theirs — heading `Contents` (F, confidence: medium)
<<<<<<< ours — heading `Key Files` (F, confidence: medium)
// hint: Logic changed on both sides. Requires understanding intent of each change.
## Key Files
- `.gitignore` - Support file used by this directory.
- `.gitkeep` - Support file used by this directory.
- `anqr-context7-mcp.service` - systemd unit for ANQR Context7 MCP Documentation Service; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/runtime/mcp/context7-http-service.mjs`.
- `anqr-discord-router.service` - systemd unit for ANQR Discord request router (load balancer); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/discord-request-router.mjs`.
- `anqr-email-ingest.service` - systemd unit for ANQR Email Ingest (mbsync + notmuch → Linear issues); starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/email-ingest.mjs`.
- `anqr-email-ingest.timer` - systemd unit for ANQR Email Ingest Timer (every 5 minutes).
- `anqr-linear-export.service` - systemd unit for ANQR Linear issue export; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/integrations/linear/export-issues.mjs`.
- `anqr-linear-export.timer` - systemd unit for ANQR Linear issue export timer.
- `anqr-linear-reconciler.service` - systemd unit for ANQR Linear backlog reconciler (level-triggered dispatch); starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/linear-reconciler.mjs --daemon`.
- `anqr-linear-webhook.service` - systemd unit for ANQR Linear webhook receiver (event-driven ingress); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/linear-webhook-receiver.mjs`.
- `anqr-nightly.service` - systemd unit for ANQR Symphony nightly operations pass; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/nightly-ops-pass.mjs --skip-tests`.
- `anqr-nightly.timer` - systemd unit for ANQR Symphony nightly operations timer.
- `anqr-ops.env` - Environment variable template or inventory file.
- `anqr-rag-rebuild.service` - systemd unit for ANQR RAG vector index rebuild; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/lib/rag/build-index.mjs`.
- `anqr-rag-rebuild.timer` - systemd unit for ANQR RAG vector index rebuild timer.
- `anqr-symphony-codex.service` - systemd unit for ANQR Symphony bridge for Codex CLI (main repo); starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-integrator.service` - systemd unit for ANQR Symphony integrator; starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/orchestration/symphony-integrator.mjs daemon`.
- `anqr-symphony-router.service` - systemd unit for ANQR Symphony router (control plane / orchestration); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/symphony-agent-router.mjs`.
- `anqr-symphony-scheduler.service` - systemd unit for ANQR Symphony Scheduler (ADR-0002 authoritative claim+dispatch); starts `/usr/bin/node harness/ops/orchestration/symphony-scheduler/runtime.mjs --daemon`.
- `anqr-symphony-worktree-recovery.service` - systemd unit for ANQR Symphony Worktree Recovery Daemon; starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/orchestration/symphony-worktree-recovery.mjs daemon`.
- `anqr-watchdog.service` - systemd unit for ANQR Symphony Router and Executor Watchdog; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/runtime/watchdog/bridge-watchdog.mjs`.
- `anqr-worktree-health.service` - systemd unit for ANQR Worktree Fleet Health Check; starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/core/worktree-health.mjs write`.
- `anqr-worktree-health.timer` - systemd unit for ANQR Worktree Fleet Health Timer.
- `litellm-proxy.service` - systemd unit for LiteLLM Proxy — Ollama tool-call translator for Codex CLI; starts `%h/.local/bin/litellm --config %h/src/anqr/harness/ops/integrations/model/litellm-config.yaml --port 4010 --host 127.0.0.1`.
- `model-injector-proxy.service` - systemd unit for Model Injector Proxy — fixes Codex CLI model=None bug; starts `/usr/bin/python3 %h/src/anqr/harness/ops/model-injector-proxy.py`.
- `openclaw-gateway.service` - systemd unit for OpenClaw Gateway (v2026.4.1); starts `/usr/local/bin/openclaw gateway --port 18789`.

=======
## Key Files

- `.gitignore` - Support file used by this directory.
- `.gitkeep` - Support file used by this directory.
- `anqr-context7-mcp.service` - systemd unit for ANQR Context7 MCP Documentation Service; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/runtime/mcp/context7-http-service.mjs`.
- `anqr-discord-router.service` - systemd unit for ANQR Discord request router (load balancer); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/discord-request-router.mjs`.
- `anqr-email-ingest.service` - systemd unit for ANQR Email Ingest (mbsync + notmuch → Linear issues); starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/email-ingest.mjs`.
- `anqr-email-ingest.timer` - systemd unit for ANQR Email Ingest Timer (every 5 minutes).
- `anqr-linear-export.service` - systemd unit for ANQR Linear issue export; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/integrations/linear/export-issues.mjs`.
- `anqr-linear-export.timer` - systemd unit for ANQR Linear issue export timer.
- `anqr-linear-reconciler.service` - systemd unit for ANQR Linear backlog reconciler (level-triggered dispatch); starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/linear-reconciler.mjs --daemon`.
- `anqr-linear-webhook.service` - systemd unit for ANQR Linear webhook receiver (event-driven ingress); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/linear-webhook-receiver.mjs`.
- `anqr-nightly.service` - systemd unit for ANQR Symphony nightly operations pass; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/nightly-ops-pass.mjs --skip-tests`.
- `anqr-nightly.timer` - systemd unit for ANQR Symphony nightly operations timer.
- `anqr-ops.env` - Environment variable template or inventory file.
- `anqr-rag-rebuild.service` - systemd unit for ANQR RAG vector index rebuild; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/lib/rag/build-index.mjs`.
- `anqr-rag-rebuild.timer` - systemd unit for ANQR RAG vector index rebuild timer.
- `anqr-symphony-codex.service` - systemd unit for ANQR Symphony bridge for Codex CLI (main repo); starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-integrator.service` - systemd unit for ANQR Symphony integrator; starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/orchestration/symphony-integrator.mjs daemon`.
- `anqr-symphony-router.service` - systemd unit for ANQR Symphony router (control plane / orchestration); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/symphony-agent-router.mjs`.
- `anqr-symphony-scheduler.service` - systemd unit for ANQR Symphony scheduler (authoritative claim + dispatch); starts `/usr/bin/node harness/ops/orchestration/symphony-scheduler/runtime.mjs --daemon`.
- `anqr-symphony-worktree-recovery.service` - systemd unit for ANQR Symphony Worktree Recovery Daemon; starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/orchestration/symphony-worktree-recovery.mjs daemon`.
- `anqr-watchdog.service` - systemd unit for ANQR Symphony Router and Executor Watchdog; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/runtime/watchdog/bridge-watchdog.mjs`.
- `anqr-worktree-health.service` - systemd unit for ANQR Worktree Fleet Health Check; starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/core/worktree-health.mjs write`.
- `anqr-worktree-health.timer` - systemd unit for ANQR Worktree Fleet Health Timer.
- `litellm-proxy.service` - systemd unit for LiteLLM Proxy — Ollama tool-call translator for Codex CLI; starts `%h/.local/bin/litellm --config %h/src/anqr/harness/ops/integrations/model/litellm-config.yaml --port 4010 --host 127.0.0.1`.
- `model-injector-proxy.service` - systemd unit for Model Injector Proxy — fixes Codex CLI model=None bug; starts `/usr/bin/python3 %h/src/anqr/harness/ops/model-injector-proxy.py`.
- `openclaw-gateway.service` - systemd unit for OpenClaw Gateway (v2026.4.1); starts `/usr/local/bin/openclaw gateway --port 18789`.

>>>>>>> theirs — heading `Key Files` (F, confidence: medium)
<<<<<<< ours — heading `Subdirectories` (F, confidence: medium)
// hint: Logic changed on both sides. Requires understanding intent of each change.
## Subdirectories
- `clawdbot-gateway.service.d/` - Clawdbot Gateway Service scope; immediate files include `ollama.conf`.
- `default.target.wants/` - Default Target scope; immediate files include `anqr-context7-mcp.service`, `anqr-discord-router.service`, `anqr-linear-webhook.service`, `anqr-symphony-executor@1.service`, and others.
- `symphony-anqr.service.d/` - Symphony Anqr Service scope; immediate files include `override.conf`.
- `timers.target.wants/` - Timers Target scope; immediate files include `anqr-email-ingest.timer`, `anqr-linear-export.timer`, `anqr-nightly.timer`, `anqr-rag-rebuild.timer`, and others.

=======
## Subdirectories

- `clawdbot-gateway.service.d/` - Directory for systemd topology and host runtime configuration; immediate files include `ollama.conf`.
- `default.target.wants/` - Directory for systemd topology and host runtime configuration; immediate files include `anqr-context7-mcp.service`, `anqr-discord-router.service`, `anqr-linear-webhook.service`, `anqr-symphony-executor@1.service`, `anqr-symphony-scheduler.service`, and others.
- `symphony-anqr.service.d/` - Directory for systemd topology and host runtime configuration; immediate files include `override.conf`.
- `timers.target.wants/` - Directory for systemd topology and host runtime configuration; immediate files include `anqr-email-ingest.timer`, `anqr-linear-export.timer`, `anqr-nightly.timer`, `anqr-rag-rebuild.timer`, and others.

>>>>>>> theirs — heading `Subdirectories` (F, confidence: medium)
## Operational Notes
- These units are the deployed host runtime for the harness.
- The current topology includes a dedicated scheduler service in addition to router, executor, integrator, recovery, watchdog, ingress, and sidecar services.

## Review Focus
Verify service boundaries, startup ordering, scheduler inclusion, worktree-to-unit mapping, env sourcing, timer cadence, and whether enabled units match the current architecture.
