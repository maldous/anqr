# ANQR Documentation

This `docs/` directory is the canonical source of project knowledge.

## Start Here

- [Harness model](harness/agent-first.md)
- [Codebuff configuration](harness/codebuff-config.md)
- [Execution workflow](workflow/execution-workflow.md)
- [Architecture overview](architecture/overview.md)
- [Module catalog](modules/index.md)
- [Reports catalog](reports/README.md)
- [Provider operations](harness/provider-operations.md)
- [Markdown reconciliation matrix](inventory/markdown-reconciliation.md)

## Documentation Sections

- `harness/`: agent-first operating model, Codebuff configuration, autonomous framework, and documentation policy.
- `workflow/`: implementation and review workflow.
- `architecture/`: verified system architecture, runtime flows, and cross-platform QR rendering parity.
- `modules/`: module-level reference (formerly `src/modules/**/README.md`, now removed).
- `reports/`: report definitions, generation commands, and status docs.
- `operations/`: launch and operational checklists (web, iOS, Android).
- `roadmap/`: forward-looking plans and option coverage plans.
- `archive/`: historical logs and superseded snapshots.
- `inventory/`: reconciliation and ownership matrices.
- `reference/`: immutable standards and external references.

## Rules

- Update canonical docs in `docs/` first.
- Legacy markdown stubs outside `docs/` have been removed. Do not create new ones.
- Preserve [`iso-iec-18004-2015.md`](reference/iso-iec-18004-2015.md) unchanged.
- Prefer verifiable docs over narrative logs.
