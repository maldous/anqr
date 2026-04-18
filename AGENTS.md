# AGENTS.md

This file is the repo-wide execution contract for AI agents.

## Default read order

1. `AGENTS.md`
2. `README.md`
3. `docs/README.md`
4. `docs/program/01-anqr-1.0-definition.md`
5. nearest owning `README.md`
6. only then any task-specific standard, workflow, or reference doc

For harness work, also read:

1. `docs/harness/00-index.md`
2. `harness/README.md`
3. `harness/ops/README.md`
4. `services/systemd/README.md` when runtime or timer behavior is involved

## Do not load by default

These are not part of the default reading path:

- `docs/archive/**`
- archived plans and migration notes
- historical harness review material
- runtime workspace persona templates
- `.agents/skills/**`

Read them only when the task clearly depends on them.

## Source of truth

Use this priority when documents disagree:

1. code and committed runtime files
2. nearest owning `README.md`
3. `docs/program/01-anqr-1.0-definition.md`
4. `docs/adrs/*`
5. `docs/standards/*`
6. `docs/workflows/*`
7. `docs/reference/*`
8. `docs/archive/*`

## Working rules

- Stay inside the owning surface. Do not generalize from distant docs when a local doc exists.
- Treat plans as implementation history unless they are explicitly promoted into active docs.
- Prefer one authoritative file over parallel explanations.
- Remove duplication instead of layering more bootstrap text on top.
- Keep root docs small. Push detail down to the closest owning path.
- If you change runtime behavior, update the nearest runtime doc and any affected reference doc.
- If you change a standard or workflow, update the active doc in `docs/standards/` or `docs/workflows/`.
- Do not treat runtime workspace persona files as repo-wide architecture guidance.

## Model-specific overlays

These files may add narrow bootstrap rules, but they must not redefine repo architecture:

- `CLAUDE.md`
- `CODEBUFF.md`
- `.codex/README.md`
- `.agents/SPAWN_AGENTS_GUIDE.md`

If any overlay conflicts with this file, follow `AGENTS.md`.
