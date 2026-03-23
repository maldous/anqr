# Harness Audit Reference

This document provides a comprehensive reference of all harness components for audit purposes.

---

## 1. Executive Summary

The ANQR harness is an AI-assisted engineering automation system that:
- Picks up work items (Linear issues) from a backlog
- Executes them using AI agents (Codebuff SDK or external providers via Symphony Bridge)
- Validates results through quality gates
- Reports evidence and updates issue state

**Key Components:**
- **Symphony Runner** - Main execution engine that picks up issues and executes via AI
- **Symphony Bridge** - OpenAI-compatible HTTP gateway (port 4319) using AI SDK with tool execution
- **Codebuff Bridge** - OpenAI-compatible HTTP gateway (port 4318) for Codebuff SDK
- **Credit-gate** - Provider selection and auto-fallback system with 40+ providers
- **Queue Control** - Queue maintenance and backup feeding
- **Linear Guardian** - Issue hygiene enforcement
- **Harness Report** - Continuous health monitoring

---

## 2. Systemd Services

| Service | Timer | Purpose | Script |
|---------|-------|---------|--------|
| `anqr-symphony-runner` | Every 2 min | Execute issues via AI | `symphony-runner.mjs` |
| `anqr-queue-feeder` | Every 15 min | Queue maintenance + backup feed | `symphony-queue-control.mjs --all` |
| `anqr-nightly` | Daily 02:00 | Full nightly pipeline | `nightly-ops-pass.mjs` |
| `anqr-email-ingest` | Every 5 min | Email → Linear issues | `email-ingest.mjs` |
| `anqr-codebuff-bridge` | Always-on | OpenAI-compatible Codebuff API | `codebuff-openai-bridge.mjs` |
| `anqr-symphony-bridge` | Always-on | OpenAI-compatible Symphony API with AI SDK | `symphony-openai-bridge.mjs` |

### Service Installation

```bash
# Copy service files
cp services/systemd/anqr-*.service ~/.config/systemd/user/
cp services/systemd/anqr-*.timer ~/.config/systemd/user/
cp services/systemd/anqr-ops.env ~/.config/systemd/user/

# Edit anqr-ops.env with real API keys
systemctl --user daemon-reload
systemctl --user enable --now anqr-symphony-runner.timer
```

---

## 3. Ports and Network

| Port | Service | Protocol | Auth |
|------|---------|----------|------|
| 4318 | Codebuff Bridge | HTTP (OpenAI-compatible) | Bearer: `local-bridge` |
| 4319 | Symphony Bridge | HTTP (OpenAI-compatible) | Bearer: `local-symphony` |
| 18789 | OpenClaw | HTTP (OpenAI-compatible) | Token from `~/.openclaw/openclaw.json` |
| 11434 | Ollama | HTTP | Local only |

---

## 4. Environment Files

### Sources (in priority order)

1. **Project-local**: `.env` - Developer/operator superset
2. **Harness runtime**: `~/.config/symphony/anqr.env` - Provider tokens for symphony
3. **Systemd**: `~/.config/systemd/user/anqr-ops.env` - Service environment
4. **Template**: `services/systemd/anqr-ops.env` - Repo-stored template (no secrets)

### Required Environment Variables

#### Linear
- `LINEAR_API_KEY` - Linear API key for issue management

#### Codebuff
- `CODEBUFF_API_KEY` - Primary account (tried first in paid mode, then free mode)
- `CODEBUFF_API_KEY2` - Secondary fallback account (free mode only)
- `CODEBUFF_API_KEY3` - Tertiary fallback account (free mode only)

#### Provider Tokens
- `OPENAI_API_KEY` - OpenAI/Codex (gpt-5.4)
- `GROQ_TOKEN` - Groq (llama-3.3-70b-versatile)
- `MISTRAL_TOKEN` - Mistral (devstral-small-2507)
- `GEMINI_TOKEN` - Google Gemini (gemini-2.5-flash)
- `OPENROUTER_TOKEN` - OpenRouter (40+ free models)
- `SAMBANOVA_TOKEN` - SambaNova (Meta-Llama-3.3-70B)
- `CEREBRAS_TOKEN` - Cerebras (llama3.1-8b)
- `GITHUB_MODELS_TOKEN` - GitHub Models (gpt-4.1-mini)

