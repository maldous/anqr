# Concurrent Execution with Git Worktrees

## Overview

Git worktrees enable multiple concurrent Symphony runner instances to operate independently on the same repository without conflicts. Each worktree provides an isolated working directory with its own `HEAD`, `index`, and file state, while sharing the underlying git object store.

**Status:** Canonical execution model — **ALL SERVICES CURRENTLY STOPPED** (as of 2026-03-31)

**Last verified:** 2026-03-31 via `systemctl --user list-units`, `git worktree list`, `ss -tln`

---

## 1. Architecture Intent

### What We Want

The worktree system is designed to achieve:

| Intent | Description |
|--------|-------------|
| **Concurrency limit** | Maximum 8 concurrent operations (4 Symphony runners + 4 Discord worktrees) |
| **Issue source routing** | Linear-sourced issues → wt1-wt4; Discord-sourced issues → wt5-wt8 |
| **Discord isolation** | Changes from Discord requests must NEVER appear in the main repository during execution |
| **Discord dual-mode** | Discord can (a) create Linear issues for queue execution, AND (b) execute on-demand interactive goals |
| **Linear ingestion** | Linear issues in "Todo" state are picked up by Symphony runners (wt1-wt4) from queue |
| **Sync flow** | Worktree changes: commit → push to `origin/main` → other worktrees sync on next cycle |
| **Main = control plane** | The main repository (`/home/user/src/anqr`) runs services/docs/config only — no execution work |
| **Single OpenClaw** | ONE OpenClaw Gateway instance provides the Discord relay; it uses Symphony for AI |

### Discord: Two Modes of Operation

The system supports two Discord entry paths, but routing is determined by `state.source`, not simply by whether an item exists in Linear.

**Mode 1: Discord-originated Linear issue (queued)**

**Current code-accurate behavior:**

```
Discord user → bot command → Linear issue created
  → Routing depends on issue state.source
  → If state.source contains "discord": ONLY wt5-wt8 will accept it
  → If state.source does NOT contain "discord": wt1-wt4 may accept it
```

Relevant implementation:

- `symphony-runner.mjs:592-596` defines `isDiscordIssue()` by checking whether `state.source` contains `"discord"`
- `symphony-runner.mjs:626-635` makes Discord worktrees (`wt5-wt8`) skip non-Discord issues and Symphony worktrees (`wt1-wt4`) skip Discord issues

**⚠️ Architectural decision required:** If Discord-created Linear issues are tagged with `source: "discord"`, they are routed to `wt5-wt8`, NOT `wt1-wt4`. If queued Discord-created Linear issues are intended to run on `wt1-wt4`, then they must NOT be tagged with `source: "discord"`. Until the code changes, this document describes the **current code-accurate model**.

**Mode 2: On-demand goals (interactive)**

```
Discord user → sends prompt directly to OpenClaw
  → OpenClaw Gateway (port 18789) forwards to Symphony via router
  → Routed to Discord worktree (wt5-wt8) via Discord Router (port 18790)
  → Executed immediately in isolated worktree
  → Changes stay in worktree unless explicitly committed and pushed
```

- No Linear issue is required
- Request handled immediately in a Discord worktree
- File operations must resolve against the selected worktree, not the main repo
- Changes are ephemeral unless the agent commits and pushes

**Key distinction:** On-demand Discord goals always route to `wt5-wt8`. Queued Discord-created Linear issues route according to `state.source`. A Linear issue tagged `source: "discord"` is currently treated as a Discord issue by the runner code.

---

## 2. OpenClaw Architecture

### What Is OpenClaw?

OpenClaw is a **third-party CLI/gateway application** that provides:

- **Discord bot relay** — connects to Discord, receives user messages, forwards them as AI completions
- **Tool execution framework** — read, write, exec, search, and other tools for AI agents
- **Model routing** — configurable provider cascade with fallbacks
- **Gateway HTTP API** — OpenAI-compatible `/v1/chat/completions` endpoint

**OpenClaw does NOT contain the AI models.** It delegates AI processing to configured providers — in our case, the Symphony Bridge.

### OpenClaw in the ANQR Architecture

There is **ONE OpenClaw Gateway instance** (singleton on port 18789). It:

1. Connects to Discord as a bot
2. Receives user messages from Discord channels
3. Forwards them as `/v1/chat/completions` requests to the configured model provider
4. The configured provider is `symphony-bridge` which routes to **the Discord Router (port 18790)**
5. The router load-balances to worktree-specific Symphony Bridges (ports 4325-4328)
6. Symphony Bridges execute AI + tool calls in their isolated worktree directory
7. Responses stream back: Bridge → Router → OpenClaw Gateway → Discord

```
Discord User
     │
     ▼
OpenClaw Gateway (port 18789)       ← ONE instance, singleton
     │  Reads .openclaw/openclaw.json for config
     │  Uses symphony-bridge provider for AI
     ▼
Symphony Bridge Provider URL        ← Configured in openclaw.json
     │  SHOULD point to Discord Router (18790)
     │  ⚠️ models.json may override to main bridge (4319) — see Config Conflict
     ▼
Discord Request Router (port 18790)
     │  Load-balances across wt5-wt8
     │  Rebases cwd to target worktree path
     ▼
Worktree Symphony Bridges (4325-4328)
     │  Each runs in own worktree directory
     │  Tool execution (read/write/exec) scoped to worktree
     ▼
AI Provider Cascade → LLM API → Tool Execution → Response
```

### OpenClaw Configuration Hierarchy

OpenClaw reads configuration from **three locations** with merge semantics:

| # | Config File | Location | Git-Tracked | Purpose |
|---|-------------|----------|-------------|----------|
| 1 | `~/.openclaw/openclaw.json` | HOME directory | No | Global user config (OpenClaw manages this) |
| 2 | `.openclaw/openclaw.json` | In-repo (project cwd) | **Yes** | Project-level config (agents, models, gateway, workspace) |
| 3 | `.openclaw/models.json` | In-repo (project cwd) | **Yes** | Project-level model override (providers, agents) |

**Merge order (later overrides earlier):**

1. OpenClaw loads `~/.openclaw/openclaw.json` as the base
2. Merges project `.openclaw/openclaw.json` over it (both have `"mode": "merge"`)
3. Applies `.openclaw/models.json` as a dedicated models override

**Additional HOME directory files:**

| File | Purpose |
|------|---------|
| `~/.openclaw/config.json` | Basic settings (TTS, gateway HTTP endpoints) |
| `~/.openclaw/credentials/` | Auth credentials (OAuth tokens, API keys) |
| `~/.openclaw/lcm.db` | Local database |
| `~/.openclaw/models.json` | Additional model definitions |
| `~/.openclaw/memory/` | Agent memory storage |
| `~/.openclaw/agents/` | Agent definitions |

### ⚠️ Config Conflict: symphony-bridge URL (real, but not yet proven as the primary cause)

There is a **real conflict** between the two in-repo config files:

| Config File | `symphony-bridge.baseUrl` | Destination |
|-------------|---------------------------|-------------|
| `.openclaw/openclaw.json` | `http://127.0.0.1:18790/v1` | Discord Router ✅ |
| `.openclaw/models.json` | `http://127.0.0.1:4319/v1` | Main Symphony Bridge ❌ |

Both HOME and in-repo `openclaw.json` correctly point to port 18790 (the Discord Router). However, `models.json` overrides this to port 4319 (the main Symphony Bridge).

**The OpenClaw config merge order has not been empirically verified.** External review determined that this config conflict is **real but not the strongest code-proven isolation failure**. The strongest proven bug is downstream in the Codebuff bridge client cache (see Section 4A, Finding F1).

Accordingly:

- The config conflict is **real**
- Its runtime effect is **not yet proven from the archive**
- It remains a **secondary verification item** (Phase 3 of the delivery plan)
- It should no longer be treated as the strongest known root cause

**What must be verified at runtime:**

1. Which file actually wins in the live OpenClaw merge
2. Whether Discord requests are reaching port `18790` or bypassing the router
3. Whether correcting the URL changes observed routing behavior

Even if the router URL is correct, isolation can still fail unless downstream providers preserve request-local working directories.

### ⚠️ Config Issue: workspace Field (requires runtime verification)

All `.openclaw/openclaw.json` files (both HOME and in-repo, across ALL worktrees) contain:

```json
"agents": {
  "defaults": {
    "workspace": "/home/user/src/anqr"
  }
}
```

This is a legitimate configuration concern, but the external review clarified that the archive does **not** prove it is the active cause of the isolation failure under the Symphony bridge.

For the Symphony bridge specifically, request-local cwd handling is already implemented:

- `symphony-openai-bridge.mjs:448-533` — request-scoped cwd via `AsyncLocalStorage`
- `symphony-openai-bridge.mjs:617-623` — `execTool()` resolves against request cwd
- `symphony-openai-bridge.mjs:710-727` — `readFilesTool()` uses request-scoped resolution
- `symphony-openai-bridge.mjs:778-815` — `strReplaceTool()` resolves against request paths
- `symphony-openai-bridge.mjs:821-835` — `writeFileTool()` resolves against request paths

Therefore:

- For **Symphony bridge** execution, request-local cwd is clearly implemented
- For **OpenClaw native** workspace behavior, the archive is insufficient to prove override semantics
- This remains a **runtime verification item**, not the strongest proven bug

### Duplicate Gateway Services

Two mechanisms exist to run the OpenClaw Gateway:

| Service | Created By | How It Runs | Worktree-Aware |
|---------|-----------|------------|----------------|
| `openclaw-gateway.service` | OpenClaw CLI (`openclaw service install`) | Directly: `openclaw gateway --port 18789` | No |
| `anqr-discord-bridge@{5-8}.timer` | ANQR harness | Via singleton wrapper: `openclaw-gateway-singleton.mjs` | Yes (sets cwd, disables Bonjour) |

**Problem:** Both try to bind port 18789. Only one can run at a time. The `openclaw-gateway.service` is a leftover from OpenClaw's built-in service installer and should be removed.

**The ANQR custom wrapper is preferred** because it:
- Sets `cwd` to the worktree path
- Disables Bonjour/advertising (prevents hostname conflicts)
- Uses lock-based singleton coordination
- Integrates with ANQR's environment variables

---

## 3. Current Reality (Verified 2026-03-31)

### Worktree State ✅

All 9 worktrees exist and are correctly configured:

```
/home/user/src/anqr       293e876f2 [main]          - Control plane
/home/user/src/anqr-wt1   293e876f2 [symphony/wt1]  - Symphony runner #1
/home/user/src/anqr-wt2   293e876f2 [symphony/wt2]  - Symphony runner #2
/home/user/src/anqr-wt3   293e876f2 [symphony/wt3]  - Symphony runner #3
/home/user/src/anqr-wt4   293e876f2 [symphony/wt4]  - Symphony runner #4
/home/user/src/anqr-wt5   293e876f2 [symphony/wt5]  - Discord worktree #1
/home/user/src/anqr-wt6   293e876f2 [symphony/wt6]  - Discord worktree #2
/home/user/src/anqr-wt7   293e876f2 [symphony/wt7]  - Discord worktree #3
/home/user/src/anqr-wt8   293e876f2 [symphony/wt8]  - Discord worktree #4
```

**OpenClaw configs are identical across all worktrees** (confirmed via `diff`).

### Service State ❌

**ALL services are STOPPED.** No timers active. No ports listening.

```
Symphony bridge (main)        → inactive dead
Symphony bridge@{5,6,7,8}    → inactive dead
Symphony runner@{1-8}         → inactive dead    (note: @{5-8} should NOT exist)
Discord router                → inactive dead
Discord bridge@{1-8}          → inactive dead    (note: @{1-4} should NOT exist)
OpenClaw gateway (standalone) → inactive dead
Legacy single runner          → FAILED
```

**No listening ports:** 4318, 4319, 4325-4328, 18789, 18790 are all down.

### Deployed Systemd Units (Actual State)

The following units are **actually deployed** in `~/.config/systemd/user/`:

| Deployed File | In Repo | Status | Notes |
|--------------|---------|--------|-------|
| `anqr-codebuff-bridge.service` | ✅ | Matches repo | Codebuff SDK bridge |
| `anqr-context7-mcp.service` | ✅ | Matches repo | Context7 MCP docs |
| `anqr-discord-bridge@.service` | ✅ | **Differs** | Gateway singleton template |
| `anqr-discord-bridge@.timer` | ✅ | Matches repo | Gateway timer template |
| `anqr-discord-router.service` | ✅ | **Differs** | Discord load balancer |
| `anqr-email-ingest.service` | ✅ | Matches repo | Email → Linear |
| `anqr-email-ingest.timer` | ✅ | Matches repo | 5-minute interval |
| `anqr-linear-export.service` | ✅ | Matches repo | Linear issue export |
| `anqr-linear-export.timer` | ✅ | Matches repo | Daily at 02:30 |
| `anqr-nightly.service` | ✅ | Matches repo | Nightly ops pass |
| `anqr-nightly.timer` | ✅ | Matches repo | Daily at 02:00 |
| `anqr-ops.env` | ✅ | **Secrets** | API keys, tokens |
| `anqr-queue-feeder.service` | ✅ | Matches repo | Queue maintenance |
| `anqr-queue-feeder.timer` | ✅ | Matches repo | 15-minute interval |
| `anqr-rag-rebuild-linear.service` | ✅ symlink | Matches repo | Linear RAG index |
| `anqr-rag-rebuild-linear.timer` | ✅ symlink | Matches repo | Daily at 02:45 |
| `anqr-rag-rebuild.service` | ✅ | Matches repo | Source RAG index |
| `anqr-rag-rebuild.timer` | ✅ | Matches repo | Daily at 03:00 |
| `anqr-symphony-bridge.service` | ✅ | Matches repo | Main bridge (4319) |
| `anqr-symphony-bridge@.service` | ✅ | **Differs** | Worktree bridge template |
| `anqr-symphony-runner.service` | ✅ | **LEGACY** | Retired single runner |
| `anqr-symphony-runner@.service` | ✅ | **Differs** | Runner template |
| `anqr-symphony-runner.timer` | ✅ | **LEGACY** | Retired single timer |
| `anqr-symphony-runner@.timer` | ✅ | Matches repo | Runner timer template |
| `anqr-watchdog.service` | ✅ | Matches repo | Bridge watchdog |
| **`openclaw-gateway.service`** | ❌ | **DUPLICATE** | Created by OpenClaw CLI |
| **`openclaw-gateway.service.bak`** | ❌ | **STALE** | Backup of above |

