# systemd services

This directory contains committed user-level systemd units and drop-ins for the harness runtime.

## What this directory owns

- service units
- timer units
- environment file templates
- drop-ins that modify committed services
- enablement symlink directories that reflect intended runtime state

## Start here when changing runtime behavior

Read:

1. this file
2. the unit or timer you are changing
3. the owning code entrypoint under `harness/ops/`
4. `docs/harness/00-index.md`
5. `harness/ops/README.md`

## Core unit groups

- ingress: webhook, Discord, email, gateway
- orchestration: scheduler, router, reconciler, integrator, recovery
- execution: executor bridges and related runtime support
- maintenance: health checks, nightly passes, rebuilds, watchdogs

## Rules

- The unit files are the source of truth for committed runtime wiring.
- Keep behavior notes here at the directory level when they help navigation.
- Remove generated subdirectory inventory docs that only restate filenames.
- When runtime behavior changes, update the unit, the nearest active README, and any affected reference doc.
