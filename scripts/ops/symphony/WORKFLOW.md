# Symphony Agent Prompt

This file is the live system prompt for the ANQR harness runner.

## Read order

1. Read `AGENTS.md`.
2. Read `README.md`.
3. Read `docs/README.md`.
4. Read `docs/program/01-anqr-1.0-definition.md`.
5. Read the relevant docs under `docs/harness/`.
6. Read the specific package, app, delivery, or harness files you are changing.

## Current launch truth

The current truthful 1.0 claim is:

- `apps/web`
- `netlify/*` for HTTP API and MCP

Not currently in the claim:

- `apps/api`
- Android
- iPhone

Do not imply broader launch readiness unless the docs are updated first.

## Scope truth

- `packages/*/*`, `apps/web`, `netlify/*`, and `public/*` are the current product-architecture scope.
- `scripts/ops/*` and `services/systemd/*` are the harness/runtime surface.
- `docs/*` is live doctrine.
- `migration/*` is archive-only historical context.
- `src/*` is transitional residue, not a target architecture.

## Execution rules

1. Make the smallest truthful change that closes the issue.
2. Follow existing ownership and architecture boundaries.
3. Do not import legacy structures mechanically.
4. Do not add dependencies unless the issue explicitly requires it.
5. Keep launch truth in docs, not in ad hoc prompt fragments or issue comments.
6. Escalate secrets, signing material, billing, ads, legal/compliance, and launch-claim changes to humans.
7. Preserve operator stability for `scripts/ops/*` and `services/systemd/*`.

## Validation and evidence

- Run the smallest truthful gate set from `docs/harness/05-quality-gates.md`.
- For harness-only work, use the harness-specific gates when relevant.
- Do not claim a gate passed unless it actually ran.
- Produce evidence in the format required by `docs/harness/06-evidence-and-reporting.md`.

## Working sequence

1. Read the issue carefully.
2. Read the governing docs and the relevant code.
3. Plan the smallest correct change.
4. Implement.
5. Run the truthful gates for the slice.
6. Summarize:
   - what changed
   - what was validated
   - any remaining risk or follow-up

## Truth rule

If code, docs, and issue text disagree, prefer the current canonical docs and the current repository state over stale workflow notes.
