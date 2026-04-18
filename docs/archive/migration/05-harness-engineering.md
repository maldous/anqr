# 05. Harness engineering by design contract

The harness is already live under `harness/ops/`. The correct move is **internal contract separation with stable public entry shims**, not relocation to a new root.

## 5.1 Canonical harness target shape

```text
harness/ops/
  README.md
  core/
  orchestration/
  governance/
  integrations/
    linear/
    email/
    sonar/
    model/
  notifications/
  reporting/
  runtime/
    symphony/
```

## 5.2 Required file moves

### `harness/ops/core/`

Own:

- shared state
- validation
- shared config
- low-level harness invariants

Move here:

- `symphony-config.mjs`
- `symphony-state.mjs`
- `symphony-validation.mjs`

### `harness/ops/orchestration/`

Own:

- multi-step executable flows
- queue processing
- nightly orchestration
- runner orchestration

Move here:

- `symphony-runner.mjs`
- `symphony-queue-control.mjs`
- `nightly-ops-pass.mjs`
- possibly `email-ingest.mjs` as a root shim over `integrations/email` if preferred

### `harness/ops/governance/`

Own:

- issue state policies
- guarded machine/human lane control
- corrective flow decisions

Move here:

- `linear-guardian.mjs`

### `harness/ops/integrations/linear/`

Own:

- Linear client
- Linear sync helpers
- Linear-specific transport and shape logic

Move here:

- `linear-client.mjs`
- `lib/sonar-linear-sync.mjs` only if kept Linear-centric
- any new Linear-specific helper files

### `harness/ops/integrations/email/`

Own:

- email ingest logic
- mail-source integration surfaces

Move here:

- `email-ingest.mjs`
- keep top-level shim if systemd/package scripts still call the old path

### `harness/ops/integrations/sonar/`

Own:

- Sonar audit orchestration
- Sonar-to-issue sync helpers
- Sonar specific transport

Move here:

- `sonar-linear-audit.mjs`
- `lib/sonar-linear-sync.mjs` if treated Sonar-first rather than Linear-first

### `harness/ops/integrations/model/`

Own:

- provider routing
- proxy
- model audit
- local model configuration

Move here:

- `symphony-credit-gate.mjs`
- `ollama-local-audit.mjs`
- `litellm-config.yaml`
- `model-injector-proxy.py`

### `harness/ops/notifications/`

Own:

- notifications and alert delivery
- notification transport helpers

Move here:

- `notify.mjs`
- `lib/notify.mjs`

### `harness/ops/reporting/`

Own:

- harness health reports
- deterministic report generation

Move here:

- `harness-report.mjs`

### `harness/ops/runtime/symphony/`

Own:

- agent runtime surface
- system prompt
- runtime-only symphony execution internals

Move here:

- `symphony-agent.mjs`
- `symphony/WORKFLOW.md`

## 5.3 Entry shim rule

For the first migration pass, keep these stable public files at their current paths:

- `harness/ops/symphony-runner.mjs`
- `harness/ops/symphony-agent.mjs`
- `harness/ops/symphony-credit-gate.mjs`
- `harness/ops/symphony-queue-control.mjs`
- `harness/ops/nightly-ops-pass.mjs`
- `harness/ops/harness-report.mjs`
- `harness/ops/linear-client.mjs`
- `harness/ops/linear-guardian.mjs`
- `harness/ops/email-ingest.mjs`
- `harness/ops/notify.mjs`
- `harness/ops/sonar-linear-audit.mjs`

These should become thin import-and-dispatch shims so that:

- systemd units do not break immediately
- root `package.json` scripts do not break immediately
- operator muscle memory does not break immediately

## 5.4 Harness rules that must remain explicit

- one planner/governor first
- bounded specialist executors later
- strict evidence before marking work done
- strict rollback expectations
- explicit human approval gates for protected actions

## 5.5 Paths that must be updated after shim introduction

Eventually, but not in the same move as the file relocation:

- root `package.json` harness scripts
- systemd unit `ExecStart` values if you choose to point them at internal module paths later
- docs that name old file paths when those files become compatibility shims rather than real implementations
