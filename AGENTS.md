# ANQR Agent Guide

This file is intentionally short. It is a map, not the full knowledge base.

## Purpose

- Use this file as the first hop when working in the repository.
- Treat `docs/` as the system of record for project knowledge.
- Legacy markdown stubs outside `docs/` have been removed. Do not create new ones.

## Start Here

- Docs index: [`docs/README.md`](docs/README.md)
- Harness model: [`docs/harness/agent-first.md`](docs/harness/agent-first.md)
- Execution workflow: [`docs/workflow/execution-workflow.md`](docs/workflow/execution-workflow.md)
- Architecture overview: [`docs/architecture/overview.md`](docs/architecture/overview.md)
- Module catalog: [`docs/modules/index.md`](docs/modules/index.md)
- Reports catalog: [`docs/reports/README.md`](docs/reports/README.md)
- Markdown reconciliation matrix: [`docs/inventory/markdown-reconciliation.md`](docs/inventory/markdown-reconciliation.md)

## Core Rules

- Update canonical docs in `docs/` first.
- Keep this file concise and link-driven.
- Preserve `ISO_IEC_18004_2015.md` as an unchanged reference source.
- When a legacy path must stay for compatibility, keep only a short pointer in that path.
- Prefer verifiable docs over narrative logs.

## Working Contract

1. Confirm ticket state and update tracking before implementation.
2. Capture reproduction evidence before code or docs changes.
3. Sync with latest `origin/master` before edits.
4. Implement against an explicit checklist.
5. Validate with deterministic commands and record outputs.
6. Keep issue metadata and workpad in sync with reality.

## Documentation Structure

- `docs/harness/`: agent-first operating model and documentation policy.
- `docs/workflow/`: implementation and review workflow.
- `docs/architecture/`: verified system architecture and runtime flows.
- `docs/modules/`: module-level documentation (formerly `src/modules/**/README.md`, now removed).
- `docs/reports/`: report definitions, generation commands, and status docs.
- `docs/operations/`: launch and operational checklists.
- `docs/roadmap/`: forward-looking plans and option coverage plans.
- `docs/archive/`: historical working logs and superseded snapshots.
- `docs/inventory/`: reconciliation and ownership matrices.

## Frequently Used Commands

- List markdown files: `rg --files -g '*.md'`
- Find stale legacy references: `rg -n 'Moved|canonical doc|legacy stub'`
- Show changed docs: `git diff --name-only -- '*.md'`

## Decision Guide

- Need architecture context: open `docs/architecture/overview.md`.
- Need module API context: open `docs/modules/index.md`, then the module page.
- Need report expectations: open `docs/reports/README.md`.
- Need historical context: open `docs/archive/*` only after checking canonical docs.

## Maintenance Expectations

- Keep links valid and relative.
- Keep `AGENTS.md` around 100 lines and avoid deep implementation detail.
- If new knowledge appears outside `docs/`, move it into `docs/` and leave a stub.
