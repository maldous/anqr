# ANQR Execution Model

## Architecture (verified from code and service files)

### Dispatch Layer

One request enters the system through exactly one ingress point:

| Ingress          | Service                       | Port  | Dispatches To   |
| ---------------- | ----------------------------- | ----- | --------------- |
| Linear webhook   | `anqr-linear-webhook.service` | 18791 | Symphony Router |
| Discord/OpenClaw | `anqr-discord-router.service` | 18790 | Symphony Router |

The **Symphony Router** (`anqr-symphony-router.service`, port 4319) is the
single dispatch authority. It receives work from both ingress points and
routes to an available worktree executor.

#### Worktree Selection

Linear worktree selection (`select-linear-worktree.mjs`) is a shared function
used by both `handle-linear-trigger.mjs` and `dispatch-linear-execution.mjs`.
It selects the least-loaded worktree from wt1-wt4:

```
WORKTREES.filter(wt1-4) → sort by activeRequests → first
```

Discord worktree selection (`select-worktree.mjs`) uses round-robin among
equally-loaded worktrees from wt5-wt8.

### Execution Layer

Each **worktree executor** (`anqr-symphony-executor@N.service`, ports 4321-4328)
is the execution authority for its worktree.

The executor runs `symphony-openai-bridge.mjs` which:

1. Receives task dispatch from the Symphony Router
2. For Linear work: spawns `symphony-runner` as a child process (`--issue IDENTIFIER`)
3. For Discord work: handles chat completions directly via the bridge

The **Symphony Runner** (`symphony-runner/`) handles the full Linear issue lifecycle:

1. Syncs worktree with main (ff-only merge)
2. Acquires a lease for the issue
3. Calls `runAgent()` which runs the AI tool loop
4. Runs validation (typecheck, lint, tests, cspell, ast-density)
5. Commits changes and pushes to `symphony/wtN` branch
6. Enqueues the result for integration

Worktree mapping:

- `wt1-wt4` (ports 4321-4324): Linear work (via runner subprocess)
- `wt5-wt8` (ports 4325-4328): Discord work (direct bridge handling)

### Integration Layer

The **Symphony Integrator** (`anqr-symphony-integrator.service`) is the
single integration authority. It:

1. Reads the integration queue from shared state
2. Serially promotes queued branches to `origin/main` via cherry-pick
3. Records evidence of each integration attempt

**Only the integrator may push to `origin/main`.**

### Support Services

| Service                                   | Role                                            |
| ----------------------------------------- | ----------------------------------------------- |
| `anqr-watchdog.service`                   | Monitors service health, restarts (no rollback) |
| `anqr-symphony-worktree-recovery.service` | Repairs quarantined/broken worktree state       |
| `anqr-worktree-health.service/.timer`     | Periodic health snapshots                       |
| `anqr-context7-mcp.service`               | Documentation resolution                        |

### Control Flow Diagram

```
Linear Webhook ─────┐
                    v
Discord Router ──> Symphony Router ──> Executor (wt1-8)
                                           │
                              ┌─────────────┴─────────────┐
                              v                           v
                      Linear (wt1-4)             Discord (wt5-8)
                      spawn Runner               direct bridge
                              │                           │
                              v                           v
                      runAgent() tool loop        chat/completions
                              │
                              v
                      validate → commit → push
                              │
                              v
                      Integration Queue
                              │
                              v
                      Symphony Integrator
                              │
                              v
                      origin/main
```

### State

All control-plane state lives in a shared directory
(`$XDG_RUNTIME_DIR/anqr-symphony-state/state.json`), accessed via
file-level locking with exponential backoff.

Task evidence records live in `$XDG_RUNTIME_DIR/anqr-task-evidence/`
with one JSON file per correlation ID.

Durable queue/set state lives in `$XDG_RUNTIME_DIR/anqr-durable-state/`
for crash-safe dedupe (recent-deliveries), active-issue tracking, and
Linear trigger queue.

### Simplifications Applied (P3-1)

| Before                                                                                   | After                                              | Rationale                                            |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| Worktree selection duplicated in `handle-linear-trigger` and `dispatch-linear-execution` | Shared `select-linear-worktree.mjs`                | Single source of truth for Linear worktree selection |
| In-memory `Set`/`Array` for dedupe, active issues, queue                                 | File-backed `DurableSet`/`DurableQueue`            | Crash-safe, survives service restarts                |
| Destructive `git reset --hard origin/main` on sync failure threshold                     | Quarantine worktree + delegate to recovery service | Non-destructive; recovery service handles repair     |
| Destructive `git reset --hard` in watchdog rollback                                      | Quarantine + safe restart                          | No data loss; evidence preserved                     |

### Why the Bridge→Runner Layer Exists

The `symphony-openai-bridge` (executor) spawns the `symphony-runner` as a
child process for Linear work. This is not redundant — the bridge serves
two distinct roles:

1. **For Discord (wt5-8):** Direct request/response HTTP proxy to the AI
   provider. No runner needed — each Discord request is stateless.
2. **For Linear (wt1-4):** Process launcher. The runner manages the full
   issue lifecycle (lease, sync, execute, validate, commit, push, integrate)
   which can take 30+ minutes and must survive HTTP connection drops.

The bridge acts as an HTTP-to-process boundary. Eliminating it would require
moving HTTP server logic into the runner, which gains nothing and loses the
clean separation between "accept work" and "do work".
