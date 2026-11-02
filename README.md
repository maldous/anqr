# ANQR

**QR generation, styling and analysis, with web, HTTP API and MCP surfaces.**

This archived repository preserves the ANQR 1.0 monorepo and its engineering history. Its documented product scope is the web application and Netlify delivery surface; the presence of mobile or other application directories does not establish their release readiness.

[ANQR](https://anqr.link/) · [ANQR V3 source](https://github.com/maldous/anqr-v3) · [Translations](https://github.com/maldous/anqr-i18n) · [Matthew Aldous](https://aldous.info/)

## Repository guide

ANQR is a monorepo for the ANQR 1.0 product and its repo-local automation harness.

## What this repo currently claims

Current delivery claim:

- `apps/web`
- `netlify/functions/*`
- `netlify/edge-functions/*`

Present in the repo but not part of the current product claim unless a later document promotes them:

- `apps/api`
- `apps/android`
- `apps/ios`
- root `android/`
- root `ios/`

## Start here

Humans:

1. `README.md`
2. `AGENTS.md`
3. `docs/README.md`
4. nearest directory `README.md`
5. task-specific standards, workflows, or references

AI agents:

1. `AGENTS.md`
2. `README.md`
3. `docs/README.md`
4. `docs/program/01-anqr-1.0-definition.md`
5. nearest directory `README.md`

## Source of truth order

When documents disagree, use this order:

1. code and committed runtime files
2. nearest owning directory `README.md`
3. `docs/program/01-anqr-1.0-definition.md`
4. `docs/adrs/*`
5. `docs/standards/*`
6. `docs/workflows/*`
7. `docs/reference/*`
8. `docs/archive/*`

Plans, scratch notes, and archived reviews do not override active documents.

## Repo map

- `apps/` product surfaces
- `packages/` shared libraries and contracts
- `netlify/` live HTTP and edge delivery surface
- `harness/` repo-local automation and orchestration
- `services/systemd/` committed user-level systemd units and drop-ins
- `docs/` active architecture, standards, workflows, references, and archive
- `tests/` cross-surface verification
- `.agents/` optional skill library and agent helper material
- `.codex/` Codex-specific bootstrap note

## Documentation rules

- Root stays small and authoritative.
- Local implementation detail belongs beside the code it describes.
- Active docs live under `docs/`, not in transient root files.
- Runtime workspace persona files belong under `harness/ops/runtime/openclaw-config/`, not at repo root.
- Historical plans and migration notes belong under `docs/archive/`.
- Duplicate `README.md` and `README.txt` pairs are not part of the target design.

## When you change the repo

Update:

1. the code
2. the nearest active `README.md`
3. any affected standard, workflow, or reference doc

Do not update archive material to explain current behavior.

