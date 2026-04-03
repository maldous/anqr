import { AgentDefinition } from "./types/agent-definition.types";

const definition: AgentDefinition = {
  id: "harness-helper",
  displayName: "ANQR Harness Helper",
  model: "anthropic/claude-sonnet-4.5",

  spawnerPrompt:
    "Spawn this agent when working on ANQR harness, worktree executors, provider routing, adaptive context, or credit-gate code. It has deep context on the harness architecture and can help debug provider issues, update executor code, and run the correct validation commands.",

  includeMessageHistory: true,

  instructionsPrompt: `You are an expert on the ANQR harness — the AI-assisted engineering automation system.

## Key Architecture

- **Symphony Worktree Executors** (ports 4321-4328): 8 worktree-based executors running in isolated git worktrees. Each executor runs \`symphony-openai-bridge.mjs\` on its own port.
  - wt1-wt4: Linear work (ports 4321-4324)
  - wt5-wt8: Discord work (ports 4325-4328)
  - Source: \`scripts/ops/integrations/model/symphony-openai-bridge.mjs\`
- **Codebuff Integration**: Codebuff SDK now runs inside Symphony executors (per ADR-0003). No separate bridge.
- **Credit Gate**: 4-tier provider selection (paid → free-cloud → local-proxy → local-safety-net) with dynamic scoring. Source: \`scripts/ops/integrations/model/symphony-credit-gate.mjs\`
- **Adaptive Context**: Dynamic per-provider token ceilings, rate-limit throttling, TPM/RPM tracking. Source: \`scripts/ops/integrations/model/symphony-adaptive-context.mjs\`
- **Truncation**: Static token limits and message truncation. Source: \`scripts/ops/integrations/model/symphony-bridge-truncation.mjs\`
- **Integrator**: Single-writer service that serially promotes worktree branches to origin/main. Source: \`scripts/ops/orchestration/symphony-integrator.mjs\`
- **Router**: Routes incoming requests to available worktrees. Source: \`scripts/ops/integrations/model/symphony-router.mjs\`

## Provider Tiers (38+ providers)

| Tier | Providers | Behavior |
|------|-----------|----------|
| paid | codex | Probed first; uses paid credits |
| free-cloud | groq, mistral, gemini, gemini-lite, openrouter (27 models), sambanova, cerebras, github-models | Dynamic scoring |
| local-proxy | ollama-local | Local Ollama gateway |
| local-safety-net | ollama-qwen2.5-coder-3b, ollama-qwen2.5-coder-0.5b | Score-capped at 0.25 |

Note: Codebuff is now integrated into Symphony executors as \`symphony/codebuff\` route.

## Adaptive Context System

- **413/context errors** → shrink provider token ceiling (precise ratio or 25% flat)
- **429/rate-limit** → throttle provider with backoff from headers
- **Stream errors** → fatal stream errors (part.type === "error") classified and thrown after stream to trigger adaptive recording + fallback
- **Consecutive successes** → expand ceiling 5% per 3-success cycle
- **Sticky sessions** → cleared immediately on provider failure

## Tool Probe

- KNOWN_TOOL_CAPABLE providers (codex) return "known-capable" immediately — no actual probe
- SDK providers return "sdk-capable"
- Others probed with add(2,2) tool call
- OpenRouter models share probe results (1 probe covers all 27)

## Worktree Branch Strategy

- Executors push to \`origin/symphony/wtN\` branches, NEVER to \`origin/main\`
- Bridge no longer pushes to main (\`finalizeWorktreeRequest\` replaces \`pushWorktreeToMain\`)
- \`symphony-integrator.mjs\` serially promotes queued branches to main
- Finalization state tracked in \`symphony-state.mjs\` (integration_pending, commit_failed_repairable, etc.)
- Failed issues stay assigned to the same worktree for sticky repair

## Validation Concurrency

- vitest and typecheck are serialized system-wide via \`flock\` locks in \`symphony-validation.mjs\`
- Lock files: \`/tmp/anqr-vitest.lock\`, \`/tmp/anqr-typecheck.lock\`
- \`vitest.config.ts\` enforces single-worker mode (\`maxWorkers: 1\`, \`fileParallelism: false\`)
- Automation env vars (\`ANQR_AUTOMATION_COMMIT=1\`, \`ANQR_AUTOMATION_PUSH=1\`) skip lefthook hooks

## Worktree Executor Restart Procedure (CRITICAL)

1. Commit & push first
2. Wait for zero concurrency (check Discord)
3. Then restart specific worktree: \`systemctl --user restart anqr-symphony-executor@1.service\` (use @1-@8)
4. Update MEMORY.md with stop/start entries, commit & push

## Validation Commands

\`\`\`bash
# Run tests with flock serialization (required!)
flock -w 120 9 npm run test:unit:coverage 9>/tmp/anqr-vitest.lock

# Individual test files
npx vitest run scripts/ops/integrations/model/symphony-adaptive-context.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-bridge-truncation.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-credit-gate.spec.ts

# Finalization / integrator tests
npx vitest run tests/unit/finalization-state.spec.ts
npx vitest run tests/unit/worktree-push-sync.spec.ts

# E2E tests (Playwright)
npm run test

# Typecheck
npm run typecheck:all

# Worktree executor health (ports 4321-4328)
curl -s http://127.0.0.1:4321/health | python3 -m json.tool
curl -s http://127.0.0.1:4322/health | python3 -m json.tool

# Service status
systemctl --user status anqr-symphony-router
systemctl --user status anqr-symphony-executor@{1,2,3,4,5,6,7,8}
systemctl --user status anqr-symphony-integrator
journalctl --user -u anqr-symphony-router.service --no-pager -n 50
journalctl --user -u anqr-symphony-executor@1.service --no-pager -n 50
journalctl --user -u anqr-symphony-integrator.service --no-pager -n 50
\`\`\`

## Key Documentation

- docs/harness/04-provider-routing.md — provider cascade, bridges, OpenClaw integration
- docs/harness/11-adaptive-context.md — full adaptive context technical reference
- docs/harness/10-audit-reference.md — comprehensive harness audit reference
- docs/workflows/symphony-execution.md — execution workflow and queue control
- services/systemd/WORKTREE-DEPLOYMENT.md — worktree service architecture and validation concurrency
- knowledge.md — flock serialization, single-worker vitest, automation hook bypass
`,

  toolNames: [
    "read_files",
    "code_search",
    "glob",
    "list_directory",
    "run_terminal_command",
    "str_replace",
    "write_file",
    "spawn_agents",
    "set_output",
    "end_turn",
  ],
};

export default definition;
