# ANQR Documentation

This `docs/` directory is the canonical source of project knowledge.

## Start Here

- [Harness model](harness/agent-first.md)
- [Execution workflow](workflow/execution-workflow.md)
- [Architecture overview](architecture/overview.md)
- [Module catalog](modules/index.md)
- [Reports catalog](reports/README.md)
- [Markdown reconciliation matrix](inventory/markdown-reconciliation.md)

## Documentation Sections

- `harness/`: agent-first operating model and documentation policy.
- `workflow/`: implementation and review workflow.
- `architecture/`: verified system architecture and runtime flows.
- `modules/`: module-level reference moved from `src/modules/**/README.md`.
- `reports/`: report definitions, generation commands, and status docs.
- `operations/`: launch and operational checklists.
- `roadmap/`: forward-looking plans and option coverage plans.
- `archive/`: historical logs and superseded snapshots.
- `inventory/`: reconciliation and ownership matrices.
- `reference/`: immutable standards and external references.

## Rules

- Update canonical docs in `docs/` first.
- Keep legacy markdown files outside `docs/` as short compatibility stubs.
- Preserve [`ISO_IEC_18004_2015.md`](../ISO_IEC_18004_2015.md) unchanged.
- Prefer verifiable docs over narrative logs.
