# Default Target

<<<<<<< ours — heading `Purpose` (F, confidence: medium)
// hint: Logic changed on both sides. Requires understanding intent of each change.
## Purpose
Default Target contains the code, configuration, or support files that implement this part of the harness architecture.

=======
## Purpose

Directory for systemd topology and host runtime configuration; immediate files include `anqr-context7-mcp.service`, `anqr-discord-router.service`, `anqr-linear-webhook.service`, `anqr-symphony-executor@1.service`, `anqr-symphony-scheduler.service`, and others.

>>>>>>> theirs — heading `Purpose` (F, confidence: medium)
<<<<<<< ours — heading `Contents` (F, confidence: medium)
// hint: Logic changed on both sides. Requires understanding intent of each change.
## Contents
- 18 immediate files
- 0 child directories

=======
## Contents

- 20 immediate files
- 0 child directories

>>>>>>> theirs — heading `Contents` (F, confidence: medium)
<<<<<<< ours — heading `Key Files` (F, confidence: medium)
// hint: Logic changed on both sides. Requires understanding intent of each change.
## Key Files
- `anqr-context7-mcp.service` - systemd unit for ANQR Context7 MCP Documentation Service; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/runtime/mcp/context7-http-service.mjs`.
- `anqr-discord-router.service` - systemd unit for ANQR Discord request router (load balancer); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/discord-request-router.mjs`.
- `anqr-linear-webhook.service` - systemd unit for ANQR Linear webhook receiver (event-driven ingress); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/linear-webhook-receiver.mjs`.
- `anqr-symphony-executor@1.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@2.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@3.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@4.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@5.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@6.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@7.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@8.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-integrator.service` - systemd unit for ANQR Symphony integrator; starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/orchestration/symphony-integrator.mjs daemon`.
- `anqr-symphony-router.service` - systemd unit for ANQR Symphony router (control plane / orchestration); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/symphony-agent-router.mjs`.
- `anqr-symphony-scheduler.service` - systemd unit for ANQR Symphony Scheduler (ADR-0002 authoritative claim+dispatch); starts `/usr/bin/node harness/ops/orchestration/symphony-scheduler/runtime.mjs --daemon`.
- `anqr-symphony-worktree-recovery.service` - systemd unit for ANQR Symphony Worktree Recovery Daemon; starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/orchestration/symphony-worktree-recovery.mjs daemon`.
- `anqr-watchdog.service` - systemd unit for ANQR Symphony Router and Executor Watchdog; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/runtime/watchdog/bridge-watchdog.mjs`.
- `model-injector-proxy.service` - systemd unit for Model Injector Proxy — fixes Codex CLI model=None bug; starts `/usr/bin/python3 %h/src/anqr/harness/ops/model-injector-proxy.py`.
- `openclaw-gateway.service` - systemd unit for OpenClaw Gateway (v2026.4.1); starts `/usr/local/bin/openclaw gateway --port 18789`.

=======
## Key Files

- `anqr-context7-mcp.service` - systemd unit for ANQR Context7 MCP Documentation Service; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/runtime/mcp/context7-http-service.mjs`.
- `anqr-discord-router.service` - systemd unit for ANQR Discord request router (load balancer); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/discord-request-router.mjs`.
- `anqr-linear-webhook.service` - systemd unit for ANQR Linear webhook receiver (event-driven ingress); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/linear-webhook-receiver.mjs`.
- `anqr-symphony-executor@1.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@2.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@3.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@4.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@5.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@6.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@7.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-executor@8.service` - systemd unit for ANQR Symphony executor for worktree wt%i; starts `%h/.nvm/versions/node/v25.8.0/bin/node --max-old-space-size=2048 --expose-gc %h/src/anqr/harness/ops/integrations/model/symphony-openai-bridge.mjs`.
- `anqr-symphony-integrator.service` - systemd unit for ANQR Symphony integrator; starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/orchestration/symphony-integrator.mjs daemon`.
- `anqr-symphony-router.service` - systemd unit for ANQR Symphony router (control plane / orchestration); starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/integrations/model/symphony-agent-router.mjs`.
- `anqr-symphony-scheduler.service` - systemd unit for ANQR Symphony scheduler (authoritative claim + dispatch); starts `/usr/bin/node harness/ops/orchestration/symphony-scheduler/runtime.mjs --daemon`.
- `anqr-symphony-worktree-recovery.service` - systemd unit for ANQR Symphony Worktree Recovery Daemon; starts `%h/.nvm/versions/node/v25.8.0/bin/node %h/src/anqr/harness/ops/orchestration/symphony-worktree-recovery.mjs daemon`.
- `anqr-watchdog.service` - systemd unit for ANQR Symphony Router and Executor Watchdog; starts `%h/.nvm/versions/node/v25.8.0/bin/node harness/ops/runtime/watchdog/bridge-watchdog.mjs`.
- `model-injector-proxy.service` - systemd unit for Model Injector Proxy — fixes Codex CLI model=None bug; starts `/usr/bin/python3 %h/src/anqr/harness/ops/model-injector-proxy.py`.
- `openclaw-gateway.service` - systemd unit for OpenClaw Gateway (v2026.4.1); starts `/usr/local/bin/openclaw gateway --port 18789`.

>>>>>>> theirs — heading `Key Files` (F, confidence: medium)
## Subdirectories

- No child directories in this directory.

<<<<<<< ours — heading `Operational Notes` (S+F, confidence: low)
// hint: Structural and logic conflict. Both design and behavior differ.
## Operational Notes
- Current on-disk inventory: 18 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

=======
## Operational Notes

- Current on-disk inventory: 18 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

>>>>>>> theirs — heading `Operational Notes` (S+F, confidence: low)
## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.

# Default Target
