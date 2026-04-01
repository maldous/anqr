# Runtime Contract

This document defines the maintained harness runtime contract for ANQR 1.0.

## Canonical runtime roots

- `scripts/ops/*`
- `services/systemd/*`

## Environment sources

### Project-local

- `.env`
  - developer/operator superset env

### Harness runtime

- `~/.config/symphony/anqr.env`
  - provider and orchestration env for symphony
- `~/.config/systemd/user/anqr-ops.env`
  - systemd/user service env for harness services
- `services/systemd/anqr-ops.env`
  - repo-stored template/contract surface, not the live secret file

## Secret touchpoints

Human-only or guarded surfaces include:

- Linear API key
- Sonar tokens
- provider API tokens
- Netlify tokens
- store signing and mobile credentials
- email transport credentials

These must not leak into evidence reports or routine docs.

## Ports and network truth

- product runtime ports belong to the web app, Netlify, and mobile if later claimed
- harness runtime uses network access to:
  - Linear
  - Sonar
  - provider APIs
  - optional mail services
- local-model degraded mode may depend on `OLLAMA_API_BASE`
- harness services are operator-only and not part of the public request path for basic QR generation

## systemd truth

Maintained user services:

- `anqr-symphony-router.service` — Global orchestration (control plane)
- `anqr-symphony-executor@*.service` — Worktree executors (execution plane)
- `anqr-linear-runner@*.service` / `@*.timer` — Linear issue polling (wt1-wt4)
- `anqr-discord-router.service` — Discord request load balancer
- `anqr-queue-feeder`
- `anqr-nightly`
- `anqr-email-ingest` as optional operator integration

Legacy services are deprecated; the current architecture uses Router/Executor model.

These services assume:

- user-level systemd
- network availability
- explicit Node paths in service files
- env files in the user config directory

## Redaction rules

- redact all secret values in docs, reports, and logs
- prefer labels and presence checks over partial secret display
- keep prod-control changes and secret handling in human-review workflows

## Degraded mode contract

The harness remains usable in reduced environments when:

- queue operations run in dry-run mode
- symphony status is used instead of full mutation
- provider fallback or local-only routing is used
- optional integrations like email ingest are absent

The system must report degraded capability explicitly rather than pretending full readiness.

## Classification rule

Every runtime surface must eventually be classified as:

- canonical
- transitional
- duplicate
- archive-only
- remove

No deletion should happen without:

- a recorded replacement target
- an owner/runtime
- a blocking-risk note
- a follow-up issue or explicit convergence task