#### Local Models
- `OLLAMA_API_BASE` - Ollama endpoint (default: http://localhost:11434)

#### Optional
- `SONAR_HOST_URL` - SonarQube URL
- `SONAR_TOKEN` / `SONARQUBE_TOKEN` - SonarQube authentication

#### Bridge Configuration
- `CODEBUFF_BRIDGE_PORT` - Port for Codebuff bridge (default: 4318)
- `CODEBUFF_BRIDGE_API_KEY` - Bearer token for Codebuff bridge (default: local-bridge)
- `CODEBUFF_BRIDGE_CWD` - Working directory for Codebuff
- `CODEBUFF_BRIDGE_URL` - Override URL for bridge
- `CODEBUFF_MODEL_ID` - Model ID to advertise (default: codebuff/base)
- `SYMPHONY_BRIDGE_PORT` - Port for Symphony bridge (default: 4319)
- `SYMPHONY_BRIDGE_API_KEY` - Bearer token for Symphony bridge (default: local-symphony)
- `SYMPHONY_BRIDGE_ACCEPTED_TOKENS` - Additional accepted tokens (comma-separated)
- `SYMPHONY_MODEL_ID` - Model ID to advertise (default: symphony/main)

#### Symphony Runtime
- `ANQR_SYMPHONY_HOST_ID` - Unique identifier for this host
- `ANQR_SYMPHONY_LEASE_MS` - Lease duration for issue ownership (default: 120000)
- `ANQR_SYMPHONY_HISTORY_LIMIT` - Number of recent runs to keep in history

#### Email Ingest
- `ANQR_INGEST_EMAIL` - Email address for ingest processing

#### Linear
- `LINEAR_WORKSPACE` - Linear workspace identifier

---

## 5. AI Providers (40+)

### Primary Providers (Selected by Credit-gate)

| Priority | Provider | Model | Type | API Endpoint | SDK |
|----------|----------|-------|------|--------------|-----|
| 1 | codex | gpt-5.4 | HTTP | https://api.openai.com/v1 | No |
| 2 | codebuff | codebuff/base@latest | SDK | @codebuff/sdk | **Yes** |
| 3 | openclaw | openclaw:main | HTTP | http://127.0.0.1:18789/v1 | No |
| 4 | groq | llama-3.3-70b-versatile | HTTP | https://api.groq.com/openai/v1 | No |
| 5 | mistral | devstral-small-2507 | HTTP | https://api.mistral.ai/v1 | No |
| 6 | gemini | gemini-2.5-flash | HTTP | https://generativelanguage.googleapis.com/v1beta/openai | No |
| 7 | gemini-lite | gemini-2.5-flash-lite | HTTP | https://generativelanguage.googleapis.com/v1beta/openai | No |

### OpenRouter Free Models (28 models, priority 8-35)

| Model ID | Provider |
|----------|----------|
| nvidia/nemotron-3-super-120b-a12b:free | openrouter-nemotron-super |
| nvidia/nemotron-3-nano-30b-a3b:free | openrouter-nemotron-nano-30b |
| qwen/qwen3-next-80b-a3b-instruct:free | openrouter-qwen3-next-80b |
| stepfun/step-3.5-flash:free | openrouter-step3-5-flash |
| arcee-ai/trinity-mini:free | openrouter-trinity-mini |
| nvidia/nemotron-nano-9b-v2:free | openrouter-nemotron-nano-9b |
| minimax/minimax-m2.5:free | openrouter-minimax-m2.5 |
| qwen/qwen3-coder:free | openrouter-qwen3-coder |
| liquid/lfm-2.5-1.2b-thinking:free | openrouter-lfm-2.5-thinking |
| liquid/lfm-2.5-1.2b-instruct:free | openrouter-lfm-2.5-instruct |
| nvidia/nemotron-nano-12b-v2-vl:free | openrouter-nemotron-nano-12b-vl |
| arcee-ai/trinity-large-preview:free | openrouter-trinity-large |
| mistralai/mistral-small-3.1-24b-instruct:free | openrouter-mistral-small-3.1 |
| meta-llama/llama-3.3-70b-instruct:free | openrouter-llama-3.3-70b |
| qwen/qwen3-4b:free | openrouter-qwen3-4b |
| openai/gpt-oss-120b:free | openrouter-gpt-oss-120b |
| openai/gpt-oss-20b:free | openrouter-gpt-oss-20b |
| meta-llama/llama-3.2-3b-instruct:free | openrouter-llama-3.2-3b |
| cognitivecomputations/dolphin-mistral-24b-venice-edition:free | openrouter-dolphin-mistral |
| google/gemma-3-27b-it:free | openrouter-gemma-3-27b |
| z-ai/glm-4.5-air:free | openrouter-glm-4.5-air |
| google/gemma-3n-e2b-it:free | openrouter-gemma-3n-e2b |
| google/gemma-3-4b-it:free | openrouter-gemma-3-4b |
| google/gemma-3n-e4b-it:free | openrouter-gemma-3n-e4b |
| google/gemma-3-12b-it:free | openrouter-gemma-3-12b |
| nousresearch/hermes-3-llama-3.1-405b:free | openrouter-hermes-3-405b |

### Additional Providers

| Priority | Provider | Model | API Endpoint |
|----------|----------|-------|--------------|
| 36 | sambanova | Meta-Llama-3.3-70B-Instruct | https://api.sambanova.ai/v1 |
| 37 | cerebras | llama3.1-8b | https://api.cerebras.ai/v1 |
| 38 | github-models | gpt-4.1-mini | https://models.inference.githubusercontent.com/v1 |
| 39 | codebuff-bridge | codebuff/base@latest | http://127.0.0.1:4318/v1 |
| 40 | ollama-local | qwen3.5:35b-a3b-32t | http://localhost:11434 |

---

## 6. Bridges

### Codebuff Bridge (Port 4318)

**Purpose**: Exposes Codebuff SDK as OpenAI-compatible HTTP API for OpenClaw integration

**Endpoints**:
- `GET /v1/models` - List models
- `POST /v1/chat/completions` - Chat completion (streaming & non-streaming)
- `POST /chat/completions` - Alternative endpoint for OpenClaw
- `GET /health` - Health check (no auth)

**Configuration**:
- Port: `CODEBUFF_BRIDGE_PORT` (default: 4318)
- Auth: `CODEBUFF_BRIDGE_API_KEY` (default: local-bridge)
- Model: `CODEBUFF_MODEL_ID` (default: codebuff/base)
- Working Dir: `CODEBUFF_BRIDGE_CWD` (default: project root)

**Features**:
- Multi-account rotation for rate-limit fallback
- Account validation to ensure different accounts
- Streaming via Server-Sent Events (SSE)

### Symphony Bridge (Port 4319)

**Purpose**: OpenAI-compatible gateway with AI SDK for provider communication and tool execution

**Endpoints**:
- `GET /v1/models` - List models
- `POST /v1/chat/completions` - Chat completion (streaming & non-streaming)
- `GET /health` - Health check (no auth)
- `GET /v1/metrics` - Bridge + credit-gate metrics
- `GET /v1/stats` - Provider statistics

**Configuration**:
- Port: `SYMPHONY_BRIDGE_PORT` (default: 4319)
- Auth: `SYMPHONY_BRIDGE_API_KEY` (default: local-symphony)
- Model: `SYMPHONY_MODEL_ID` (default: symphony/main)

**AI SDK Providers Supported**:
- codebuff (@codebuff/sdk)
- groq (@ai-sdk/groq)
- openrouter (@openrouter/ai-sdk-provider)
- openclaw (OpenAI-compatible)
- mistral (OpenAI-compatible)
- gemini (@ai-sdk/google)
- codex (OpenAI-compatible)

**Tools Available**:
- `exec` - Execute shell commands
- `read` - Read files from filesystem
- `glob` - Find files matching pattern

Tool execution is handled automatically by AI SDK via `maxSteps` (default: 10 iterations).

---

## 7. OpenClaw Integration

### Overview

OpenClaw is an external AI agent framework that provides autonomous code editing capabilities. The ANQR harness integrates OpenClaw as an execution provider alongside Codebuff and the 40+ providers available through Symphony's credit-gate system.

### How OpenClaw Uses Symphony and Codebuff

OpenClaw acts as a wrapper layer that can route requests to multiple backends:

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Agent                            │
│              (External AI Agent Framework)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────────┐ ┌──────────┐ ┌─────────────────┐
│ Symphony Bridge │ │Codebuff  │ │ OpenClaw Native │
│    (port 4319)  │ │ Bridge   │ │    Models       │
│                 │ │(4318)    │ │  (free-rider)   │
└────────┬────────┘ └────┬─────┘ └────────┬────────┘
         │               │               │
         ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│              Credit-Gate Provider Selection                 │
│         (40+ providers with auto-fallback)                  │
│   groq, openrouter, mistral, gemini, codex, ollama...       │
└─────────────────────────────────────────────────────────────┘
```

### Provider Cascade (Priority Order)

1. **Primary**: `symphony-bridge/symphony/main` (port 4319)
   - Routes to Symphony Bridge
   - Uses AI SDK with credit-gate for 40+ provider fallback
   - Provides tool execution (exec, read, glob)
   - Bearer token: `local-symphony`

2. **Fallback 1**: `codebuff-bridge/codebuff/base@latest` (port 4318)
   - Routes to Codebuff Bridge
   - Uses Codebuff SDK directly for local code editing
   - Has internal account rotation (KEY, KEY2, KEY3)
   - Bearer token: `local-bridge`

3. **Fallback 2**: OpenClaw native free-rider models
   - OpenClaw's built-in model discovery
   - Uses publicly available free models

### Configuration (`.openclaw/models.json`)

```json
{
  "providers": {
    "codebuff-bridge": {
      "baseUrl": "http://127.0.0.1:4318",
      "apiKey": "local-bridge",
      "api": "openai-completions",
      "models": [{ "id": "codebuff/base@latest" }]
    },
    "symphony-bridge": {
      "baseUrl": "http://127.0.0.1:4319",
      "apiKey": "local-symphony",
      "api": "openai-completions",
      "models": [{ "id": "symphony/main" }]
    }
  },
  "agents": {
    "defaults": {
      "model": { "primary": "symphony-bridge/symphony/main" }
    }
  }
}
```

### Runtime Integration

When Symphony Runner executes an issue, it can:

1. **Direct Mode**: Use Codebuff SDK directly (via port 4318 bridge)
2. **Symphony Bridge Mode**: Use credit-gate providers via port 4319
3. **OpenClaw Mode**: Delegate to OpenClaw which uses Symphony/Codebuff as backends

This gives the system multiple layers of fallback:
- Within Symphony: credit-gate tries 40+ providers
- Within Codebuff: account rotation with 3 keys
- Within OpenClaw: cascades through Symphony → Codebuff → native models

---

## 8. Makefile Targets

```makefile
# Harness
harness-quick          # Run quick harness report
harness-continuous     # Run continuous harness report
harness-full           # Run full harness report
harness-doctor         # Run harness runtime diagnostics
quality-harness        # Run deeper harness and ops dry-run checks

# Symphony
symphony-run           # Run symphony runner once
symphony-run-dry-run   # Dry-run symphony runner
symphony-status        # Show symphony status

# Bridge
codebuff-bridge        # Start Codebuff OpenAI-compatible bridge
```

---

## 9. Package.json Scripts

```json
{
  "harness:quick": "node scripts/ops/harness-report.mjs quick",
  "harness:continuous": "node scripts/ops/harness-report.mjs continuous",
  "harness:full": "node scripts/ops/harness-report.mjs full",
  "harness:doctor": "node scripts/ops/harness-doctor.mjs",
  
  "symphony:run": "node scripts/ops/symphony-runner.mjs --once",
  "symphony:run:dry-run": "node scripts/ops/symphony-runner.mjs --once --dry-run",
  "symphony:status": "node scripts/ops/symphony-runner.mjs --status",
  
  "nightly": "node scripts/ops/nightly-ops-pass.mjs",
  "nightly:dry-run": "node scripts/ops/nightly-ops-pass.mjs --dry-run",
  
  "sonar:mail": "node scripts/ops/sonar-linear-mail.mjs",
  "sonar:export": "bash scripts/sonar-export.sh"
}
```

---

## 10. Control Flow

```
                    ┌─────────────────┐
                    │  Linear Issues  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Queue Control  │
                    │ (symphony-queue-│
                    │   control.mjs)  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Symphony Runner │
                    │(symphony-runner)│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────┐  ┌──────▼──────┐  ┌───▼────┐
     │Codebuff SDK │  │Symphony    │  │Fallback│
     │             │  │Bridge      │  │Providers│
     │(local)      │  │(AI SDK)    │  │(40+)   │
     └─────────────┘  └────────────┘  └────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │ Quality Gates   │
                    │ - typecheck     │
                    │ - lint          │
                    │ - depcruise     │
                    │ - tests         │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Evidence Report │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Update Linear  │
                    │  + Notify       │
                    └─────────────────┘
```

---

## 11. Quality Gates

| Check | Classification | Command |
|-------|---------------|---------|
| repo-structure | Blocking | Auto-check on file existence |
| typecheck | Blocking | `npm run typecheck:all` |
| lint | Blocking | `npm run lint:all` |
| test-unit | Blocking | `npm run test:unit` |
| depcruise | Blocking | `npm run depcruise:all` |
| ast-density | Blocking | `npm run audit:ast` |
| cspell-coverage | Advisory | `npx cspell` |
| docs-freshness | Advisory | Manual review |
| ollama-health | Advisory | Check local model |
| sonar-audit | Advisory | `npm run sonar:mail` |

---

## 12. State Files

| File | Purpose |
|------|---------|
| `reports/symphony/state.json` | Symphony runner state |
| `reports/symphony/provider-failures.json` | Provider failure timestamps |
| `reports/symphony/provider-stats.json` | Provider metrics and scores |
| `reports/codebuff/latest-{timestamp}.json` | Codebuff execution reports |

---

## 13. Files Reference

### Root Entry Points (Stable Contract)
- `scripts/ops/harness-report.mjs` - Health monitoring
- `scripts/ops/linear-guardian.mjs` - Issue hygiene
- `scripts/ops/symphony-queue-control.mjs` - Queue maintenance
- `scripts/ops/symphony-runner.mjs` - Issue execution
- `scripts/ops/nightly-ops-pass.mjs` - Nightly pipeline
- `scripts/ops/email-ingest.mjs` - Email → issues
- `scripts/ops/notify.mjs` - Notifications
- `scripts/ops/harness-doctor.mjs` - Diagnostics

### Integration Scripts
- `scripts/ops/integrations/model/codebuff-openai-bridge.mjs` - Codebuff bridge
- `scripts/ops/integrations/model/symphony-openai-bridge.mjs` - Symphony bridge
- `scripts/ops/integrations/model/symphony-credit-gate.mjs` - Provider selection
- `scripts/ops/integrations/linear/linear-client.mjs` - Linear API helper
- `scripts/ops/integrations/sonar/sonar-linear-audit.mjs` - Sonar sync

### Core Modules
- `scripts/ops/core/symphony-state.mjs` - State management
- `scripts/ops/core/symphony-validation.mjs` - Validation manifest
- `scripts/ops/symphony-config.mjs` - Configuration constants

---

## 14. Deprecation Notes

- `codebuff-sdk-runner.mjs` - Deprecated. All Codebuff calls go through HTTP bridge.
- Legacy copies under subdirectories exist but root entrypoints remain stable.

---

*Last updated: 2026-03-22*