### Incorrect Template Instantiations

Systemd shows units instantiated for wrong worktree IDs:

| Unit | Should Exist? | Why |
|------|--------------|-----|
| `anqr-symphony-runner@{1,2,3,4}.timer` | ✅ | Correct: runners for wt1-wt4 |
| `anqr-symphony-runner@{5,6,7,8}.timer` | ❌ | Wrong: wt5-wt8 are Discord worktrees |
| `anqr-discord-bridge@{5,6,7,8}.timer` | ✅ | Correct: gateway for wt5-wt8 |
| `anqr-discord-bridge@{1,2,3,4}.service` | ❌ | Wrong: wt1-wt4 are Symphony worktrees |

---

## 4. Gap Analysis

### 4A. External Review Findings (Proven Defects)

External code review (2026-03-31) confirmed five proven defects and corrected two prior assumptions. These findings now anchor the gap analysis and set the delivery priority.

| Finding | Evidence | Severity | Impact | Required Fix |
|---------|----------|:--------:|--------|-------------|
| **F1. Codebuff client caches the wrong cwd (FIXED)** | `codebuff-openai-bridge.mjs:348-371` — `getSharedClient(apiKey, costMode, cwd)` reuses a singleton keyed only by `costMode`; the `cwd` parameter is ignored when the cached client is reused. Requests carry request-specific `cwd` (line 1560) but the shared client may execute in a previously cached directory. | **CRITICAL** | Requests for one worktree can execute in a previously cached cwd, including the main repo. **This is the strongest proven isolation failure.** | Key the shared client by `costMode + cwd`, or disable shared-client reuse across distinct cwd values. Add an alternating-cwd regression test. |
| **F2. Control script enables the wrong runner timers (FIXED)** | `symphony-control.mjs:73-89` — `enableAllTimers()` enables runners `1` through `8`: `const runners = ["1","2","3","4","5","6","7","8"]` | **HIGH** | Discord worktrees `wt5-wt8` are incorrectly treated as runner targets | Restrict enable/start logic to `anqr-symphony-runner@{1,2,3,4}.timer` only |
| **F3. Bridge startup auto-starts runner timers (FIXED)** | `symphony-openai-bridge.mjs:6324-6338` — bridge startup invokes `symphony-control.mjs --start` | **HIGH** | Starting any bridge (including Discord worktree bridges wt5-wt8) mutates global runner state and re-enables the wrong timers from F2 | Remove this side effect entirely; runner scheduling must be operator-controlled, not bridge-start-controlled |
| **F4. Deployed systemd state does not match target topology** | Verified via `systemctl --user list-units` and deployed files: wrong Discord bridge IDs `1-4` exist, wrong runner IDs `5-8` exist, legacy single runner in FAILED state, duplicate `openclaw-gateway.service` | **HIGH** | Operational state diverges from documented topology; stale units can reintroduce incorrect behavior | Remove wrong-ID units, delete duplicate gateway, remove legacy runner, redeploy from repo |
| **F5. Architecture documentation contradicts source-routing code** | Section 1 previously said Discord-created Linear issues go through `wt1-wt4`, but `symphony-runner.mjs:592-639` shows Symphony worktrees skip ALL issues whose `state.source` contains `"discord"` | **HIGH** | Operators told a routing model that the code does not implement | Section 1 rewritten to match code (see above). Decision required on intended behavior. |

### 4B. Reviewer Corrections to Prior Assumptions

The external review corrected two claims in the earlier draft of this document:

1. **"One bridge per worktree" was overstated**
   - `symphony-openai-bridge.mjs` already uses request-scoped cwd via `AsyncLocalStorage` (lines 448-533)
   - Tool execution resolves against request-local cwd in `execTool` (617-623), `readFilesTool` (710-727), `strReplaceTool` (778-815), and `writeFileTool` (821-835)
   - A single Symphony bridge **can** serve multiple worktrees if every downstream integration preserves request-local cwd correctly
   - The current proven break is **downstream**: the Codebuff bridge client cache (F1)

2. **Config conflict is real, but not the strongest proven root cause**
   - The `.openclaw/models.json` vs `.openclaw/openclaw.json` URL conflict still needs runtime verification
   - The Codebuff cwd cache bug (F1) is stronger because it is directly proven in code and can break isolation even when routing is otherwise correct

### 4C. Revised Gap Prioritization

#### Tier 1: Proven code defects (fix first)

| Priority | Gap | Finding | Fix Phase |
|:--------:|-----|---------|:---------:|
| 1 | Codebuff client cwd caching | F1 | Phase 1 |
| 2 | Bridge startup auto-starts runner timers | F3 | Phase 1 |
| 3 | Control script enables runners 1-8 instead of 1-4 | F2 | Phase 1 |
| 4 | Deployed systemd state drift | F4 | Phase 2 |
| 5 | Documentation/code contradiction on Discord routing | F5 | Phase 0 (done) |

#### Tier 2: Unverified secondary causes (verify after code fixes)

| Gap | Status | Why Secondary |
|-----|--------|---------------|
| `models.json` may override provider URL to `4319` | Real config conflict; runtime precedence unverified | Even if routing is corrected, F1 can still leak execution across worktrees |
| OpenClaw `workspace` points to `/home/user/src/anqr` | Real config smell; live override semantics unproven | Symphony bridge itself already implements request-scoped cwd handling |
| All services stopped | Operational — not a code defect | Addressed in Phase 2/3 of delivery plan |
| Duplicate gateway service | Operational drift | Addressed in Phase 2 cleanup |
| Wrong-ID template instantiations | Subset of F4 | Addressed in Phase 2 cleanup |
| Gateway timer singleton pattern | Design smell, not a defect | Optimization for Phase 5 |
| Legacy single runner in failed state | Noise | Addressed in Phase 2 cleanup |

### 4D. Root Cause Analysis: Discord Changes Appearing in Main

This is the **primary issue** driving this investigation. The defense-in-depth model has multiple layers, but the external review identified that the **strongest proven failure is downstream client reuse**, not config routing:

| Layer | Mechanism | Status | Notes |
|-------|-----------|--------|-------|
| 0. Downstream client isolation | Codebuff shared client must preserve request-local cwd | ✅ **FIXED (F1)** | Client now keyed by `costMode + cwd`; regression test passes |
| 1. Provider URL routing | OpenClaw's configured symphony-bridge URL | ❓ **Unverified** | `models.json` conflict exists but runtime precedence not proven |
| 2. Systemd WorkingDirectory | Bridge process cwd set to worktree | ✅ Implemented | In `anqr-symphony-bridge@.service` |
| 3. Router cwd rebase | Discord router rewrites request cwd to worktree path | ✅ Implemented | In `discord-request-router.mjs` |
| 4. Bridge request-scoped cwd | Symphony bridge resolves tools against request-local cwd | ✅ Implemented | Via `AsyncLocalStorage` in bridge |
| 5. OpenClaw workspace | Anchors tool operations to configured workspace | ❓ **Unverified** | Runtime behavior not proven from archive |

**The strongest proven cause is Layer 0.** Even if layers 1-5 are all correct, a reused Codebuff client can still execute in a previously cached cwd.

**Revised fix priority (from external review):**

1. **Fix Codebuff cwd caching (F1)** — Key shared client by `costMode + cwd` or disable reuse across cwd values
2. **Remove bridge auto-start of runner timers (F3)** — Delete the side effect from bridge startup
3. **Fix `symphony-control.mjs` to enable only wt1-wt4 runners (F2)**
4. **Remove stale deployed units and duplicate gateway (F4)**
5. **Then verify OpenClaw config merge/workspace behavior at runtime**
6. **Then run real E2E isolation tests**

---

## 5. Component Architecture

### System Diagram — Two Separate Flows

**Flow 1: Discord → OpenClaw → Symphony (uses Discord worktrees wt5-wt8)**

```
Discord User
     │
     ▼
OpenClaw Gateway (port 18789)          ← SINGLETON process
     │  Reads config from .openclaw/
     │  Sends to configured symphony-bridge provider
     ▼
Discord Request Router (port 18790)    ← Load balancer
     │  Selects least-loaded wt5-wt8
     │  Rebases cwd to worktree path
     │  Adds X-Worktree-ID header
     ├──→ Symphony Bridge wt5 (port 4325, cwd: /home/user/src/anqr-wt5)
     ├──→ Symphony Bridge wt6 (port 4326, cwd: /home/user/src/anqr-wt6)
     ├──→ Symphony Bridge wt7 (port 4327, cwd: /home/user/src/anqr-wt7)
     └──→ Symphony Bridge wt8 (port 4328, cwd: /home/user/src/anqr-wt8)
              │
              ▼
          Provider Cascade → LLM API → Tool execution in worktree
              │
              ▼
          SSE stream response back: Bridge → Router → Gateway → Discord
```

**Flow 2: Linear → Runner → Symphony (uses Symphony worktrees wt1-wt4)**

```
Linear Workspace ("Todo" state issues)
     │
     ▼
Symphony Runner (timer fires every 2 min)
     │  Runs in worktree wt1-wt4
     │  Picks issue, acquires lease, filters by source
     │  WorkingDirectory = /home/user/src/anqr-wt{i}
     ▼
Main Symphony Bridge (port 4319)       ← LLM calls only
     │  Bridge provides LLM API access; tools run in runner's worktree
     │  Runner orchestrates tool execution (read/write/exec) directly
     ▼
Provider Cascade → LLM API → Tool execution
     │
     ▼
Validation → Commit → Push to origin/main → Linear updated
```

**Key difference:** In the Discord flow, the Symphony bridge is the execution entry point, but the bridge is not relying purely on `process.cwd()`. The bridge already stores request-local cwd using `AsyncLocalStorage` (`symphony-openai-bridge.mjs:448-533`) and resolves tool paths against that request context in `execTool` (617-623), `readFilesTool` (710-727), `strReplaceTool` (778-815), and `writeFileTool` (821-835).

That means a single Symphony bridge can, in principle, serve multiple worktrees safely **if every downstream provider and tool preserves request-local cwd**. The current proven break is downstream: the Codebuff bridge caches a shared `CodebuffClient` by `costMode` only and ignores `cwd` when reusing that client (`codebuff-openai-bridge.mjs:348-371`), even though requests carry request-specific cwd later in the request path.

For the Linear flow, the available evidence supports the intended model that runners operate in their own worktree context and use the bridge primarily for model access, but full end-to-end proof still requires runtime verification.

### Port Allocation

| Port | Service | Purpose |
|------|---------|---------|
| 4318 | Codebuff Bridge | Codebuff SDK as OpenAI-compatible HTTP |
| 4319 | Symphony Bridge (main) | Main provider cascade for Symphony runners |
| 4320 | Context7 MCP | Library documentation service |
| 4325 | Symphony Bridge (wt5) | Discord worktree bridge #1 |
| 4326 | Symphony Bridge (wt6) | Discord worktree bridge #2 |
| 4327 | Symphony Bridge (wt7) | Discord worktree bridge #3 |
| 4328 | Symphony Bridge (wt8) | Discord worktree bridge #4 |
| 18789 | OpenClaw Gateway | Discord bot relay (singleton) |
| 18790 | Discord Router | Load balancer: Discord → worktree bridges |

### Why Per-Worktree Bridges Are a Deployment Choice, Not a Node.js Requirement

The earlier claim that "Node.js is single-threaded, so one bridge per worktree is required" was corrected by external review. The more accurate statement is:

- The Symphony bridge already implements **request-scoped cwd isolation** via `AsyncLocalStorage`
- A shared bridge is only safe if **all downstream integrations** preserve that request-local cwd
- The currently proven isolation failure is **not** "single-threaded Node.js"; it is the **Codebuff bridge shared-client cache** (Finding F1), which reuses a client across requests without including `cwd` in the cache key

Per-worktree bridges remain a valid deployment choice for operational simplicity, fault isolation, easier observability, and lower blast radius. But they should be described as the **current deployment topology**, not as a fundamental requirement imposed by Node.js itself.

### Resource and Throughput Impact

| Resource | Idle (per worktree) | Active (execution) | Peak (validation) |
|----------|---------------------|-------------------|-------------------|
| Disk | ~200 MB | ~200 MB | ~250 MB |
| Memory | ~50 MB | 300-500 MB | 1-2 GB |
| CPU | ~0% | 5-10% | 50-100% |
| Network | 0 KB/s | 10-50 KB/s (LLM) | 100-500 KB/s |

**Throughput expectations:**

- **Single runner (baseline):** 2-3 issues/hour
- **4 concurrent Symphony runners (wt1-wt4):** 6-8 issues/hour (~150% increase)
- **4 concurrent Discord worktrees (wt5-wt8):** Up to 4 simultaneous interactive sessions
- **Combined (8 worktrees):** Up to 8 concurrent operations (4 Linear + 4 Discord)

Symphony execution is **network-bound** (70% of time waiting for LLM API calls), not CPU-bound. Concurrent worktrees exploit this idle time effectively.

---

## 6. Systemd Service Inventory

### Required Services (Target Minimal Set)

| Service | Type | Purpose | When Needed |
|---------|------|---------|-------------|
| `anqr-symphony-bridge.service` | simple | Main bridge (port 4319) | Always — runners depend on it |
| `anqr-symphony-runner@{1,2,3,4}.timer` | timer/oneshot | Symphony runners (wt1-wt4) | When processing Linear issues |
| `anqr-symphony-bridge@{5,6,7,8}.service` | simple | Worktree bridges (ports 4325-4328) | When Discord is active |
| `anqr-discord-router.service` | simple | Load balancer (port 18790) | When Discord is active |
| `anqr-discord-bridge@{5,6,7,8}.timer` | timer/simple | Gateway singleton (port 18789) | When Discord is active |

**Total target: 14 explicitly managed units** (1 bridge + 4 runner timers + 4 worktree bridges + 1 router + 4 gateway timers).

### Units That Should NOT Exist

| Unit | Problem | Action |
|------|---------|--------|
| `anqr-symphony-runner@{5,6,7,8}.timer` | wt5-wt8 are Discord worktrees, not runner targets | Disable and remove |
| `anqr-discord-bridge@{1,2,3,4}.service` | wt1-wt4 are Symphony worktrees, not Discord targets | Disable and remove |
| `anqr-symphony-runner.service` | Retired legacy single-runner (FAILED state) | Disable, remove, reset-failed |
| `anqr-symphony-runner.timer` | Retired legacy timer | Disable and remove |
| `openclaw-gateway.service` | Duplicate of ANQR gateway singleton; created by OpenClaw CLI | Remove |
| `openclaw-gateway.service.bak` | Stale backup | Remove |

