# ANQR architecture refactor deliverable

This package is the architecture baseline and migration kit for refactoring ANQR into a capability-oriented, maintainable frontend modular architecture.

## What this package contains

- `docs/01-executive-summary.md` — diagnosis and target state
- `docs/02-target-architecture.md` — target directory layout and terminology
- `docs/03-boundary-rules.md` — allowed dependencies and architectural fitness functions
- `docs/04-migration-plan.md` — phased migration strategy
- `docs/05-split-plans.md` — detailed split plans for the highest-risk mixed files
- `docs/06-quality-gates.md` — verification standards
- `docs/07-governance-and-standards.md` — naming, ownership, API, and review standards
- `docs/08-risk-register.md` — migration risks and controls
- `docs/09-runbook.md` — no-followup execution instructions
- `manifests/file-move-manifest.csv` — deterministic file move plan
- `manifests/file-move-manifest.json` — same plan in machine-readable form
- `manifests/symbol-splits/*.json` — curated symbol split plans for critical files
- `config/dependency-cruiser.cjs` — authoritative architecture boundary policy for CI
- `config/eslint-boundaries.config.mjs` — optional developer-feedback boundary linting
- `tools/refactor/extract-ast-v3.ts` — refined AST inventory extractor
- `tools/refactor/move-by-manifest.ts` — ts-morph move script for deterministic file moves
- `tools/refactor/verify-architecture.sh` — baseline and post-pass verification
- `tools/refactor/package-json.snippet.json` — scripts and dev dependency snippet

## Baseline evidence used

This package is based on the extracted inventory you supplied.

Global inventory:

- files: 1043
- symbols: 5056
- file dependencies: 1578
- symbol dependencies: 58313
- side-effect files: 224

Working architecture set, excluding `src/i18n/static/**`:

- files: 257
- symbols: 3130
- internal file dependencies: 749
- deterministic direct moves: 200
- split-required files: 54
- deletions of broad barrels: 3
- file-level import cycles: 0 detected

## Execution model

This refactor is designed to be executed in two tracks:

1. **Deterministic file moves**
   - apply `manifests/file-move-manifest.json`
   - use `tools/refactor/move-by-manifest.ts`

2. **Curated symbol splits**
   - use the `manifests/symbol-splits/*.json` plans
   - split the high-risk mixed files before enabling strict boundaries

## Intended outcome

The end state is:

- `app/` for bootstrapping and shell composition
- `ui/` for reusable visual primitives and composites
- `features/` for user-facing workflows
- `state/` for shared workflow/application state
- `domain/` for product logic and business capabilities
- `platform/` for browser/native/worker adapters
- `infra/` for cross-cutting technical services
- `content/` for static/generated resources

Start with `docs/09-runbook.md`.
