# AGENTS.md

This file is the first-read execution contract for AI agents working in this repository.

## Read order

1. Read [README.md](/home/user/src/anqr/README.md).
2. Read [docs/README.md](/home/user/src/anqr/docs/README.md).
3. Read [docs/program/01-anqr-1.0-definition.md](/home/user/src/anqr/docs/program/01-anqr-1.0-definition.md).
4. Read the relevant harness docs under [docs/harness](/home/user/src/anqr/docs/harness).
5. Read the specific package, app, or delivery files you are changing.

## Current launch claim

The truthful current 1.0 claim is:

- `apps/web`
- `netlify/*` for HTTP API and MCP

Not currently in the claim:

- `apps/api`
- Android
- iPhone

Do not imply broader launch readiness unless the docs are updated first.

## Canonical architecture scope

The authoritative package architecture scope is:

- `packages/*/*`
- `apps/web`
- `netlify/*`
- `public/*`

Related but separate surfaces:

- `scripts/ops/*` and `services/systemd/*` are the harness/runtime surface
- `docs/*` is canonical doctrine
- `migration/*` is archive-only historical context
- `src/*` is transitional residue, not a live target architecture

## Non-import rules

Do not import or rebuild legacy structures mechanically.

In particular:

- do not treat `apps/api` as the live API surface
- do not treat mobile as launched because roots exist
- do not import legacy tests wholesale
- do not create contract packages for workflow, store, hook, or adapter glue

## Quality and evidence

Before calling work complete, use the smallest truthful gate set from [docs/harness/05-quality-gates.md](/home/user/src/anqr/docs/harness/05-quality-gates.md).

Every completion artifact must include the evidence structure in [docs/harness/06-evidence-and-reporting.md](/home/user/src/anqr/docs/harness/06-evidence-and-reporting.md).

## Human escalation

Escalate to a human for:

- secrets and signing material
- production auth and perimeter rollout
- store submission and legal/compliance actions
- billing, ads, or approval-governed spend
- ambiguous launch-claim changes

## Companion docs

- [README.md](/home/user/src/anqr/README.md)
- [docs/README.md](/home/user/src/anqr/docs/README.md)
- [docs/harness/00-index.md](/home/user/src/anqr/docs/harness/00-index.md)
- [docs/program/01-anqr-1.0-definition.md](/home/user/src/anqr/docs/program/01-anqr-1.0-definition.md)
- [MCP-MIGRATION.md](/home/user/src/anqr/MCP-MIGRATION.md)