### Service Details

#### Symphony Bridge (Main) — `anqr-symphony-bridge.service`

```
Port:             4319
WorkingDirectory: /home/user/src/anqr (main repo)
Type:             simple (long-running)
Restart:          on-failure
Purpose:          Provider cascade for Symphony runners (wt1-wt4)
ExecStart:        node scripts/ops/integrations/model/symphony-openai-bridge.mjs
```

#### Symphony Runners — `anqr-symphony-runner@{1,2,3,4}.timer`

```
WorkingDirectory: /home/user/src/anqr-wt{i}
Type:             oneshot (triggered by timer every 2 min)
Environment:      ANQR_WORKTREE_ID=wt{i}, ANQR_WORKTREE_PATH=/home/user/src/anqr-wt{i}
ExecStart:        node scripts/ops/orchestration/symphony-runner.mjs --once
Purpose:          Pick Linear issues from queue, execute, validate, commit, push
Timeout:          125 min (runner has 120 min internal limit)
```

**Important:** Runner script is always executed from the worktree's copy of the code but with `WorkingDirectory` set to the worktree. The runner code comes from the worktree, and all file operations happen within that worktree.

#### Worktree Symphony Bridges — `anqr-symphony-bridge@{5,6,7,8}.service`

```
Port:             432{i} (4325, 4326, 4327, 4328)
WorkingDirectory: /home/user/src/anqr-wt{i}
Type:             simple (long-running)
Restart:          on-failure
Environment:      ANQR_WORKTREE_ID=wt{i}, ANQR_WORKTREE_PATH=/home/user/src/anqr-wt{i}
ExecStart:        node /home/user/src/anqr/scripts/ops/integrations/model/symphony-openai-bridge.mjs
Purpose:          Provider cascade for Discord requests in isolated worktree
```

**Critical:** `WorkingDirectory` ensures all file operations happen in the worktree, not main. The ExecStart uses the **main repo's** script path (so one code update applies to all bridges), but the process runs in the worktree directory.

#### Discord Router — `anqr-discord-router.service`

```
Port:             18790
WorkingDirectory: /home/user/src/anqr (main repo)
Type:             simple (long-running)
Restart:          on-failure
Environment:      DISCORD_WORKTREES=5,6,7,8  MAX_CONCURRENT=4
ExecStart:        node scripts/ops/integrations/model/discord-request-router.mjs
Purpose:          Load balance Discord requests across wt5-wt8 bridges
```

**Routing logic:**

1. Receives request from OpenClaw Gateway
2. Selects least-loaded worktree (wt5-wt8)
3. Rebases `cwd` in request payload to target worktree path
4. Proxies request to worktree's Symphony bridge (port 4325-4328)
5. Returns 429 if all 4 worktrees at capacity

#### Discord/OpenClaw Gateway — `anqr-discord-bridge@{5,6,7,8}.timer`

```
Port:             18789
WorkingDirectory: /home/user/src/anqr-wt{i}
Type:             timer fires every 1 min → singleton wrapper
ExecStart:        node /home/user/src/anqr/scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs
Purpose:          Run ONE OpenClaw Gateway process via lock-based coordination
Lock file:        ~/.cache/anqr-openclaw/gateway.lock
```

**Singleton pattern:** 4 timer-based services compete for a lock file. Only one wins and runs the actual `openclaw gateway` process. If that process crashes, another timer fires within 60s and takes over.

### Architecture Optimization: Gateway Timer Pattern

The 4-timer gateway singleton pattern (4 competing services for 1 process) is wasteful. Consider replacing with:

```ini
# anqr-discord-gateway.service (proposed replacement)
[Service]
Type=simple
Restart=on-failure
RestartSec=5
ExecStart=node /home/user/src/anqr/scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs
```

This would replace 8 systemd units (4 timers + 4 services) with 1 service. Systemd's `Restart=on-failure` provides the same crash recovery without lock competition overhead.

---

## 7. Git Worktree Mechanics

### How Git Worktrees Work

**Shared across all worktrees (single copy):**

- `.git/objects/` — All commits, trees, and blobs
- `.git/refs/` — Branches, tags, and remotes
- `.git/config` — Repository configuration
- `.git/packed-refs` — Packed reference data

**Per-worktree (isolated):**

- `HEAD` — Current branch or commit
- `index` — Staging area for `git add`
- Working directory files — The actual source code
- `.git/worktrees/<name>/` — Worktree-specific metadata

### Branch Locking

Git prevents the same branch from being checked out in multiple worktrees:

```
Main repository  → main
Worktree wt1     → symphony/wt1 (tracks origin/main)
Worktree wt2     → symphony/wt2 (tracks origin/main)
...
Worktree wt8     → symphony/wt8 (tracks origin/main)
```

Each worktree branch tracks `origin/main` but pushes directly to `main` on the remote.

### Synchronization Flow

**How worktrees see each other's completed work:**

```
Step 1: Commit in worktree
  git add <files> && git commit -m "..."
  → Changes on local branch (e.g., symphony/wt1)
  → NOT visible to other worktrees yet

Step 2: Push to origin/main
  git push origin HEAD:main
  → Changes now on remote main branch
  → Automatic retry + rebase on conflict (up to 3 attempts)
  → STILL not visible to other worktrees until they sync

Step 3: Sync in other worktrees (on next cycle)
  git fetch origin main
  git merge origin/main --ff-only
  → Now this worktree sees all work pushed to main
```

**CRITICAL:** Work committed in a worktree but NOT pushed to `origin/main` is invisible to all other worktrees. Agents must push completed work immediately.

### Runner Execution Cycle (wt1-wt4)

Each runner cycle performs two syncs:

**1. Initial sync (before starting work):**

```bash
git fetch origin main
git merge origin/main --ff-only
```

Brings in all work pushed to main since last cycle.

**2. Pre-validation sync (before validation):**

```bash
# Save local changes as patch
git diff --binary --full-index HEAD -- <changed files>
git reset --hard HEAD && git clean -fd

# Fast-forward to latest main
git fetch origin main
git merge origin/main --ff-only

# Replay local changes
git apply --index --3way <saved patch>
```

- If patch replay conflicts: restore local state, return issue to Todo/Backlog
- If clean: proceed to validation against latest code from all worktrees

**3. Push with retry:**

```bash
git push origin HEAD:main  # Up to 3 retries with rebase on rejection
```

### Discord Worktree Behavior (wt5-wt8)

Discord worktrees do NOT follow the same auto-push cycle as runners:

- Changes from interactive requests stay in the worktree
- No automatic push to `origin/main`
- Agent may commit and push if explicitly asked
- Worktrees sync with main on a reset/cleanup basis, not per-request

**This is by design:** Discord is exploratory. Not every interactive request should modify the canonical codebase.

---

## 8. Configuration Reference

### OpenClaw Config Files

| File | Location | Git-Tracked | Key Settings |
|------|----------|-------------|-------------|
| `~/.openclaw/openclaw.json` | HOME dir | No | Global: models, gateway, workspace, auth, skills |
| `~/.openclaw/config.json` | HOME dir | No | TTS, gateway HTTP endpoint config |
| `~/.openclaw/models.json` | HOME dir | No | Additional model definitions |
| `.openclaw/openclaw.json` | In-repo | **Yes** | Project: models, agents, workspace, gateway |
| `.openclaw/models.json` | In-repo | **Yes** | Project: model provider overrides |

**Config merge chain:** HOME `openclaw.json` → project `openclaw.json` → project `models.json` (later wins).

### Key Config Values (Current State)

