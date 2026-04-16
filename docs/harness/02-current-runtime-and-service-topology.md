# Current Runtime And Service Topology

> **⚠️ Pre-implementation architecture review document.** Written before Workstreams A–G. The service topology described here has been updated — notably the addition of the authoritative scheduler (Workstream A) and evidence-gated integrator (Workstream G). For current topology, see `services/systemd/README.md` and subsystem READMEs.

## Repository runtime roots

The current runtime roots are:

- `harness/ops/*`
- `services/systemd/*`

## Main active service surfaces

### Ingress and routing

- `services/systemd/openclaw-gateway.service`
  - OpenClaw gateway
  - default port `18789`
- `services/systemd/anqr-discord-router.service`
  - Discord request router
  - default port `18790`
- `services/systemd/anqr-linear-webhook.service`
  - Linear webhook receiver
  - default port `18791`
- `services/systemd/anqr-symphony-router.service`
  - Symphony router
  - default port `4319`

### Execution plane

- `services/systemd/anqr-symphony-executor@.service`
  - eight executor instances
  - working directories `~/src/anqr-wt1` through `~/src/anqr-wt8`
  - ports `4321` through `4328`

### Control-plane maintenance and recovery

- `services/systemd/anqr-linear-reconciler.service`
- `services/systemd/anqr-symphony-integrator.service`
- `services/systemd/anqr-symphony-worktree-recovery.service`
- `services/systemd/anqr-watchdog.service`
- `services/systemd/anqr-worktree-health.service`
- `services/systemd/anqr-worktree-health.timer`

### Supporting automation

- `services/systemd/anqr-nightly.service`
- `services/systemd/anqr-nightly.timer`
- `services/systemd/anqr-rag-rebuild.service`
- `services/systemd/anqr-rag-rebuild.timer`
- `services/systemd/anqr-email-ingest.service`
- `services/systemd/anqr-email-ingest.timer`
- `services/systemd/anqr-linear-export.service`
- `services/systemd/anqr-linear-export.timer`
- `services/systemd/anqr-context7-mcp.service`

## Worktree pool mapping

### Linear pool

- `wt1`
- `wt2`
- `wt3`
- `wt4`

Used for:

- Linear issue execution
- mutating repository work originating from issue automation
- repository tasks that need branch publication and later integration

### Discord pool

- `wt5`
- `wt6`
- `wt7`
- `wt8`

Used for:

- Discord interactive work
- read-only questions
- command execution
- repository mutation when a Discord request is allowed to change files

## Current routing code paths

### Discord path

- `harness/ops/integrations/model/discord-request-router/*`
- `harness/ops/integrations/model/symphony-openai-bridge/*`

Current behavior:

- Discord router selects the least-loaded Discord worktree
- request cwd is rewritten toward the chosen worktree
- the router forwards the request to the executor-local bridge
- executor-local bridge performs the actual model and tool work

### Linear path

- `harness/ops/integrations/model/linear-webhook-receiver/*`
- `harness/ops/integrations/model/symphony-agent-router/*`
- `harness/ops/orchestration/linear-reconciler/*`
- `harness/ops/orchestration/symphony-runner/*`

Current behavior:

- webhook receiver accepts eligible events and writes desired-work ingress
- reconciler feeds desired-work signals instead of dispatching runnable work
- the authoritative scheduler claims runnable issues, assigns worktrees, and dispatches through the router
- the router verifies scheduler-owned claims on both trigger and queue-drain paths before forwarding to executors
- runners execute assigned work only; they do not self-pick global Linear work

That means the Linear path now has one effective scheduler for global issue admission and claim.

## State and persistence

Current state is file-backed through:

- `harness/ops/core/symphony-state/*`
- reports and runtime JSON under `reports/*`

Current state surfaces include:

- issue records
- lease records
- retry and cooldown metadata
- finalization state
- integration queue and lock
- worktree state
- global reconciler values
- evidence and reporting artifacts

## Current git and branch behavior

The current runtime uses:

- long-lived named worktrees
- per-worktree branches
- executor-local sync against `origin/main`
- branch publication from runner paths
- cherry-pick based integration in the integrator
- automated worktree repair and sync in the recovery daemon

The key risk is that git mutation is happening in more than one place.
