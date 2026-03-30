# Codex Bootstrap

This repository uses [AGENTS.md](/home/user/src/anqr/AGENTS.md) as the primary execution contract for AI agents.

Codex read order:

1. [AGENTS.md](/home/user/src/anqr/AGENTS.md) — execution rules and validation commands
2. [README.md](/home/user/src/anqr/README.md) — bootstrap truth and current scope
3. [docs/README.md](/home/user/src/anqr/docs/README.md) — documentation index
4. [docs/program/01-anqr-1.0-definition.md](/home/user/src/anqr/docs/program/01-anqr-1.0-definition.md) — launch scope
5. [docs/harness/00-index.md](/home/user/src/anqr/docs/harness/00-index.md) — harness doctrine index
6. [docs/harness/04-provider-routing.md](/home/user/src/anqr/docs/harness/04-provider-routing.md) — provider cascade, bridges, adaptive context
7. [docs/harness/11-adaptive-context.md](/home/user/src/anqr/docs/harness/11-adaptive-context.md) — dynamic token ceilings and rate management

Use [MCP-MIGRATION.md](/home/user/src/anqr/MCP-MIGRATION.md) as the migration ledger, not as the live doctrine source.

## Harness quick reference

- **Symphony Bridge** (port 4319): OpenAI-compatible gateway with 38+ providers, AI SDK tool execution, adaptive context
- **Codebuff Bridge** (port 4318): OpenAI-compatible gateway for Codebuff SDK with paid → free fallback
- **Key harness modules**: `scripts/ops/integrations/model/symphony-openai-bridge.mjs`, `symphony-credit-gate.mjs`, `symphony-adaptive-context.mjs`, `symphony-bridge-truncation.mjs`
- **Bridge restart**: commit & push → wait for zero concurrency → `systemctl --user restart anqr-symphony-bridge`
- **Harness tests**: `npx vitest run scripts/ops/integrations/model/symphony-adaptive-context.spec.ts` (and similar for truncation, credit-gate, fallback specs)

## Codex fast path

For efficient operation in this repository:

1. Use `read_docs` before `web_search` for framework/library questions.
   - This routes through ANQR's local Context7 service on `http://127.0.0.1:4320` first.
2. Use `search_linear_issues` before direct Linear/API digging when prior ANQR issue context may answer the question.
   - This routes into ANQR's local Linear RAG index instead of repeated live Linear API calls.
3. Use `find_files` or `file_search` before broad `code_search`.
   - These route into ANQR's hybrid retrieval stack (BM25 + local RAG/vector search when available).
4. Use `code_search` after retrieval narrows candidate files.
5. Avoid main-repo runner execution.
   - Harness work should run from worktrees (`/home/user/src/anqr-wt*`) when using Symphony runner paths.

Bridge startup now preloads retrieval state:

- BM25 in-memory index warm-up for faster first file-discovery request
- local vector index cache load for faster semantic retrieval
- explicit `CODEX_SANDBOX_MODE=danger-full-access` to avoid `bwrap` sandbox failures on this host