| Setting | Value | Source File | Correct? |
|---------|-------|-------------|----------|
| Gateway port | 18789 | `openclaw.json` (both) | ✅ |
| Gateway bind | loopback | `openclaw.json` (both) | ✅ |
| symphony-bridge URL | `http://127.0.0.1:18790/v1` | `openclaw.json` (both) | ✅ |
| symphony-bridge URL | `http://127.0.0.1:4319/v1` | `models.json` (in-repo) | ❌ CONFLICT (correct for runners, wrong if OpenClaw merges this over openclaw.json's 18790) |
| workspace | `/home/user/src/anqr` | `openclaw.json` (both) | ❌ Should be per-worktree |
| codebuff-bridge URL | `http://127.0.0.1:4318/v1` | Both configs | ✅ |
| Default model | `symphony-bridge/symphony/main` | `openclaw.json` (both) | ✅ |

### Harness Config Files

| File | Purpose |
|------|---------|
| `scripts/ops/core/worktree-config.mjs` | Worktree path/branch calculation |
| `scripts/ops/core/symphony-config.mjs` | Concurrency and timing configuration |
| `scripts/ops/core/symphony-state.mjs` | Shared state management with leases |

**Centralized worktree config (`worktree-config.mjs`):**

```javascript
export const PROJECT_ROOT = "/home/user/src/anqr";
export const WORKTREE_PREFIX = "anqr-wt";
export const WORKTREE_BRANCH_PREFIX = "symphony/wt";
export const DISCORD_WORKTREE_IDS = ["5", "6", "7", "8"];
export const SYMPHONY_WORKTREE_IDS = ["main", "1", "2", "3", "4"];

getWorktreePath(1)      // => "/home/user/src/anqr-wt1"
getWorktreeBranch(1)    // => "symphony/wt1"
isDiscordWorktree("5")  // => true
isSymphonyWorktree("1") // => true
```

**Concurrency config (`symphony-config.mjs`):**

```javascript
export const MAX_CONCURRENT_AGENTS = 8;  // 4 Symphony (wt1-wt4) + 4 Discord (wt5-wt8)
```

**State management (`symphony-state.mjs`):**

- **Shared state directory:** `$XDG_RUNTIME_DIR/anqr-symphony-state/` (shared across ALL worktrees)
- **State file:** `state.json` with file-based locking (`state.json.lock`)
- **Lease system:** Prevents duplicate work — one runner per issue
- **Source tracking:** Each issue record has a `source` field for routing

**CRITICAL:** State is stored OUTSIDE the git tree in a shared runtime directory. All worktrees see the same lease state, preventing race conditions.

---

## 9. Issue Source Routing

### How Routing Works

When issues are created from Discord interactions, they are tagged with `source: "discord"` in the shared state management system. The Symphony runner routes issues based on that state field.

**Discord worktrees (wt5-wt8):**

- Handle ONLY issues/requests with `source` containing "discord"
- Skip all non-Discord issues
- Dedicated to Discord bot interactions

**Symphony worktrees (wt1-wt4, main):**

- Handle all issues EXCEPT Discord-sourced ones
- Skip Discord issues entirely
- General Symphony work (Linear issues, email, manual)

### Implementation

```javascript
// In symphony-runner.mjs pickIssue()
function isDiscordIssue(issue) {
  const state = getIssueState(issue.identifier);
  return (state.source || "").toLowerCase().includes("discord");
}

// Filter based on worktree type
const candidates = todoIssues.filter((issue) => {
  const fromDiscord = isDiscordIssue(issue);
  if (isDiscordWorktree() && !fromDiscord) return false;
  if (isSymphonyWorktree() && fromDiscord) return false;
  return true;
});
```

### Lock Hierarchy

**Three levels of locking prevent conflicts:**

| Level | Mechanism | Scope | Purpose |
|-------|-----------|-------|---------|
| 1. PID lock | `/run/user/${UID}/symphony-runner/lock-wt{i}` | Per-worktree | Prevent multiple systemd instances of same runner |
| 2. Issue lease | `state.json` with file lock | Cross-worktree | Prevent multiple runners picking same issue |
| 3. Git branch lock | Git-enforced | All worktrees | Prevent same branch checkout in multiple worktrees |

---

## 10. Linear Issue Integration

### Ingestion Flow

```
Linear Workspace
     │
     │  Issues in "Todo" state with [Harness] label
     ▼
Symphony Runner (wt1-wt4, timer fires every 2 min)
     │  1. pickIssue() → queries Linear API for Todo issues
     │  2. Filters by source (excludes Discord issues)
     │  3. Checks canExecuteIssue() (cooldown, human_only, retry_exhausted)
     │  4. Acquires lease via symphony-state.mjs
     ▼
Execute issue via Symphony Bridge (port 4319)
     │  1. Read issue context and workflow
     │  2. Call LLM via provider cascade
     │  3. Agent applies file changes in worktree
     │  4. Pre-validation sync (replay on latest main)
     ▼
Validation gates (typecheck, lint, tests, depcruise)
     │
     ▼
Commit & Push to origin/main (with retry + rebase)
     │
     ▼
Linear updated → "In Review" or "Done"
     │
     ▼
Discord notification with results
```

### Queue Management

- **Queue depth targets:** 8-16 issues in Todo state (`symphony-config.mjs`)
- **Feed source:** Issues promoted from Backlog → Todo by `symphony-queue-control.mjs`
- **Stale detection:** Issues in "In Progress" for >30 min are considered stuck
- **Cooldown:** Failed issues get exponential backoff (10 min base, 60 min max)
- **Max retries:** 2 retries before marking `retry_exhausted`

---

## 11. Setup and Deployment

### Prerequisites

1. Git 2.5+ (worktree support)
2. Systemd user services (`systemctl --user`)
3. Node.js (via nvm)
4. OpenClaw CLI installed (`npm install -g openclaw`)
5. Provider API credentials in `~/.config/symphony/anqr.env`
6. Linear API key in `~/.config/systemd/user/anqr-ops.env`
7. ~2 GB free disk space (200 MB per worktree)

### Step 1: Create Worktree Pool

```bash
cd /home/user/src/anqr
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 8
```

### Step 2: Deploy ALL Systemd Services

```bash
# Copy ALL service files from repo to systemd user directory
cp services/systemd/anqr-symphony-bridge.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-bridge@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.timer ~/.config/systemd/user/
cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-bridge@.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-bridge@.timer ~/.config/systemd/user/
systemctl --user daemon-reload
```

### Step 3: Enable Services

```bash
# Core: Main Symphony bridge (must start first)
systemctl --user enable --now anqr-symphony-bridge.service

# Symphony runners (wt1-wt4 ONLY)
systemctl --user enable --now anqr-symphony-runner@{1,2,3,4}.timer

# Discord worktree bridges (wt5-wt8 ONLY)
systemctl --user enable --now anqr-symphony-bridge@{5,6,7,8}.service

# Discord router
systemctl --user enable --now anqr-discord-router.service

# Discord gateway singleton (wt5-wt8 ONLY)
systemctl --user enable --now anqr-discord-bridge@{5,6,7,8}.timer
```

### Step 4: Clean Up Legacy and Incorrect Services

```bash
# Remove retired single runner
systemctl --user disable --now anqr-symphony-runner.timer 2>/dev/null
systemctl --user disable --now anqr-symphony-runner.service 2>/dev/null
rm -f ~/.config/systemd/user/anqr-symphony-runner.service
rm -f ~/.config/systemd/user/anqr-symphony-runner.timer

# Remove wrong-ID runner instances (wt5-wt8 should NOT have runners)
systemctl --user disable --now anqr-symphony-runner@{5,6,7,8}.timer 2>/dev/null

# Remove wrong-ID discord-bridge instances (wt1-wt4 should NOT have discord bridges)
systemctl --user disable --now anqr-discord-bridge@{1,2,3,4}.timer 2>/dev/null

# Remove duplicate OpenClaw gateway service (created by OpenClaw CLI)
systemctl --user disable --now openclaw-gateway.service 2>/dev/null
rm -f ~/.config/systemd/user/openclaw-gateway.service
rm -f ~/.config/systemd/user/openclaw-gateway.service.bak

systemctl --user daemon-reload
systemctl --user reset-failed
```

### Step 5: Fix OpenClaw Config (CRITICAL)

```bash
# Fix models.json to point symphony-bridge to router (not main bridge)
cd /home/user/src/anqr
# Edit .openclaw/models.json: change symphony-bridge baseUrl from 4319 to 18790
# "baseUrl": "http://127.0.0.1:4319/v1" → "http://127.0.0.1:18790/v1"
```

### Step 6: Verify

```bash
# Check worktrees
git worktree list

# Check services
systemctl --user list-timers | grep anqr
systemctl --user list-units --type=service | grep anqr | grep running

# Check ports
ss -tln | grep -E '(4319|4325|4326|4327|4328|18789|18790)'

# Check health endpoints
curl -s http://127.0.0.1:4319/health | jq '.status'   # Main bridge
curl -s http://127.0.0.1:18790/health | jq '.status'  # Discord router
curl -s http://127.0.0.1:4325/health | jq '.status'   # Worktree bridge wt5
```

---

## 12. Operations

### Monitoring

```bash
# Service status overview
systemctl --user list-units --type=service | grep anqr
systemctl --user list-timers | grep anqr

# Runner logs (all worktrees)
journalctl --user -u 'anqr-symphony-runner@*.service' -f

# Specific worktree bridge logs
journalctl --user -u anqr-symphony-bridge@5.service -f

# Discord router logs
journalctl --user -u anqr-discord-router.service -f

# Worktree health
node scripts/ops/orchestration/symphony-worktree-pool.mjs status

# Queue health
node scripts/ops/orchestration/symphony-queue-control.mjs --check
```

### Discord Router Health

```bash
curl http://127.0.0.1:18790/health | jq
```

**Expected response:**

```json
{
  "status": "ok",
  "maxConcurrent": 4,
  "activeRequests": 0,
  "availableSlots": 4,
  "worktrees": [
    { "id": 5, "activeRequests": 0, "healthy": true },
    { "id": 6, "activeRequests": 0, "healthy": true },
    { "id": 7, "activeRequests": 0, "healthy": true },
    { "id": 8, "activeRequests": 0, "healthy": true }
  ]
}
```

### Stopping and Restarting

**CRITICAL: Follow the bridge restart procedure in AGENTS.md.** Never restart bridges during active concurrent requests.

```bash
# Stop task execution first
node scripts/ops/orchestration/symphony-control.mjs --stop

# Wait for zero concurrency, then restart
systemctl --user restart anqr-symphony-bridge.service

# Resume task execution
node scripts/ops/orchestration/symphony-control.mjs --start
```

### Troubleshooting

**Problem: Discord commands execute in main repo**

```bash
# Check 1: Verify models.json doesn't override symphony-bridge URL to 4319
jq '.providers["symphony-bridge"].baseUrl' .openclaw/models.json
# Should be http://127.0.0.1:18790/v1 (NOT 4319)

# Check 2: Are worktree bridges actually running?
systemctl --user status anqr-symphony-bridge@{5,6,7,8}.service

# Check 3: Is the router running and routing correctly?
curl http://127.0.0.1:18790/health | jq

# Check 4: Verify bridge working directories
for i in 5 6 7 8; do
  echo "wt$i: $(systemctl --user show anqr-symphony-bridge@$i.service -p WorkingDirectory)"
done

# Check 5: Verify OpenClaw config workspace
for i in 5 6 7 8; do
  echo "wt$i workspace: $(jq -r '.agents.defaults.workspace' /home/user/src/anqr-wt$i/.openclaw/openclaw.json)"
done
```

**Problem: Overload errors (429)**

```bash
curl http://127.0.0.1:18790/health | jq '.activeRequests, .maxConcurrent'
```

**Problem: Git merge conflicts in worktree**

```bash
cd /home/user/src/anqr-wt1
git fetch origin main
git reset --hard origin/main
git clean -fd
```

**Problem: Stale worktree state**

```bash
node scripts/ops/orchestration/symphony-worktree-pool.mjs repair
# Nuclear option:
node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 8
```

### Keeping Deployed Services in Sync

After modifying any service file in the repo:

```bash
# Re-deploy ALL service files
cp services/systemd/anqr-*.service services/systemd/anqr-*.timer ~/.config/systemd/user/ 2>/dev/null
systemctl --user daemon-reload

# Restart affected services
systemctl --user restart <service-name>
```

---

## 13. Architecture Optimization Recommendations

### Recommendation 1: Fix Codebuff cwd Caching (CRITICAL — Immediate) [F1]

The shared `CodebuffClient` in `codebuff-openai-bridge.mjs:348-371` is keyed by `costMode` only. When requests arrive with different `cwd` values (from different worktrees), the cached client may execute in the previously cached directory.

**Fix options:**
- Key the shared client by `costMode + cwd` (create separate client per unique cwd)
- Disable shared-client reuse entirely across distinct cwd values
- Reset the shared client when `cwd` changes

**Validation:** Add a regression test that alternates requests between two different cwd values and proves they cannot cross-contaminate.

### Recommendation 2: Remove Bridge Auto-Start of Runner Timers (CRITICAL — Immediate) [F3]

Delete the block at `symphony-openai-bridge.mjs:6324-6338` that calls `symphony-control.mjs --start` on bridge startup. Bridge startup must not mutate global runner scheduling state. Runner scheduling must be explicitly operator-controlled.

### Recommendation 3: Fix Control Script Runner Scope (CRITICAL — Immediate) [F2]

Update `symphony-control.mjs:73-89` so `enableAllTimers()` only enables `anqr-symphony-runner@{1,2,3,4}.timer`, not 1-8. The `disableAllTimers()` function should be reviewed similarly.

### Recommendation 4: Clean Up Deployed Systemd State (HIGH — Immediate) [F4]

Remove wrong-ID units, duplicate gateway, and legacy runner. Redeploy all service files from repo. See Section 11 for commands.

### Recommendation 5: Verify OpenClaw Config Merge/Workspace at Runtime (HIGH — After Code Fixes)

The `models.json` config conflict and `workspace` field are real concerns but their runtime behavior is unverified. After fixing the proven code defects (R1-R4), verify empirically which config wins and whether workspace overrides bridge cwd.

### Recommendation 6: Remove Duplicate Gateway Service (HIGH — Immediate)

Delete `~/.config/systemd/user/openclaw-gateway.service` and `.bak`. The ANQR `anqr-discord-bridge@.service` is the correct gateway mechanism.

**Warning:** Running `openclaw service install` or `openclaw doctor` may recreate the standalone service. Document this so operators know to re-remove it.

### Recommendation 7: Simplify Gateway to Single Service (MEDIUM)

Replace 4 competing timer services with one direct service that runs `openclaw gateway` directly (not via the singleton wrapper, since systemd itself provides crash recovery):

```ini
# anqr-discord-gateway.service (proposed replacement)
[Service]
Type=simple
Restart=on-failure
RestartSec=5
WorkingDirectory=/home/user/src/anqr-wt5
ExecStart=/usr/bin/openclaw gateway --port 18789 --no-bonjour
```

This eliminates 8 systemd units (4 timers + 4 services) in favor of 1. Systemd's `Restart=on-failure` provides the same crash recovery without lock-file competition overhead. The singleton wrapper (`openclaw-gateway-singleton.mjs`) would no longer be needed.

### Recommendation 8: Prevent Wrong Template Instantiation (MEDIUM)

Add guards to service templates:

```ini
# In anqr-symphony-runner@.service
ExecStartPre=/bin/sh -c 'echo %i | grep -qE "^[1-4]$" || { echo "ERROR: Runner only valid for wt1-wt4, got wt%i"; exit 1; }'

# In anqr-discord-bridge@.service
ExecStartPre=/bin/sh -c 'echo %i | grep -qE "^[5-8]$" || { echo "ERROR: Discord bridge only valid for wt5-wt8, got wt%i"; exit 1; }'
```

### Recommendation 9: Automated Service Deployment (MEDIUM)

Add a deployment script or Makefile target:

```bash
# make deploy-services
cp services/systemd/anqr-*.service services/systemd/anqr-*.timer ~/.config/systemd/user/ 2>/dev/null
systemctl --user daemon-reload
```

### Recommendation 10: Service Dependency Chain (LOW)

**Additional hardening recommendations from external review:**

### Recommendation 11: Jittered Exponential Backoff for Push Retries (MEDIUM)

The current 3-retry push mechanism is acceptable for light contention but weak under bursty concurrent pushes. Add jittered exponential backoff and keep the issue in a resumable state instead of hard-failing.

### Recommendation 12: Ephemeral Discord Worktree Model (MEDIUM)

Long-lived dirty Discord worktrees accumulate uncommitted state from multiple interactive sessions. Consider clean scratch worktrees or ephemeral session branches per request/session instead of permanent wt5-wt8.

### Recommendation 13: Discord-Facing Security Restrictions (MEDIUM)

Discord is a public-facing input channel. Discord-facing execution should be stricter than internal queue execution:
- Restrict or gate `exec` for Discord-originated requests
- Consider running Discord bridges under a more restricted user or with reduced capabilities
- Validate/sanitize incoming requests at the router level

### Recommendation 14: Service Dependency Chain (LOW)

Add `Requires=` and `After=` directives for correct startup order:

```
anqr-symphony-bridge.service          (must start first)
  └─ anqr-symphony-runner@{1-4}.timer (depends on bridge)
  └─ anqr-symphony-bridge@{5-8}.service (can start independently)
     └─ anqr-discord-router.service   (depends on worktree bridges)
        └─ anqr-discord-gateway.service (depends on router)
```

---

## 14. Action Items

### Immediate: Fix Proven Code Defects (Phase 1) ✅ COMPLETE

- [x] **Fix Codebuff cwd caching (F1)** — Shared client now keyed by `costMode + cwd`
- [x] **Remove bridge auto-start of runner timers (F3)** — Auto-start removed from bridge startup
- [x] **Fix control script runner scope (F2)** — `enableAllTimers()` now enables only runners 1-4
- [x] **Add alternating-cwd regression test** — `codebuff-cwd-isolation.spec.ts` (6 tests, all pass)

### Immediate: Clean Up Deployed State (Phase 2)

- [ ] **Remove wrong-ID runner instances** — Disable runner@{5,6,7,8}
- [ ] **Remove wrong-ID discord-bridge instances** — Disable discord-bridge@{1,2,3,4}
- [ ] **Remove legacy single runner** — Disable and delete from systemd
- [ ] **Remove duplicate `openclaw-gateway.service`** — Delete from systemd
- [ ] **Re-deploy all service files from repo** — Copy to `~/.config/systemd/user/`

### Short-term: Runtime Verification (Phase 3)

- [ ] **Verify OpenClaw config merge order** — Determine which URL wins at runtime
- [ ] **Verify OpenClaw workspace behavior** — Determine if workspace overrides bridge cwd
- [ ] **Fix `models.json` if needed** — Based on Phase 3 findings
- [ ] **Fix workspace if needed** — Based on Phase 3 findings

### Short-term: E2E Validation (Phase 4)

- [ ] **Discord isolation test** — File created via Discord exists ONLY in wt5-8
- [ ] **Linear execution test** — Issue processed, committed, pushed from wt1-4
- [ ] **Concurrent operation test** — 8 simultaneous ops without conflict

### Medium-term: Hardening (Phase 5)

- [ ] **Jittered exponential backoff for push retries**
- [ ] **Ephemeral Discord worktree model** — Replace long-lived dirty worktrees
- [ ] **Discord-facing security restrictions** — Gate `exec` for Discord requests
- [ ] **Replace gateway timer pattern** — Single service with `Restart=on-failure`
- [ ] **Add ID guards to service templates** — Prevent wrong instantiation
- [ ] **Add service dependency chain** — `Requires=` / `After=` directives
- [ ] **Create deployment script** — Automate service file sync from repo

---

## 15. Creating an Archive for External Review

To create a zip archive of all worktree-related files for external review:

```bash
cd /home/user/src/anqr

# Create archive directory
mkdir -p /tmp/anqr-worktree-review

# Documentation
cp docs/harness/12-concurrent-execution-with-worktrees.md /tmp/anqr-worktree-review/
cp docs/harness/discord-worktree-routing.md /tmp/anqr-worktree-review/
cp docs/harness/WORKTREE-QUICKSTART.md /tmp/anqr-worktree-review/
cp services/systemd/WORKTREE-DEPLOYMENT.md /tmp/anqr-worktree-review/
cp AGENTS.md /tmp/anqr-worktree-review/

# Implementation files
mkdir -p /tmp/anqr-worktree-review/implementation
cp scripts/ops/core/worktree-config.mjs /tmp/anqr-worktree-review/implementation/
cp scripts/ops/core/symphony-config.mjs /tmp/anqr-worktree-review/implementation/
cp scripts/ops/core/symphony-state.mjs /tmp/anqr-worktree-review/implementation/
cp scripts/ops/orchestration/symphony-runner.mjs /tmp/anqr-worktree-review/implementation/
cp scripts/ops/orchestration/symphony-worktree-pool.mjs /tmp/anqr-worktree-review/implementation/
cp scripts/ops/orchestration/symphony-control.mjs /tmp/anqr-worktree-review/implementation/
cp scripts/ops/integrations/model/symphony-openai-bridge.mjs /tmp/anqr-worktree-review/implementation/
cp scripts/ops/integrations/model/discord-request-router.mjs /tmp/anqr-worktree-review/implementation/
cp scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs /tmp/anqr-worktree-review/implementation/

# Systemd service files (from repo)
mkdir -p /tmp/anqr-worktree-review/services-repo
cp services/systemd/anqr-symphony-bridge.service /tmp/anqr-worktree-review/services-repo/
cp services/systemd/anqr-symphony-bridge@.service /tmp/anqr-worktree-review/services-repo/
cp services/systemd/anqr-symphony-runner.service /tmp/anqr-worktree-review/services-repo/
cp services/systemd/anqr-symphony-runner@.service /tmp/anqr-worktree-review/services-repo/
cp services/systemd/anqr-symphony-runner.timer /tmp/anqr-worktree-review/services-repo/
cp services/systemd/anqr-symphony-runner@.timer /tmp/anqr-worktree-review/services-repo/
cp services/systemd/anqr-discord-router.service /tmp/anqr-worktree-review/services-repo/
cp services/systemd/anqr-discord-bridge@.service /tmp/anqr-worktree-review/services-repo/
cp services/systemd/anqr-discord-bridge@.timer /tmp/anqr-worktree-review/services-repo/
cp services/systemd/anqr-codebuff-bridge.service /tmp/anqr-worktree-review/services-repo/
cp services/systemd/anqr-watchdog.service /tmp/anqr-worktree-review/services-repo/

# Deployed systemd files (actual running versions)
mkdir -p /tmp/anqr-worktree-review/services-deployed
cp ~/.config/systemd/user/anqr-*.service /tmp/anqr-worktree-review/services-deployed/ 2>/dev/null
cp ~/.config/systemd/user/anqr-*.timer /tmp/anqr-worktree-review/services-deployed/ 2>/dev/null
cp ~/.config/systemd/user/openclaw-gateway.service /tmp/anqr-worktree-review/services-deployed/ 2>/dev/null
cp ~/.config/systemd/user/openclaw-gateway.service.bak /tmp/anqr-worktree-review/services-deployed/ 2>/dev/null

# OpenClaw configs (REDACT API KEYS)
mkdir -p /tmp/anqr-worktree-review/config
cp .openclaw/openclaw.json /tmp/anqr-worktree-review/config/openclaw-inrepo.json
cp .openclaw/models.json /tmp/anqr-worktree-review/config/models-inrepo.json
cp ~/.openclaw/openclaw.json /tmp/anqr-worktree-review/config/openclaw-home.json 2>/dev/null
cp ~/.openclaw/config.json /tmp/anqr-worktree-review/config/config-home.json 2>/dev/null
# Additional implementation files
cp scripts/ops/integrations/model/codebuff-openai-bridge.mjs /tmp/anqr-worktree-review/implementation/

# MEMORY.md (operational context)
cp MEMORY.md /tmp/anqr-worktree-review/ 2>/dev/null

# Test files (worktree-related tests)
mkdir -p /tmp/anqr-worktree-review/tests
cp tests/integration/worktree-concurrency.spec.ts /tmp/anqr-worktree-review/tests/ 2>/dev/null
cp scripts/ops/orchestration/symphony-worktree-pool.spec.ts /tmp/anqr-worktree-review/tests/ 2>/dev/null

# Type declarations
cp scripts/ops/orchestration/symphony-worktree-pool.mjs.d.ts /tmp/anqr-worktree-review/implementation/ 2>/dev/null

# Benchmark analysis
cp scripts/ops/orchestration/analyze-worktree-benchmark.mjs /tmp/anqr-worktree-review/implementation/ 2>/dev/null

# Additional harness context docs
mkdir -p /tmp/anqr-worktree-review/context
cp docs/harness/00-index.md /tmp/anqr-worktree-review/context/ 2>/dev/null
cp docs/standards/harness-architecture.md /tmp/anqr-worktree-review/context/ 2>/dev/null
cp docs/harness/02-runtime-and-services.md /tmp/anqr-worktree-review/context/ 2>/dev/null
cp docs/harness/04-provider-routing.md /tmp/anqr-worktree-review/context/ 2>/dev/null
cp docs/harness/discord-duplicate-requests-fix.md /tmp/anqr-worktree-review/context/ 2>/dev/null

# Redact API keys comprehensively from all config copies
find /tmp/anqr-worktree-review/config/ -name '*.json' -exec sed -i -E \
  's/sk-or-v1-[a-f0-9]+/REDACTED/g;
   s/sk-ant-[a-zA-Z0-9_-]+/REDACTED/g;
   s/sk_[a-f0-9]+/REDACTED/g;
   s/gsk_[a-zA-Z0-9]+/REDACTED/g;
   s/xai-[a-zA-Z0-9]+/REDACTED/g;
   s/lin_api_[a-zA-Z0-9]+/REDACTED/g;
   s/"token": "[^"]+"/"token": "REDACTED"/g;
   s/"apiKey": "[^"]+"/"apiKey": "REDACTED"/g;
   s/"secret": "[^"]+"/"secret": "REDACTED"/g;
   s/"key": "[^"]+"/"key": "REDACTED"/g' {} \;

# Redact API keys from deployed services
find /tmp/anqr-worktree-review/services-deployed/ -type f -exec sed -i -E \
  's/=[a-zA-Z0-9_-]{20,}/=REDACTED/g;
   s/LINEAR_API_KEY=.*/LINEAR_API_KEY=REDACTED/g;
   s/OPENAI_API_KEY=.*/OPENAI_API_KEY=REDACTED/g;
   s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=REDACTED/g;
   s/GROQ_API_KEY=.*/GROQ_API_KEY=REDACTED/g;
   s/CODEBUFF_API_KEY=.*/CODEBUFF_API_KEY=REDACTED/g;
   s/SENTRY_AUTH_TOKEN=.*/SENTRY_AUTH_TOKEN=REDACTED/g;
   s/DISCORD_BOT_TOKEN=.*/DISCORD_BOT_TOKEN=REDACTED/g;
   s/XAI_API_KEY=.*/XAI_API_KEY=REDACTED/g;
   s/GOOGLE_API_KEY=.*/GOOGLE_API_KEY=REDACTED/g;
   s/MISTRAL_API_KEY=.*/MISTRAL_API_KEY=REDACTED/g;
   s/LINKUP_API_KEY=.*/LINKUP_API_KEY=REDACTED/g;
   s/CONTEXT7_API_KEY=.*/CONTEXT7_API_KEY=REDACTED/g;
   s/SONAR_TOKEN=.*/SONAR_TOKEN=REDACTED/g' {} \;

# Evidence from completed delivery phases (if any exist)
cp -r reports/worktree-e2e-evidence/ /tmp/anqr-worktree-review/evidence/ 2>/dev/null

# System state snapshots
mkdir -p /tmp/anqr-worktree-review/state
git worktree list > /tmp/anqr-worktree-review/state/worktree-list.txt 2>&1
systemctl --user list-units --type=service --all 2>&1 | grep -E '(anqr|openclaw|symphony|discord)' > /tmp/anqr-worktree-review/state/systemd-units.txt
systemctl --user list-timers --all 2>&1 | grep -E '(anqr|openclaw)' > /tmp/anqr-worktree-review/state/systemd-timers.txt
ss -tln 2>&1 | grep -E '(4318|4319|4320|4325|4326|4327|4328|18789|18790)' > /tmp/anqr-worktree-review/state/listening-ports.txt

# Create zip
cd /tmp
zip -r anqr-worktree-review.zip anqr-worktree-review/
echo "Archive created: /tmp/anqr-worktree-review.zip"
```

---

## 16. Rollback

### Reduce to Single Runner

```bash
# Stop all worktree runners
systemctl --user stop 'anqr-symphony-runner@*.timer'

# Stop Discord services
systemctl --user stop 'anqr-symphony-bridge@*.service'
systemctl --user stop anqr-discord-router.service
systemctl --user stop 'anqr-discord-bridge@*.timer'

# Start single runner only
systemctl --user enable --now anqr-symphony-runner@1.timer
```

**Data safety:** All state is in the shared runtime directory (`$XDG_RUNTIME_DIR/anqr-symphony-state/`) — no data loss on rollback.

---

## 17. Phased Delivery Plan

This delivery plan follows the external reviewer's priority order. Proven code defects are fixed first, deployment drift is cleaned up second, unverified config behavior is tested third, and only then does the plan proceed to end-to-end validation.

### Requirements Traceability Matrix

| Req ID | Requirement | Source | Phase | Validation |
|--------|-------------|--------|:-----:|------------|
| **R1** | Discord execution must never modify the main repository | Architecture intent + review | Phase 1, 3, 4 | A1, A2, A3, A4 |
| **R2** | Shared provider clients must preserve request-local cwd across requests | **F1** | Phase 1 | Alternating-cwd regression test + A1 |
| **R3** | Bridge startup must not enable or start runner timers | **F3** | Phase 1 | Code inspection + startup smoke test |
| **R4** | `symphony-control.mjs --start` must enable only runners 1-4 | **F2** | Phase 1 | Code inspection + `systemctl --user list-timers` |
| **R5** | Deployed systemd topology must contain no wrong-ID runners/bridges, no legacy single runner, and no duplicate gateway | **F4** | Phase 2 | `systemctl --user` snapshot |
| **R6** | Documentation must describe Discord-created Linear issue routing consistently with `state.source` behavior | **F5** | Phase 0 (done) | Doc review + B2 |
| **R7** | OpenClaw provider URL merge precedence must be verified at runtime | Reviewer Q1 | Phase 3 | Runtime verification log/evidence |
| **R8** | OpenClaw workspace behavior must be verified at runtime | Reviewer Q2 | Phase 3 | Runtime verification + A1/A3 |
| **R9** | Overflow behavior must reject or queue work, never fall back to the main repo | Architecture intent | Phase 4 | A5, C4 |
| **R10** | Push retry behavior should tolerate contention more robustly | Reviewer Q5 | Phase 5 | Stress validation |
| **R11** | Discord execution should use a clean scratch model or ephemeral session branches | Reviewer Q6 | Phase 5 | Ops/design acceptance |
| **R12** | Discord-facing execution must apply stricter security controls, especially around `exec` | Reviewer Q7 | Phase 5 | Security review / deployment check |
| **R13** | Linear issues routed to wt1-wt4, Discord on-demand goals routed to wt5-wt8 | Architecture intent | Phase 4 | B1, B2, A1 |
| **R14** | Max 8 concurrent operations enforced | Architecture intent | Phase 4 | C1, C4 |

**How to read this matrix:**
- **Requirement** is derived from the Architecture Intent table (Section 1)
- **Gap #** references the Gap Analysis (Section 4) — a dash means no gap exists for this requirement
- **Delivery Phase** shows when the fix/verification happens
- **Test IDs** reference E2E tests in Section 18 — a dash means the requirement is verified by inspection, not testing
- **Acceptance Criterion** is what must be true for the requirement to be considered met

**Traceability rule:** Every requirement MUST have either a test ID or an explicit inspection step. No requirement may be marked "done" without evidence.

### Phase 0: Documentation & External Review ← COMPLETE

**Objective:** Produce accurate documentation, share with third-party reviewer, incorporate feedback.

**Tasks:**

- [x] Investigate entire worktree architecture (services, configs, implementations)
- [x] Document architecture intent vs current reality
- [x] Identify and document all gaps with severity ratings
- [x] Document OpenClaw config hierarchy and merge conflict
- [x] Create zip archive for external review (Section 15)
- [x] Add phased delivery plan (this section)
- [x] Add end-to-end testing strategy (Section 18)
- [x] Add reviewer briefing (Section 19)
- [x] Share zip with third-party reviewer
- [x] Incorporate reviewer feedback (5 proven defects F1-F5, see Section 4A)

**Gate criteria:**

| Criterion | Evidence | Status |
|-----------|----------|--------|
| Documentation covers all components | Sections 1-16 complete | ✅ Done |
| Gap analysis with root cause | Section 4 — 9 gaps identified | ✅ Done |
| Delivery plan defined | This section | ✅ Done |
| E2E test strategy defined | Section 18 | ✅ Done |
| Reviewer feedback incorporated | 5 proven defects documented in Section 4A, delivery plan restructured | ✅ Done |

**Evidence artifacts:**

- `/tmp/anqr-worktree-review.zip` — archive of all relevant files
- This document — gap analysis, architecture assessment, delivery plan
- Reviewer feedback notes (to be added after review)

---

### Phase 1: Fix Proven Code Defects ← COMPLETE

**Objective:** Eliminate the known code-level defects before testing config hypotheses. External review established that these are the strongest proven isolation failures.

**Tasks (in reviewer-recommended priority order):**

- [x] **Fix Codebuff cwd caching (F1)** — `getSharedClient()` now keyed by both `costMode` and `cwd`; recreates client when either changes
  - File: `scripts/ops/integrations/model/codebuff-openai-bridge.mjs` lines 348-390
  - Added `SHARED_CLIENT_CWD` tracking variable alongside `SHARED_CLIENT_COST_MODE`
  - Regression test: `scripts/ops/integrations/model/codebuff-cwd-isolation.spec.ts` (6 tests, all pass)
- [x] **Remove bridge startup auto-start of runner timers (F3)** — Removed `symphony-control.mjs --start` call from bridge startup
  - Bridge startup now logs informational message about independent runner management
  - Runner scheduling is now exclusively operator-controlled
- [x] **Fix control script runner scope (F2)** — `enableAllTimers()` now enables only `anqr-symphony-runner@{1,2,3,4}.timer`
  - `disableAllTimers()` intentionally uses glob to stop ALL timers (including stale wrong-ID ones)

**Gate criteria:**

| Criterion | Evidence | Status |
|-----------|----------|--------|
| Codebuff client keyed by `costMode + cwd` | `getSharedClient()` checks both `SHARED_CLIENT_COST_MODE` and `SHARED_CLIENT_CWD` | ✅ Done |
| Alternating-cwd regression test passes | `codebuff-cwd-isolation.spec.ts` — 6 tests, all pass | ✅ Done |
| Bridge startup no longer calls symphony-control | Auto-start block replaced with informational log | ✅ Done |
| `symphony-control.mjs --start` only affects runners 1-4 | `enableAllTimers()` uses `["1", "2", "3", "4"]` only | ✅ Done |

**Evidence artifacts:**

- Code diffs for F1, F2, F3 fixes
- Regression test output: `codebuff-cwd-isolation.spec.ts` — 6 tests, all pass
- Updated documentation with confirmed gate statuses

**Rollback:** Revert the three code fix commits (F1, F2, F3).

**Commit checkpoint:**
```bash
git add -A
git commit -m "fix(harness): Phase 1 — fix F1/F2/F3 proven code defects with regression test"
git push
```

---

### Phase 2: Clean Up Deployed Systemd State ← NEXT PHASE

**Objective:** Make deployed units match intended topology. Remove wrong-ID instances, legacy services, and duplicate gateway.

**Tasks:**

- [ ] **Fix `models.json` symphony-bridge URL** — Based on Phase 1 findings:
  - If `models.json` wins: change `baseUrl` from `4319` to `18790`
  - If `openclaw.json` wins: remove `symphony-bridge` from `models.json` to avoid confusion
  - If neither is the root cause: investigate alternative causes
- [ ] **Fix OpenClaw workspace** — Based on Phase 1 findings:
  - If workspace overrides cwd: implement `ExecStartPre` to generate per-worktree config
  - If cwd wins: document that workspace is ignored (still fix for correctness)
  - If neither: bridge must strip workspace from incoming requests
- [ ] **Remove duplicate `openclaw-gateway.service`** — Delete from `~/.config/systemd/user/`
- [ ] **Commit config changes** — `git add .openclaw/models.json && git commit -m "fix(config): ..."` then push to all worktrees

**Gate criteria:**

| Criterion | Evidence | Status |
|-----------|----------|--------|
| Config conflict resolved | `jq` output showing correct URL in effective config | ⬜ |
| Workspace fix applied | Per-worktree workspace verified | ⬜ |
| Duplicate gateway removed | `ls ~/.config/systemd/user/openclaw*` returns nothing | ⬜ |
| Changes committed and pushed | `git log --oneline -1` shows fix commit | ⬜ |
| All worktrees synced | `git worktree list` shows same HEAD across all | ⬜ |

**Evidence artifacts:**

- Before/after config diff
- Commit hash
- `jq` output showing resolved config values

**Rollback:** `git revert <commit>` to restore previous config.

**Commit checkpoint:**
```bash
git add .openclaw/ docs/harness/
git commit -m "fix(config): Phase 2 complete — OpenClaw config conflict resolved, workspace fixed"
git push
# Sync to all worktrees:
for wt in 1 2 3 4 5 6 7 8; do
  git -C /home/user/src/anqr-wt$wt fetch origin main && \
  git -C /home/user/src/anqr-wt$wt merge origin/main --ff-only || \
  echo "⚠️ wt$wt sync failed — may need manual reset"
done
# Verify all synced to same commit:
for wt in 1 2 3 4 5 6 7 8; do
  echo "wt$wt: $(git -C /home/user/src/anqr-wt$wt log --oneline -1)"
done
```

---

### Phase 3: Systemd Cleanup & Deployment

**Objective:** Clean up incorrect/legacy services and deploy correct versions from repo.

**Tasks:**

- [ ] **Disable and remove wrong-ID instances:**
  ```bash
  systemctl --user disable --now anqr-symphony-runner@{5,6,7,8}.timer 2>/dev/null
  systemctl --user disable --now anqr-discord-bridge@{1,2,3,4}.timer 2>/dev/null
  ```
- [ ] **Remove legacy single runner:**
  ```bash
  systemctl --user disable --now anqr-symphony-runner.timer 2>/dev/null
  systemctl --user disable --now anqr-symphony-runner.service 2>/dev/null
  rm -f ~/.config/systemd/user/anqr-symphony-runner.service
  rm -f ~/.config/systemd/user/anqr-symphony-runner.timer
  ```
- [ ] **Deploy ALL service files from repo:**
  ```bash
  cp services/systemd/anqr-symphony-bridge.service ~/.config/systemd/user/
  cp services/systemd/anqr-symphony-bridge@.service ~/.config/systemd/user/
  cp services/systemd/anqr-symphony-runner@.service ~/.config/systemd/user/
  cp services/systemd/anqr-symphony-runner@.timer ~/.config/systemd/user/
  cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
  cp services/systemd/anqr-discord-bridge@.service ~/.config/systemd/user/
  cp services/systemd/anqr-discord-bridge@.timer ~/.config/systemd/user/
  systemctl --user daemon-reload
  systemctl --user reset-failed
  ```
- [ ] **Verify clean state:**
  ```bash
  systemctl --user list-units --type=service --all | grep -E '(anqr|openclaw)'
  # Should show only correct units, no failed/stale entries
  ```

**Gate criteria:**

| Criterion | Evidence | Status |
|-----------|----------|--------|
| No wrong-ID instances | `systemctl` output shows no runner@{5-8} or discord-bridge@{1-4} | ⬜ |
| No legacy runner | No `anqr-symphony-runner.service` or `.timer` (non-template) | ⬜ |
| All repo services deployed | `diff` between repo and deployed shows no differences | ⬜ |
| No duplicate gateway | No `openclaw-gateway.service` in systemd | ⬜ |
| Clean systemctl output | No FAILED units | ⬜ |

**Evidence artifacts:**

- `systemctl --user list-units --all | grep anqr` output (saved)
- `diff` output between repo and deployed services
- Screenshot/log of clean state

**Rollback:** Re-copy previous deployed files from backup or git history.

**Commit checkpoint:**
```bash
git add services/systemd/ docs/harness/
git commit -m "fix(harness): Phase 3 complete — systemd cleanup and deployment"
git push
```

---

### Phase 4: Service Startup & Smoke Testing

**Objective:** Start all services in correct order and verify basic health.

**Tasks:**

- [ ] **Start services in dependency order:**
  ```bash
  # 1. Main Symphony bridge (dependency for everything)
  systemctl --user enable --now anqr-symphony-bridge.service
  sleep 5
  curl -s http://127.0.0.1:4319/health | jq

  # 2. Symphony runners (wt1-wt4)
  systemctl --user enable --now anqr-symphony-runner@{1,2,3,4}.timer

  # 3. Worktree bridges (wt5-wt8)
  systemctl --user enable --now anqr-symphony-bridge@{5,6,7,8}.service
  sleep 5
  for i in 5 6 7 8; do curl -s http://127.0.0.1:432$i/health | jq '.status'; done

  # 4. Discord router
  systemctl --user enable --now anqr-discord-router.service
  sleep 3
  curl -s http://127.0.0.1:18790/health | jq

  # 5. Discord gateway singleton (wt5-wt8)
  systemctl --user enable --now anqr-discord-bridge@{5,6,7,8}.timer
  ```
- [ ] **Verify all ports listening:**
  ```bash
  ss -tln | grep -E '(4319|4325|4326|4327|4328|18789|18790)'
  # Should show 7 listening ports
  ```
- [ ] **Verify all health endpoints:**
  ```bash
  for port in 4319 4325 4326 4327 4328 18790; do
    echo "Port $port: $(curl -s http://127.0.0.1:$port/health | jq -r '.status')"
  done
  ```

**Gate criteria:**

| Criterion | Evidence | Status |
|-----------|----------|--------|
| Main bridge healthy | `curl :4319/health` returns `{"status": "ok"}` | ⬜ |
| All 4 worktree bridges healthy | `:4325-4328/health` all return OK | ⬜ |
| Discord router healthy | `:18790/health` returns OK with 4 worktrees | ⬜ |
| OpenClaw gateway running | Port 18789 listening, Discord bot online | ⬜ |
| Runner timers active | `systemctl --user list-timers` shows 4 runner timers | ⬜ |
| 7 ports listening | `ss -tln` confirms all expected ports | ⬜ |
| No service failures | `systemctl --user --failed` shows nothing anqr-related | ⬜ |

**Evidence artifacts:**

- Health check output for all endpoints
- `systemctl --user list-timers` output
- `ss -tln` port listing
- `journalctl` startup logs (no errors)

**Rollback:** `systemctl --user stop` all services; return to Phase 3 state.

**Commit checkpoint:**
```bash
mkdir -p reports/worktree-e2e-evidence/phase4
systemctl --user list-units --type=service | grep anqr > reports/worktree-e2e-evidence/phase4/services.txt
ss -tln | grep -E '(4319|4325|4326|4327|4328|18789|18790)' > reports/worktree-e2e-evidence/phase4/ports.txt
git add reports/worktree-e2e-evidence/phase4/
git commit -m "evidence(harness): Phase 4 smoke test — all services running"
git push
```

---

### Phase 5: Discord Flow End-to-End Validation

**Objective:** Prove that Discord requests are routed through worktree bridges and file changes are isolated from main.

**Test 5.1: Discord Isolation Test (CRITICAL)**

```
Preconditions:
  - All services running (Phase 4 gate passed)
  - Main repo clean: no untracked files in /home/user/src/anqr/

Steps:
  1. Record the main repo state:
     ls -la /home/user/src/anqr/ > /tmp/main-before.txt

  2. Send a Discord message to the OpenClaw bot:
     "Create a file called DISCORD-TEST-{timestamp}.txt containing 'isolation test'"

  3. Wait for completion (response appears in Discord)

  4. Check main repo for the file:
     ls /home/user/src/anqr/DISCORD-TEST-*.txt
     # EXPECTED: No such file (file should NOT be in main)

  5. Check each Discord worktree for the file:
     for wt in 5 6 7 8; do
       echo "wt$wt: $(ls /home/user/src/anqr-wt$wt/DISCORD-TEST-*.txt 2>&1)"
     done
     # EXPECTED: File exists in exactly ONE worktree (the one that handled the request)

  6. Check router logs for routing evidence:
     journalctl --user -u anqr-discord-router.service --since "5 min ago" | grep -i worktree
     # EXPECTED: Shows which worktree was selected

  7. Clean up test file from worktree:
     rm /home/user/src/anqr-wt*/DISCORD-TEST-*.txt

Pass criteria:
  ✅ File created in exactly one Discord worktree (wt5-wt8)
  ✅ File NOT present in main repo
  ✅ File NOT present in Symphony worktrees (wt1-wt4)
  ✅ Router logs show correct routing decision

Fail criteria:
  ❌ File appears in main repo → Config routing still broken
  ❌ File appears in wt1-wt4 → Source routing broken
  ❌ File not created anywhere → Bridge tool execution broken
  ❌ No router logs → Request bypassed router entirely
```

**Test 5.2: Discord Response Streaming Test**

```
Steps:
  1. Send a Discord message requiring a multi-paragraph response:
     "Explain in 3 paragraphs how git worktrees work"

  2. Observe Discord for streaming response

  3. Check router and bridge logs for streaming evidence:
     journalctl --user -u anqr-discord-router.service --since "5 min ago"
     journalctl --user -u 'anqr-symphony-bridge@*.service' --since "5 min ago"

Pass criteria:
  ✅ Response appears in Discord
  ✅ Response content is coherent and complete
  ✅ Bridge logs show successful completion
  ✅ No error entries in any logs
```

**Test 5.3: Discord Concurrent Requests Test**

```
Steps:
  1. Send 4 Discord messages in rapid succession (from different channels or threads):
     "Write the number 1 to CONCURRENT-TEST-1.txt"
     "Write the number 2 to CONCURRENT-TEST-2.txt"
     "Write the number 3 to CONCURRENT-TEST-3.txt"
     "Write the number 4 to CONCURRENT-TEST-4.txt"

  2. Wait for all completions

  3. Check router health for concurrent tracking:
     curl http://127.0.0.1:18790/health | jq

  4. Check that files are distributed across worktrees:
     for wt in 5 6 7 8; do
       echo "wt$wt: $(ls /home/user/src/anqr-wt$wt/CONCURRENT-TEST-*.txt 2>/dev/null)"
     done

  5. Clean up test files

Pass criteria:
  ✅ All 4 requests completed successfully
  ✅ Files distributed across multiple worktrees (not all in one)
  ✅ Router health shows 0 active requests after completion
  ✅ No files in main repo
```

**Gate criteria:**

| Criterion | Evidence | Status |
|-----------|----------|--------|
| Test 5.1 PASSED — Discord isolation confirmed | File in worktree only, not main | ⬜ |
| Test 5.2 PASSED — Streaming works | Response in Discord, clean logs | ⬜ |
| Test 5.3 PASSED — Concurrent requests work | Files distributed, no conflicts | ⬜ |
| All evidence saved | Screenshots, logs, file listings | ⬜ |

**If tests FAIL:**
- Check which directory the file appeared in (main? wrong worktree?)
- Review bridge logs: `journalctl --user -u 'anqr-symphony-bridge@*.service' --since '10 min ago'`
- Review router logs: `journalctl --user -u anqr-discord-router.service --since '10 min ago'`
- If file in main → config routing still broken → return to Phase 1/2
- If file nowhere → bridge tool execution broken → check bridge health and cwd
- If no router logs → request bypassed router → verify OpenClaw provider URL

**Commit checkpoint:**
```bash
mkdir -p reports/worktree-e2e-evidence/phase5
journalctl --user -u anqr-discord-router.service --since "30 min ago" \
  > reports/worktree-e2e-evidence/phase5/router-logs.txt
journalctl --user -u 'anqr-symphony-bridge@*.service' --since "30 min ago" \
  > reports/worktree-e2e-evidence/phase5/bridge-logs.txt
for wt in 5 6 7 8; do
  ls -la /home/user/src/anqr-wt$wt/*TEST* 2>/dev/null \
    >> reports/worktree-e2e-evidence/phase5/worktree-file-state.txt
done
ls -la /home/user/src/anqr/*TEST* 2>/dev/null \
  > reports/worktree-e2e-evidence/phase5/main-file-state.txt
git add reports/worktree-e2e-evidence/phase5/
git commit -m "evidence(harness): Phase 5 complete — Discord isolation E2E validated"
git push
```

---

### Phase 6: Linear Flow End-to-End Validation

**Objective:** Prove that Linear issues are picked up by runners, executed in worktrees, and committed/pushed correctly.

**Test 6.1: Linear Issue Execution Test**

```
Preconditions:
  - All services running (Phase 4 gate passed)
  - At least one runner timer active
  - Main repo clean and synced

Steps:
  1. Create a test Linear issue:
     node --input-type=module -e "
       import { createIssue, STATES, LABELS } from './scripts/ops/integrations/linear/linear-client.mjs';
       const issue = await createIssue({
         title: 'E2E Test: Create LINEAR-TEST file',
         description: 'Create a file called LINEAR-TEST-{timestamp}.txt containing the text: linear integration test passed. Then run validation (typecheck, lint).',
         stateId: STATES.todo,
         labelIds: [LABELS.harness],
         priority: 1
       });
       console.log('Created:', issue.identifier);
     "

  2. Wait for runner to pick up the issue (up to 5 minutes — timer fires every 2 min)

  3. Monitor runner logs:
     journalctl --user -u 'anqr-symphony-runner@*.service' -f

  4. When execution completes, verify:
     a. Issue state changed in Linear (In Review or Done)
     b. File exists in the committed code:
        git log --oneline -5  # Should show the commit
        ls LINEAR-TEST-*.txt  # Should exist after git pull
     c. The commit was made from a Symphony worktree (wt1-wt4):
        git log -1 --format="%B"  # Commit message should reference worktree

  5. Verify the file was NOT created via a Discord worktree:
     # Check state.json for the issue's lease owner
     cat $XDG_RUNTIME_DIR/anqr-symphony-state/state.json | jq '.issues["ANQ-XXXX"]'
     # lease.owner should be "ubuntu-symphony-wt{1-4}"

  6. Clean up test file:
     git rm LINEAR-TEST-*.txt && git commit -m "test: clean up E2E test artifact" && git push

Pass criteria:
  ✅ Issue picked up by runner within 5 minutes
  ✅ Execution completed (issue moved to Done/In Review)
  ✅ File committed and pushed to origin/main
  ✅ Lease owner was a Symphony worktree (wt1-wt4), NOT Discord
  ✅ Validation gates passed (typecheck, lint)
  ✅ Discord notification sent with results
```

**Test 6.2: Linear Source Routing Test**

```
Steps:
  1. Create a Linear issue with Discord source tag:
     # Set source: "discord" in state.json for this issue

  2. Verify Symphony runners (wt1-wt4) SKIP this issue:
     journalctl --user -u 'anqr-symphony-runner@*.service' | grep -i "skip.*discord"

  3. Verify Discord worktrees (wt5-wt8) would pick it up:
     # Check runner routing logic in logs

Pass criteria:
  ✅ Symphony runners skip Discord-sourced issues
  ✅ Routing log messages confirm source-based filtering
```

**Gate criteria:**

| Criterion | Evidence | Status |
|-----------|----------|--------|
| Test 6.1 PASSED — Linear issue executed | Commit in git log, issue state changed | ⬜ |
| Test 6.2 PASSED — Source routing works | Runner logs show correct filtering | ⬜ |
| All evidence saved | Logs, git log, Linear screenshots | ⬜ |

**If tests FAIL:**
- If issue not picked up → check runner timers: `systemctl --user list-timers | grep runner`
- If issue picked by wrong worktree → check source routing in `symphony-runner.mjs`
- If validation fails → check worktree code is synced: `git -C /home/user/src/anqr-wt1 log --oneline -1`
- If push fails → check for merge conflicts: `git -C /home/user/src/anqr-wt1 status`

**Commit checkpoint:**
```bash
mkdir -p reports/worktree-e2e-evidence/phase6
journalctl --user -u 'anqr-symphony-runner@*.service' --since "30 min ago" \
  > reports/worktree-e2e-evidence/phase6/runner-logs.txt
git log --oneline -5 > reports/worktree-e2e-evidence/phase6/recent-commits.txt
cp $XDG_RUNTIME_DIR/anqr-symphony-state/state.json \
  reports/worktree-e2e-evidence/phase6/state.json 2>/dev/null
git add reports/worktree-e2e-evidence/phase6/
git commit -m "evidence(harness): Phase 6 complete — Linear flow E2E validated"
git push
```

---

### Phase 7: Concurrent Operation & Stress Validation

**Objective:** Prove the system handles simultaneous Discord and Linear work without conflicts.

**Test 7.1: Simultaneous Discord + Linear Test**

```
Steps:
  1. Create 2 Linear issues (queued for runners)
  2. Immediately send 2 Discord requests
  3. Monitor all worktrees simultaneously:
     watch -n 2 'for wt in 1 2 3 4 5 6 7 8; do
       echo "wt$wt: $(git -C /home/user/src/anqr-wt$wt status --short 2>/dev/null | head -3)";
     done'
  4. Wait for all completions
  5. Verify:
     a. Linear issues committed from wt1-wt4
     b. Discord files created in wt5-wt8
     c. No cross-contamination (Discord files in wt1-4 or Linear commits from wt5-8)
     d. State.json shows correct lease owners
     e. No merge conflicts during push

Pass criteria:
  ✅ All 4 operations completed successfully
  ✅ Strict worktree separation maintained
  ✅ No merge conflicts
  ✅ State.json consistent (no orphaned leases)
```

**Test 7.2: Max Concurrency Test**

```
Steps:
  1. Create 4 Linear issues (saturate wt1-wt4)
  2. Send 4 Discord requests (saturate wt5-wt8)
  3. Send a 5th Discord request:
     # EXPECTED: 429 response from router (all slots full)
  4. Create a 5th Linear issue:
     # EXPECTED: Queued, not picked up until a runner is free

Pass criteria:
  ✅ Max 4 concurrent Linear executions
  ✅ Max 4 concurrent Discord executions
  ✅ 5th Discord request gets 429 (not silently routed to main)
  ✅ 5th Linear issue waits in queue
```

**Test 7.3: Worktree Sync Verification**

```
Steps:
  1. Runner in wt1 commits and pushes a change
  2. Wait for wt2's next cycle (2 min)
  3. Verify wt2 synced the change:
     git -C /home/user/src/anqr-wt2 log --oneline -1
     # Should show wt1's commit

Pass criteria:
  ✅ Changes from one worktree visible in another after sync
  ✅ No merge conflicts during sync
```

**Gate criteria:**

| Criterion | Evidence | Status |
|-----------|----------|--------|
| Test 7.1 PASSED — Simultaneous ops work | All 4 ops complete, no cross-contamination | ⬜ |
| Test 7.2 PASSED — Max concurrency enforced | 429 on overflow, queue waiting | ⬜ |
| Test 7.3 PASSED — Worktree sync works | Cross-worktree visibility confirmed | ⬜ |
| All evidence saved | Logs, state.json snapshots, git logs | ⬜ |

**If tests FAIL:**
- If cross-contamination → isolation broken at a specific layer → trace which layer (config, router, bridge cwd, workspace)
- If 5th request not rejected → router concurrency tracking broken → check `MAX_CONCURRENT` config
- If sync fails → worktree diverged → `git fetch origin main && git reset --hard origin/main`

**Commit checkpoint:**
```bash
mkdir -p reports/worktree-e2e-evidence/phase7
journalctl --user -u 'anqr-symphony-runner@*.service' --since "1 hour ago" \
  > reports/worktree-e2e-evidence/phase7/runner-logs.txt
journalctl --user -u anqr-discord-router.service --since "1 hour ago" \
  > reports/worktree-e2e-evidence/phase7/router-logs.txt
journalctl --user -u 'anqr-symphony-bridge@*.service' --since "1 hour ago" \
  > reports/worktree-e2e-evidence/phase7/bridge-logs.txt
for wt in 1 2 3 4 5 6 7 8; do
  echo "wt$wt: $(git -C /home/user/src/anqr-wt$wt log --oneline -1 2>&1)" \
    >> reports/worktree-e2e-evidence/phase7/worktree-heads.txt
done
cp $XDG_RUNTIME_DIR/anqr-symphony-state/state.json \
  reports/worktree-e2e-evidence/phase7/state.json 2>/dev/null
curl -s http://127.0.0.1:18790/health \
  > reports/worktree-e2e-evidence/phase7/router-health.json 2>/dev/null
git add reports/worktree-e2e-evidence/phase7/
git commit -m "evidence(harness): Phase 7 complete — concurrent operation stress-tested"
git push
```

---

### Phase 8: Documentation Finalization & Acceptance

**Objective:** Update all documentation to reflect verified operational state. Obtain sign-off.

**Tasks:**

- [ ] **Update this document:**
  - Change status from "ALL SERVICES CURRENTLY STOPPED" to operational
  - Replace all "UNVERIFIED" / "likely" / "may" language with confirmed facts
  - Update Section 3 (Current Reality) with verified running state
  - Update gap analysis to mark resolved gaps
  - Fill in all gate criteria checkboxes
  - Add evidence links/references
- [ ] **Update supporting docs:**
  - `docs/harness/discord-worktree-routing.md` — remove "CRITICAL" config warnings if resolved
  - `docs/harness/WORKTREE-QUICKSTART.md` — update with verified working procedure
  - `services/systemd/WORKTREE-DEPLOYMENT.md` — mark known issues as resolved
- [ ] **Update MEMORY.md** — Record operational status, completion date, lessons learned
- [ ] **Update AGENTS.md** — Ensure harness workflow section reflects verified architecture
- [ ] **Commit all documentation:**
  ```bash
  git add docs/harness/ services/systemd/WORKTREE-DEPLOYMENT.md MEMORY.md AGENTS.md
  git commit -m "docs(harness): finalize worktree documentation — all phases validated"
  git push
  ```
- [ ] **Create final evidence archive:**
  Run the zip command from Section 15 again to capture the final state

**Gate criteria (ACCEPTANCE):**

| Criterion | Evidence | Status |
|-----------|----------|--------|
| All Phase 1-7 gates passed | Checkboxes filled, evidence saved | ⬜ |
| No "UNVERIFIED" language in docs | Grep confirms | ⬜ |
| All 9 gaps from Section 4 addressed | Each gap marked resolved or accepted-with-mitigation | ⬜ |
| Discord isolation proven | Phase 5 test evidence | ⬜ |
| Linear execution proven | Phase 6 test evidence | ⬜ |
| Concurrent operation proven | Phase 7 test evidence | ⬜ |
| All services running | `systemctl` and `ss` output | ⬜ |
| Documentation committed | Git commit hash | ⬜ |
| Operator sign-off | Human confirmation | ⬜ |

**Evidence artifacts (final):**

- Final zip archive with all evidence
- Git commit hash for documentation
- Summary report with all phase outcomes

---

### Delivery Plan Summary

```
Phase 0: Documentation & Review     [COMPLETE] Gate: Reviewer feedback incorporated ✅
  │
  ▼
Phase 1: Fix Proven Code Defects    [COMPLETE] Gate: F1/F2/F3 fixed, regression test passes ✅
  │
  ▼
Phase 2: Clean Up Deployed State               Gate: Clean systemd state, no stale units
  │
  ▼
Phase 3: Runtime Config Verification           Gate: OpenClaw merge/workspace verified empirically
  │
  ▼
Phase 4: Service Startup & Smoke Testing       Gate: All 7 ports listening, health OK
  │
  ▼
Phase 5: Discord Flow E2E Validation           Gate: Isolation proven (file not in main)
  │
  ▼
Phase 6: Linear Flow E2E Validation            Gate: Issue executed, committed, pushed
  │
  ▼
Phase 7: Concurrent Operation Validation       Gate: 8 concurrent ops, no conflicts
  │
  ▼
Phase 8: Documentation & Acceptance            Gate: All docs updated, operator sign-off
```

**Estimated timeline:** 2-4 hours active work across Phases 1-7. Note: timer-based runners fire every 2 minutes, so Linear tests (Phase 6) require 5-10 minutes of wait time per test. Total wall-clock time including waits: 4-6 hours.

**Critical path:** Phase 1 (code defect fixes) → Phase 2 (systemd cleanup) → Phase 4 (startup) → Phase 5 (Discord isolation test). The code fixes are the highest-priority items because they represent the strongest proven isolation failures.

**Key change from earlier drafts:** The delivery plan was restructured based on external review feedback. Proven code defects (F1-F3) are now fixed BEFORE config verification, because the Codebuff cwd cache bug can break isolation even when routing is otherwise correct.

**Evidence summary:** Every phase produces committed evidence in `reports/worktree-e2e-evidence/phase{N}/`. The final archive (rebuilt from Section 15) will include all evidence directories. This provides a complete audit trail from discovery through acceptance.

---

## 18. End-to-End Testing Strategy

### Testing Philosophy

The worktree system spans multiple processes, config files, and services. Unit tests cannot validate the integration between OpenClaw → Router → Bridge → Worktree. **Only end-to-end tests with real (or realistically emulated) Discord and Linear traffic can prove the system works.**

### Test Environment Requirements

| Requirement | Purpose | How to Verify |
|-------------|---------|---------------|
| All services running | Full system under test | Phase 4 gate passed |
| Discord bot online | Send test messages | Bot appears online in Discord |
| Linear API access | Create test issues | `LINEAR_API_KEY` set, API responds |
| Provider API access | AI model calls succeed | At least one provider in cascade available |
| Clean main repo | Detect any leakage | `git status` shows clean working tree |
| Clean worktrees | Detect test artifacts | All worktrees synced to HEAD |

### Test Categories

#### Category A: Discord Isolation (CRITICAL — Primary Acceptance Criterion)

These tests prove the core requirement: **Discord requests must NOT modify the main repository.**

| Test ID | Description | Pass Criterion |
|---------|-------------|----------------|
| A1 | File creation via Discord | File in wt5-8, NOT in main |
| A2 | File modification via Discord | Modified file in wt5-8, main unchanged |
| A3 | Code execution via Discord | `exec` output from worktree cwd |
| A4 | Concurrent Discord requests | Files distributed across wt5-8, none in main |
| A5 | Discord request when all wt5-8 busy | 429 returned, no fallback to main |

#### Category B: Linear Execution (Functional Validation)

| Test ID | Description | Pass Criterion |
|---------|-------------|----------------|
| B1 | Linear issue picked up and executed | Issue state → Done, commit in git log |
| B2 | Source routing — Discord issues skipped | Runner logs show skip |
| B3 | Validation gates run | Typecheck/lint results in commit message |
| B4 | Push with retry | Commit appears on origin/main |

#### Category C: Concurrent Operations (Stress Validation)

| Test ID | Description | Pass Criterion |
|---------|-------------|----------------|
| C1 | 4 Linear + 4 Discord simultaneous | All complete, no cross-contamination |
| C2 | Worktree sync after push | Other worktrees see pushed changes |
| C3 | Lease conflict prevention | Same issue not picked by 2 runners |
| C4 | Max concurrency enforcement | 9th request queued or rejected |

### Emulated Testing (If Live Discord/Linear Unavailable)

If live Discord or Linear is not available for testing, use these emulation approaches:

**Emulated Discord requests:**

```bash
# Bypass OpenClaw and send directly to the Discord Router
# This emulates what OpenClaw sends after receiving a Discord message
# Non-streaming variant (easier to verify — waits for full response):
curl -X POST http://127.0.0.1:18790/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "symphony/main",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant. Use tools to complete requests."},
      {"role": "user", "content": "Create a file called EMULATED-DISCORD-TEST.txt with the content: emulated test"}
    ],
    "stream": false
  }'

# Streaming variant (closer to real Discord flow — use --no-buffer to see chunks):
# curl --no-buffer -X POST http://127.0.0.1:18790/v1/chat/completions \
#   -H "Content-Type: application/json" \
#   -d '{"model": "symphony/main", "messages": [...], "stream": true}'
# Wait for the [DONE] marker in the SSE stream to confirm completion.
```

**Emulated Linear issue execution:**

```bash
# Manually trigger a runner in a specific worktree
cd /home/user/src/anqr-wt1
ANQR_WORKTREE_ID=wt1 ANQR_WORKTREE_PATH=/home/user/src/anqr-wt1 \
  node scripts/ops/orchestration/symphony-runner.mjs --once --dry-run
```

### Evidence Collection

For each test, collect and save:

```bash
# Create evidence directory
mkdir -p reports/worktree-e2e-evidence/$(date +%Y%m%d)

# After each test, capture:
journalctl --user -u anqr-discord-router.service --since "10 min ago" \
  > reports/worktree-e2e-evidence/$(date +%Y%m%d)/router-logs.txt

journalctl --user -u 'anqr-symphony-bridge@*.service' --since "10 min ago" \
  > reports/worktree-e2e-evidence/$(date +%Y%m%d)/bridge-logs.txt

journalctl --user -u 'anqr-symphony-runner@*.service' --since "10 min ago" \
  > reports/worktree-e2e-evidence/$(date +%Y%m%d)/runner-logs.txt

# File system state
for wt in 1 2 3 4 5 6 7 8; do
  git -C /home/user/src/anqr-wt$wt status --short \
    > reports/worktree-e2e-evidence/$(date +%Y%m%d)/wt$wt-status.txt
done

git status --short > reports/worktree-e2e-evidence/$(date +%Y%m%d)/main-status.txt

# State file
cp $XDG_RUNTIME_DIR/anqr-symphony-state/state.json \
  reports/worktree-e2e-evidence/$(date +%Y%m%d)/state.json
```

### Test Execution Order

```
1. A1 (Discord isolation — single request)     ← MUST PASS FIRST
2. A3 (Discord exec isolation)
3. B1 (Linear execution — single issue)
4. B2 (Source routing)
5. A4 (Discord concurrent)
6. A5 (Discord overflow → 429)
7. C1 (Simultaneous Discord + Linear)
8. C2 (Worktree sync)
9. C3 (Lease conflict)
10. C4 (Max concurrency)
```

Test A1 is the **gatekeeper**. If Discord isolation fails, stop and investigate before running further tests.

---

## 19. External Review Disposition

### Purpose of This Section

This section records the conclusions from the third-party code review (completed 2026-03-31) and the changes those conclusions required in this document. It replaces the earlier "Notes for Third-Party Reviewer" section.

### 19.1 Core Reviewer Conclusions

The external review established the following:

1. **The strongest proven isolation bug is the Codebuff cwd cache bug (F1)**
   - This is more important than the OpenClaw config conflict because it is directly proven in code
   - Even with correct routing, a reused Codebuff client can still execute in the wrong cwd
   - See Section 4A for full evidence

2. **The "one bridge per worktree" claim was too strong**
   - The Symphony bridge already implements request-scoped cwd handling via `AsyncLocalStorage`
   - Isolation is not failing because Node.js is single-threaded
   - Isolation is failing where downstream integrations do not preserve request-local cwd

3. **The OpenClaw config conflict remains real, but unproven as the primary cause**
   - The archive does not prove merge precedence at runtime
   - This must be verified empirically (Phase 3)

4. **Two additional orchestration bugs were found (F2, F3)**
   - The control script enables runner timers for wt5-wt8 (wrong)
   - Bridge startup auto-starts all runner timers (wrong)
   - These compound the isolation problem by creating execution paths that shouldn't exist

5. **The architecture documentation contradicted the code (F5)**
   - Section 1 has been rewritten to match current `symphony-runner.mjs` source-routing behavior

### 19.2 Answers to Prior Review Questions

**Q1 — OpenClaw config merge order**
- Not proven by the archive
- The conflict is real, but runtime verification is still required before treating it as causal
- Moved to Phase 3 (runtime verification)

**Q2 — OpenClaw workspace vs bridge cwd**
- For the Symphony bridge, request-local cwd handling is clearly implemented via `AsyncLocalStorage`
- For OpenClaw native workspace behavior, the archive is insufficient to prove override semantics
- Moved to Phase 3 (runtime verification)

**Q3 — Tool execution in runner vs bridge**
- The intended model appears correct: runners use their own worktree/root context
- Full proof was not possible because `symphony-agent.mjs` was not included in the review archive
- Runner passes `ROOT`/`worktreeRoot`/`projectRoot` into agent execution (`symphony-runner.mjs:983-993`)

**Q4 — Gateway singleton pattern**
- The 4-timer lock pattern is not justified by the reviewed evidence
- A single systemd service with `Restart=on-failure` is the simpler, preferred default
- Moved to Phase 5 (hardening)

**Q5 — Git push contention**
- Three retries are acceptable under light contention
- Weak under bursty contention; add jittered exponential backoff
- Keep the issue in a resumable state instead of hard-failing
- Moved to Phase 5 (hardening)

**Q6 — Discord worktree accumulation**
- Long-lived dirty Discord worktrees are the wrong model
- Prefer clean scratch worktrees or ephemeral session branches per request/session
- Do not let multiple interactive sessions pile uncommitted state forever
- Moved to Phase 5 (hardening)

**Q7 — Security**
- Discord-facing execution should be more restricted than internal queue execution
- `exec` should be restricted or explicitly gated for Discord requests
- Discord-facing bridges should run under a more constrained user/capability model where possible
- Moved to Phase 5 (hardening)

### 19.3 Documentation Changes Made Based on Review

| Change | Section | What Changed |
|--------|---------|--------------|
| Fixed Discord routing contradiction | Section 1 | Rewritten to match `state.source` behavior in code |
| Downgraded config conflict severity | Section 2 | No longer described as strongest root cause |
| Downgraded workspace concern severity | Section 2 | Noted that bridge already has request-scoped cwd |
| Added 5 proven defects | Section 4A | New subsection with code-referenced evidence |
| Corrected bridge isolation claim | Section 4B | "One bridge per worktree" is a deployment choice, not requirement |
| Restructured gap prioritization | Section 4C | Proven code defects first, unverified config second |
| Revised root cause analysis | Section 4D | Layer 0 (Codebuff cache) is strongest proven cause |
| Corrected bridge explanation | Section 5 | Request-scoped cwd via AsyncLocalStorage documented |
| Reordered recommendations | Section 13 | Code fixes (R1-R3) before config/operational items |
| Reordered action items | Section 14 | Matches revised delivery phases |
| Restructured delivery plan | Section 17 | Phase 1 is now code fixes, not discovery |
| Replaced reviewer questions with answers | Section 19 | This section |

### 19.4 Additional Reviewer Recommendations (for Phase 5 Hardening)

After the proven defects are fixed and validated, the following improvements should be tracked:

1. **Jittered exponential backoff for concurrent pushes** — Current 3-retry is weak under bursts
2. **Ephemeral or scratch Discord execution model** — Replace long-lived dirty worktrees
3. **Stricter security boundaries for Discord-facing execution** — Gate `exec`, restrict user capabilities
4. **Possible simplification of the gateway singleton pattern** — Single systemd service vs 4 competing timers

### 19.5 Test Coverage Gaps Identified by Review

Current tests cover:
- Git worktree mechanics and isolation basics (`tests/integration/worktree-concurrency.spec.ts`)
- Worktree pool disk-space logic (`scripts/ops/orchestration/symphony-worktree-pool.spec.ts`)

Current tests do NOT cover:
- OpenClaw config precedence
- OpenClaw workspace behavior
- Router cwd rewriting end-to-end
- Main repo leakage checks
- **Codebuff bridge cwd isolation (F1)** ← HIGHEST PRIORITY NEW TEST
- Wrong systemd unit ranges (F2)
- Bridge startup re-enabling bad runners (F3)

### Archive Structure

The zip file (`anqr-worktree-review.zip`) is organized as follows:

```
anqr-worktree-review/
├── 12-concurrent-execution-with-worktrees.md   ← PRIMARY DOCUMENT (start here)
├── discord-worktree-routing.md                 ← Discord routing detail
├── WORKTREE-QUICKSTART.md                      ← Quick setup guide
├── WORKTREE-DEPLOYMENT.md                      ← Deployment procedures
├── AGENTS.md                                   ← Agent execution contract
├── MEMORY.md                                   ← Operational memory/context
├── implementation/                             ← Source code (12 files)
│   ├── worktree-config.mjs                     ← Worktree path/branch config
│   ├── symphony-config.mjs                     ← Concurrency config
│   ├── symphony-state.mjs                      ← Shared state/leases
│   ├── symphony-runner.mjs                     ← Runner execution (77KB)
│   ├── symphony-worktree-pool.mjs              ← Worktree lifecycle
│   ├── symphony-worktree-pool.mjs.d.ts         ← Type declarations for worktree pool
│   ├── symphony-control.mjs                    ← Start/stop control
│   ├── symphony-openai-bridge.mjs              ← Bridge (230KB, 6000+ lines)
│   ├── discord-request-router.mjs              ← Discord load balancer
│   ├── codebuff-openai-bridge.mjs              ← Codebuff SDK bridge
│   ├── openclaw-gateway-singleton.mjs          ← Gateway singleton wrapper
│   └── analyze-worktree-benchmark.mjs          ← Benchmark analysis tool
├── tests/                                      ← Worktree-related test files
│   ├── worktree-concurrency.spec.ts            ← Integration: concurrent execution tests
│   └── symphony-worktree-pool.spec.ts          ← Unit: worktree pool management tests
├── context/                                    ← Broader harness context documents
│   ├── 00-index.md                             ← Harness doctrine index
│   ├── harness-architecture.md                 ← Architecture standard
│   ├── 02-runtime-and-services.md              ← Runtime and services reference
│   ├── 04-provider-routing.md                  ← Provider routing reference
│   └── discord-duplicate-requests-fix.md       ← Prior fix for duplicate Discord requests
├── services-repo/                              ← Systemd files FROM GIT REPO
│   └── (10 .service/.timer files)
├── services-deployed/                          ← Systemd files ACTUALLY INSTALLED
│   └── (26 .service/.timer files — includes stale/legacy)
├── config/                                     ← OpenClaw configs (API KEYS REDACTED)
│   ├── openclaw-inrepo.json                    ← In-repo config (⚠️ check symphony-bridge URL)
│   ├── models-inrepo.json                      ← In-repo models (⚠️ CONFLICTING URL)
│   ├── openclaw-home.json                      ← HOME dir config
│   └── config-home.json                        ← HOME dir basic settings
└── state/                                      ← System state snapshots
    ├── worktree-list.txt                        ← git worktree list output
    ├── systemd-units.txt                        ← Running services
    ├── systemd-timers.txt                       ← Active timers
    └── listening-ports.txt                      ← Listening ports (empty — all down)
```

**Start with:** `12-concurrent-execution-with-worktrees.md` — read Sections 1-5 for architecture, Section 4 for gaps, Section 17 for delivery plan (including requirements traceability matrix), and Section 19 for reviewer questions.

**Key files to compare:** `config/openclaw-inrepo.json` vs `config/models-inrepo.json` — look for the `symphony-bridge.baseUrl` conflict.

**Key diff to check:** `services-repo/` vs `services-deployed/` — several files differ.

**Test files:** The `tests/` directory contains existing test code for worktree concurrency and pool management. These should be reviewed to understand current test coverage and inform whether additional tests are needed.

---

## References

### Implementation Files

| File | Purpose |
|------|---------|
| `scripts/ops/core/worktree-config.mjs` | Worktree path/branch calculation |
| `scripts/ops/core/symphony-config.mjs` | Concurrency and timing configuration |
| `scripts/ops/core/symphony-state.mjs` | Shared state management with leases |
| `scripts/ops/orchestration/symphony-runner.mjs` | Runner execution with issue routing |
| `scripts/ops/orchestration/symphony-worktree-pool.mjs` | Worktree lifecycle management |
| `scripts/ops/orchestration/symphony-control.mjs` | Start/stop task execution |
| `scripts/ops/integrations/model/symphony-openai-bridge.mjs` | Symphony bridge (provider cascade) |
| `scripts/ops/integrations/model/discord-request-router.mjs` | Discord load balancer |
| `scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs` | Gateway singleton wrapper |

### Systemd Service Files

| File | Purpose |
|------|---------|
| `services/systemd/anqr-symphony-bridge.service` | Main bridge (port 4319) |
| `services/systemd/anqr-symphony-bridge@.service` | Worktree bridge template (ports 4325-4328) |
| `services/systemd/anqr-symphony-runner@.service` | Runner template (wt1-wt4) |
| `services/systemd/anqr-symphony-runner@.timer` | Runner timer (2 min interval) |
| `services/systemd/anqr-discord-router.service` | Discord load balancer |
| `services/systemd/anqr-discord-bridge@.service` | Gateway singleton template |
| `services/systemd/anqr-discord-bridge@.timer` | Gateway timer (1 min interval) |

### Configuration Files

| File | Purpose |
|------|---------|
| `.openclaw/openclaw.json` | In-repo OpenClaw config (git-tracked) |
| `.openclaw/models.json` | In-repo model provider overrides (git-tracked) |
| `~/.openclaw/openclaw.json` | HOME OpenClaw config (not git-tracked) |
| `~/.openclaw/config.json` | HOME OpenClaw basic settings |
| `~/.config/systemd/user/anqr-ops.env` | API keys and secrets |
| `~/.config/symphony/anqr.env` | Provider API tokens |

### Documentation

| File | Purpose |
|------|---------|
| `docs/harness/discord-worktree-routing.md` | Discord routing architecture detail |
| `docs/harness/WORKTREE-QUICKSTART.md` | Quick setup guide |
| `services/systemd/WORKTREE-DEPLOYMENT.md` | Deployment procedures |
| `AGENTS.md` | Agent execution contract (bridge restart procedure) |

---

**Last updated:** 2026-03-31
**Verified by:** System investigation (git worktree list, systemctl, ss, config file inspection, diff)
