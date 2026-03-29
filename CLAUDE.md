# CLAUDE.md

Read order:

1. [AGENTS.md](/home/user/src/anqr/AGENTS.md) — execution rules
2. [README.md](/home/user/src/anqr/README.md) — bootstrap truth and scope
3. [docs/README.md](/home/user/src/anqr/docs/README.md) — documentation index
4. [docs/harness/00-index.md](/home/user/src/anqr/docs/harness/00-index.md) — harness doctrine

## Harness Context

ANQR uses a Symphony Bridge (port 4319) and Codebuff Bridge (port 4318) as OpenAI-compatible gateways. Both run as user-level systemd services.

### Worktree execution environment

Symphony runner supports concurrent execution via git worktrees. When enabled:

- Each runner instance operates in an isolated worktree directory (e.g., `/home/user/src/anqr-wt1`, `/home/user/src/anqr-wt2`)
- Environment variables: `ANQR_WORKTREE_ID` (e.g., `wt1`, `wt2`, or `main`) and `ANQR_WORKTREE_PATH`
- Each worktree uses a unique branch (`symphony/wt1`, `symphony/wt2`) tracking `origin/main`
- Worktrees sync with `origin/main` before each issue execution
- Shared state (`reports/symphony/state.json`) uses file-based locking for atomicity
- Lease system prevents concurrent work on the same Linear issue
- Documentation: `docs/harness/12-concurrent-execution-with-worktrees.md`, `docs/harness/WORKTREE-QUICKSTART.md`

### Key modules (all under `scripts/ops/integrations/model/`)

- `symphony-openai-bridge.mjs` — AI SDK bridge with tool execution, provider fallback, streaming
- `symphony-credit-gate.mjs` — 4-tier provider selection (paid → free-cloud → local-proxy → local-safety-net)
- `symphony-adaptive-context.mjs` — dynamic per-provider token ceilings, rate-limit throttling, TPM/RPM tracking
- `symphony-bridge-truncation.mjs` — static token limits and message truncation
- `codebuff-openai-bridge.mjs` — Codebuff SDK exposed as OpenAI-compatible HTTP

### Bridge restart procedure (CRITICAL)

1. **Commit & push first**: `git add -A && git commit -m "..." && git push`
2. **Wait for zero concurrency**: Check Discord for "(0 concurrent)"
3. **Then restart**: `systemctl --user restart anqr-symphony-bridge` or `anqr-codebuff-bridge`
4. Update `MEMORY.md` with stop/start entries, then commit & push again

### Validation commands

For harness work:

```bash
npx vitest run scripts/ops/integrations/model/symphony-adaptive-context.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-bridge-truncation.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-credit-gate.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-openai-bridge-fallback.spec.ts
```

For product work:

```bash
npm run typecheck:all
npm run lint:all
npm run test:unit
```
