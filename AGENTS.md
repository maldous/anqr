# ANQR Agent Guide

This file is intentionally short. It is a map, not the full knowledge base.

## Purpose

- Use this file as the first hop when working in the repository.
- Treat `docs/` as the system of record for project knowledge.
- Legacy markdown stubs outside `docs/` have been removed. Do not create new ones.

## Start Here

- Docs index: [`docs/README.md`](docs/README.md)
- Harness model: [`docs/harness/agent-first.md`](docs/harness/agent-first.md)
- **Autonomous framework**: [`docs/harness/autonomous-framework.md`](docs/harness/autonomous-framework.md)
- Execution workflow: [`docs/workflow/execution-workflow.md`](docs/workflow/execution-workflow.md)
- Architecture overview: [`docs/architecture/overview.md`](docs/architecture/overview.md)
- Module catalog: [`docs/modules/index.md`](docs/modules/index.md)
- Reports catalog: [`docs/reports/README.md`](docs/reports/README.md)
- Markdown reconciliation matrix: [`docs/inventory/markdown-reconciliation.md`](docs/inventory/markdown-reconciliation.md)

## Core Rules

- Update canonical docs in `docs/` first.
- Keep this file concise and link-driven.
- Preserve `docs/reference/iso-iec-18004-2015.md` as an unchanged reference source.
- When a legacy path must stay for compatibility, keep only a short pointer in that path.
- Prefer verifiable docs over narrative logs.

## Working Contract

1. Confirm ticket state and update tracking before implementation.
2. Reference the relevant Linear issue in every git commit where appropriate (e.g., `fix(ops): add provider failover (ANQ-194)`).
3. Never send emails autonomously. Inbound emails are read, reviewed, and turned into NEW actionable issues that quote the original email.
4. Use `AI Hint:` comments on Linear issues to course-correct agents when instructions are unclear, context is stale, or comments are bloated. Periodically suggest a board sanity check when failure patterns indicate issues are too complex or confusing for agents.
5. `[HUMAN]`/`[EMAIL]` issues → matthewaldous. All other issues are left unassigned — the credit-gate handles AI provider routing independently. Do NOT assign automatable issues to any user. The guardian enforces this every 15 minutes, monitors Symphony liveness, creates `[HARNESS]` issues for failing checks, and updates project health.
6. Capture reproduction evidence before code or docs changes.
7. Sync with latest `origin/master` before edits.
8. Implement against an explicit checklist.
9. Validate with deterministic commands and record outputs.
10. Keep issue metadata and workpad in sync with reality.
11. Post evidence to the Linear issue before marking Done (see [`docs/workflow/execution-workflow.md` §Evidence Policy](docs/workflow/execution-workflow.md#evidence-policy)).

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

## New Host Setup

```bash
git clone git@github-private:maldous/anqr.git && cd anqr
make bootstrap    # secrets from bootstrap.zip + npm install + git hooks + Playwright
source env        # load environment variables
make build        # verify build works
```

For a nuclear reset (equivalent to fresh clone): `make pristine`

Full bootstrap details: `scripts/bootstrap.sh` and `BOOTSTRAP-README.md` inside `bootstrap.zip`.

## Mobile Testing (Appium)

```bash
make android:build     # build debug APK
make test:appium       # run Appium tests (needs emulator or device)
```

Tests are in `tests/appium/` using WebdriverIO + Mocha. Config: `wdio.conf.ts`.
See `docs/knowledge.md` §Testing for full details.

## Frequently Used Commands

- List markdown files: `rg --files -g '*.md'`
- Find stale legacy references: `rg -n 'Moved|canonical doc|legacy stub'`
- Show changed docs: `git diff --name-only -- '*.md'`

## Decision Guide

- Need architecture context: open `docs/architecture/overview.md`.
- Need module API context: open `docs/modules/index.md`, then the module page.
- Need report expectations: open `docs/reports/README.md`.
- Need harness/ops context: open `docs/harness/autonomous-framework.md`.
- Need provider/pipeline context: open `docs/harness/provider-operations.md`.
- Need email/notification context: open `docs/operations/ops-autopilot.md` §Email Notification System.
- Need historical context: open `docs/archive/*` only after checking canonical docs.

## Maintenance Expectations

- Keep links valid and relative.
- Keep `AGENTS.md` around 100 lines and avoid deep implementation detail.
- All project knowledge lives in `docs/`. Do not create markdown outside `docs/`.
