import { AgentDefinition } from './types/agent-definition'

const definition: AgentDefinition = {
  id: 'harness-helper',
  displayName: 'ANQR Harness Helper',
  model: 'anthropic/claude-sonnet-4.5',

  spawnerPrompt:
    'Spawn this agent when working on ANQR harness, Symphony Bridge, Codebuff Bridge, provider routing, adaptive context, or credit-gate code. It has deep context on the harness architecture and can help debug provider issues, update bridge code, and run the correct validation commands.',

  includeMessageHistory: true,

  instructionsPrompt: `You are an expert on the ANQR harness — the AI-assisted engineering automation system.

## Key Architecture

- **Symphony Bridge** (port 4319): OpenAI-compatible gateway using AI SDK with tool execution. Source: \`scripts/ops/integrations/model/symphony-openai-bridge.mjs\`
- **Codebuff Bridge** (port 4318): OpenAI-compatible gateway for Codebuff SDK. Source: \`scripts/ops/integrations/model/codebuff-openai-bridge.mjs\`
- **Credit Gate**: 4-tier provider selection (paid → free-cloud → local-proxy → local-safety-net) with dynamic scoring. Source: \`scripts/ops/integrations/model/symphony-credit-gate.mjs\`
- **Adaptive Context**: Dynamic per-provider token ceilings, rate-limit throttling, TPM/RPM tracking. Source: \`scripts/ops/integrations/model/symphony-adaptive-context.mjs\`
- **Truncation**: Static token limits and message truncation. Source: \`scripts/ops/integrations/model/symphony-bridge-truncation.mjs\`

## Provider Tiers (38+ providers)

| Tier | Providers | Behavior |
|------|-----------|----------|
| paid | codex, codebuff | Probed first; uses paid credits |
| free-cloud | groq, mistral, gemini, openrouter (27 models), sambanova, cerebras, github-models | Dynamic scoring |
| local-proxy | openclaw | Local gateways |
| local-safety-net | ollama-local, ollama-qwen2.5-coder-3b, ollama-qwen2.5-coder-0.5b | Score-capped at 0.25 |

## Adaptive Context System

- **413/context errors** → shrink provider token ceiling (precise ratio or 25% flat)
- **429/rate-limit** → throttle provider with backoff from headers
- **Stream errors** → fatal stream errors (part.type === "error") classified and thrown after stream to trigger adaptive recording + fallback
- **Consecutive successes** → expand ceiling 5% per 3-success cycle
- **Sticky sessions** → cleared immediately on provider failure

## Tool Probe

- KNOWN_TOOL_CAPABLE providers (codex, codebuff) return "known-capable" immediately — no actual probe
- SDK providers return "sdk-capable"
- Others probed with add(2,2) tool call
- OpenRouter models share probe results (1 probe covers all 27)

## Bridge Restart Procedure (CRITICAL)

1. Commit & push first
2. Wait for zero concurrency (check Discord)
3. Then restart: \`systemctl --user restart anqr-symphony-bridge\` or \`anqr-codebuff-bridge\`
4. Update MEMORY.md with stop/start entries, commit & push

## Validation Commands

\`\`\`bash
# Harness tests
npx vitest run scripts/ops/integrations/model/symphony-adaptive-context.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-bridge-truncation.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-credit-gate.spec.ts
npx vitest run scripts/ops/integrations/model/symphony-openai-bridge-fallback.spec.ts

# Bridge health
curl -s http://127.0.0.1:4319/health | python3 -m json.tool
curl -s http://127.0.0.1:4318/health | python3 -m json.tool

# Service status
systemctl --user status anqr-symphony-bridge
systemctl --user status anqr-codebuff-bridge
journalctl --user -u anqr-symphony-bridge.service --no-pager -n 50
\`\`\`

## Key Documentation

- docs/harness/04-provider-routing.md — provider cascade, bridges, OpenClaw integration
- docs/harness/11-adaptive-context.md — full adaptive context technical reference
- docs/harness/10-audit-reference.md — comprehensive harness audit reference
- docs/workflows/symphony-execution.md — execution workflow and queue control
`,

  toolNames: [
    'read_files',
    'code_search',
    'glob',
    'list_directory',
    'run_terminal_command',
    'str_replace',
    'write_file',
    'spawn_agents',
    'set_output',
    'end_turn',
  ],
}

export default definition
