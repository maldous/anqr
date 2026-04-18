# Harness ops

This is the live operational core of the harness.

## Main areas

- `core/` shared execution state, validation, evidence, and worktree helpers
- `orchestration/` scheduler, runner, integrator, recovery, and control loops
- `integrations/` external system ingress and provider-facing integrations
- `runtime/` runtime-specific config and service-side behavior
- `tools/` operator and repair tools
- `lib/` shared implementation helpers
- `reporting/` reports and summary outputs
- `notifications/` local notification surfaces

## Fast path by task

- dispatch, claims, scheduling: `orchestration/`
- provider routing or bridge behavior: `integrations/model/`
- Linear flows: `integrations/linear/`
- Discord or OpenClaw runtime config: `runtime/openclaw-config/`
- timers and services: `../../services/systemd/README.md`
- evidence or validation: `core/`

## Rule

Prefer the nearest owning doc plus the code. Do not load broad historical narratives unless the task needs history.
