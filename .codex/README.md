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
