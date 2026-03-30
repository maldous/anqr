# Symphony Execution Workflow

## Overview

Symphony is the autonomous engineering harness for ANQR. It operates as a governed loop of deterministic checks, rule-based issue management, and bounded AI execution.

## Control Flow

```
┌─────────────────┐
│  harness-report  │  deterministic local checks
│  (quick/full)    │  repo, typecheck, lint, tests, depcruise, Ollama health
└────────┬────────┘
         │ reports/latest.json
         ▼
┌─────────────────┐
│  linear-guardian │  rule-based issue management
│                  │  create/update issues, duplicate suppression,
│                  │  queue control, hygiene enforcement
└────────┬────────┘
         │ Linear issues created/updated
         ▼
┌─────────────────┐
│  Symphony runner │  bounded AI execution (Ollama)
│                  │  single agent, single thread, up to 120 min per task
└────────┬────────┘
         │ execution artifacts
         ▼
┌─────────────────┐
│  notify          │  summary dispatch (email + stdout)
└─────────────────┘
```

## Execution Profiles

### Manual

```bash
node scripts/ops/harness-report.mjs quick
node scripts/ops/harness-report.mjs full
```

### Nightly (systemd)

```bash
npm run nightly          # full pipeline
npm run nightly:dry-run  # preview without Linear mutations
```

Orchestrates: harness-report (full) → queue-control (all) → guardian → notify → archive.

## Provider Routing

```
Symphony Bridge (port 4319) ← credit-gate.mjs (tier-based provider selection)
  ↑
symphony-agent.mjs (tool-calling loop, AI SDK)
  ↑
symphony-runner.mjs (orchestrator)
  ↑
Linear (Todo issues)
```

**Primary route:** Symphony Bridge with dynamic scoring across 40+ providers
**Credit gate:** `scripts/ops/integrations/model/symphony-credit-gate.mjs` (tier-based, dynamic scoring)
**Local safety net:** `qwen3-coder-next:latest` via Ollama (score-capped, always ranks last)

- LiteLLM config: `scripts/ops/integrations/model/litellm-config.yaml` (legacy aliases)
- Health audit: `scripts/ops/ollama-local-audit.mjs`

### Provider Tier System

The credit-gate classifies every provider into one of four tiers:

| Tier               | Providers                                                             | Behavior                               |
| ------------------ | --------------------------------------------------------------------- | -------------------------------------- |
| `paid`             | codex, codebuff                                                       | Probed first; uses paid API credits    |
| `free-cloud`       | groq, mistral, gemini, openrouter, sambanova, cerebras, github-models | Dynamic scoring; default tier          |
| `local-proxy`      | openclaw, codebuff-bridge                                             | Local HTTP gateways to other services  |
| `local-safety-net` | ollama-local, ollama-qwen2.5-coder-3b, ollama-qwen2.5-coder-0.5b      | Score-capped at 0.25; always rank last |

**Key constraint:** `SAFETY_NET_SCORE_CEILING = 0.25` — safety-net providers are capped at this score in dynamic ranking so they never outrank even a mediocre cloud provider. `getRankedProviders()` partitions providers into two groups (normal + safety-net) and always appends safety nets after all other providers regardless of their raw score.

## Execution Constraints

| Parameter                 | Value               | Reason                              |
| ------------------------- | ------------------- | ----------------------------------- |
| `max_concurrent_agents`   | 1                   | Single-slot execution               |
| `target_min`              | 1                   | Minimum queue depth                 |
| `target_max`              | 2                   | Maximum queue depth                 |
| `RUNNER_MAX_TURNS`        | 600                 | Max tool-calling rounds per issue   |
| `RUNNER_MAX_EXECUTION_MS` | 7,200,000 (120 min) | Hard wall-time timeout              |
| `RUNNER_MAX_RETRIES`      | 2                   | Attempts before demotion to Backlog |
| `RUNNER_AUTO_PUSH`        | false               | Git push disabled by default        |

## Issue Sizing Rules

All Symphony-automatable issues must be runner-sized:

- 1–2 files changed
- 1–3 acceptance criteria
- Single run, bounded by runner timeout
- Split failing work into subtasks
- Mark non-automatable work `[HUMAN]`

## Issue Decomposition Rules

When breaking down work for Symphony execution:

### Decompose when

- Issue touches >2 files
- Issue has >3 acceptance criteria
- Estimated execution time exceeds runner limits
- Issue requires multi-step reasoning across unrelated modules
- Previous attempt failed or timed out

### Decomposition output

- Each child issue gets `[LOCAL-SLICE]` or `[CHILD]` prefix
- Each child must independently pass: lint, typecheck, tests
- Each child targets exactly one bounded change
- Parent issue tracks overall completion

### Do not automate

- Broad release orchestration
- Large multi-file migrations (>5 files)
- Human/external-service tasks (App Store, ad console)
- Mobile store / platform manual work
- Design decisions requiring judgment

These must be marked `[HUMAN]` and excluded from the automation queue.

### Failure handling

- If a task fails on first attempt, split into smaller subtasks
- If a task times out, mark as needs-decomposition
- If a task produces lint/typecheck/test failures, revert and re-slice
- Never retry the same failing task more than twice

## Descriptor Taxonomy

| Prefix          | Meaning                                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| `[CHILD]`       | Auto-created child of a parent issue                                         |
| `[HUMAN]`       | Requires human/manual action, excluded from automation                       |
| `[LOCAL-SLICE]` | Ollama-sized slice of larger work                                            |
| `[Sonar]`       | SonarQube finding — one issue per finding, auto-created by sonar-linear-sync |

## Queue Control

The queue controller (`scripts/ops/symphony-queue-control.mjs`) enforces execution constraints:

### Operations

| Operation      | Trigger                              | Action                                             |
| -------------- | ------------------------------------ | -------------------------------------------------- |
| **Feed**       | `queueDepth < target_min`            | Promote highest-priority Backlog → Todo            |
| **Drain**      | `queueDepth > target_max`            | Demote lowest-priority Todo → Backlog with comment |
| **Concurrent** | `inProgress > max_concurrent_agents` | Keep highest-priority, demote rest to Todo         |
| **Stale**      | In Progress > 30min without update   | Move to Todo with escalation comment               |

### Configuration

All parameters are centralized in `scripts/ops/symphony-config.mjs`:

```javascript
TARGET_MIN = 1;
TARGET_MAX = 2;
MAX_CONCURRENT_AGENTS = 1;
STALE_THRESHOLD_MS = 180 * 60 * 1000; // 180 min
TASK_TIMEOUT_MS = 125 * 60 * 1000; // 125 min
```

### Usage

```bash
npm run queue:check       # report queue health
npm run queue:feed        # promote from backlog
npm run queue:enforce     # enforce concurrent + stuck + stale
npm run queue:all         # full pass (check + feed + drain + enforce)
npm run queue:all:dry-run # preview without changes
```

## SonarQube Integration

SonarQube static analysis is integrated into both the nightly pipeline and the Symphony runner, with findings tracked as individual Linear issues.

### Architecture

```
┌─────────────────┐
│  sonar-scanner   │  runs against local SonarQube instance
│                  │  JVM: -Xms128m -Xmx256m
└────────┬────────┘
         │ findings uploaded to SonarQube server
         ▼
┌─────────────────┐
│  sonar-linear-   │  shared sync module
│  sync.mjs        │  one Linear issue per SonarQube finding
└────────┬────────┘
         │ create / dedup / promote / requeue / resolve
         ▼
┌─────────────────┐
│  Linear issues   │  [Sonar] prefixed, priority-gated
│                  │  must be resolved before other work
└─────────────────┘
```

### Per-Finding Issue Sync

The canonical module `scripts/ops/integrations/sonar/sonar-linear-sync.mjs` provides `syncSonarToLinear()` which:

1. **Fetches** all open SonarQube issues (paginated, via `/api/issues/search`)
2. **Fetches** all open `[Sonar]` Linear issues (via GraphQL)
3. **Deduplicates** using `<!-- sonar-key:UUID -->` markers embedded in each Linear issue description — matches SonarQube issue keys to existing Linear issues
4. **Creates** new Linear issues for unmatched findings (one issue per finding)
5. **Promotes** existing issues to higher priority if requested (e.g. P2→P1)
6. **Requeues** non-Todo issues back to Todo (nightly only)
7. **Resolves** stale Linear issues whose SonarQube findings have disappeared
8. **Resolves** legacy aggregate `[Sonar]` issues (migration from old single-issue pattern)

Each Linear issue title follows the format: `[Sonar] <message> (<file>:<line>)`

Each Linear issue description contains:

- `<!-- sonar-key:UUID -->` marker (for dedup)
- Rule, severity, type, file, line, effort
- Link to SonarQube issue detail

### Nightly Audit (blocking)

The nightly sonar audit (`scripts/ops/sonar-linear-audit.mjs`) runs after sonar-scanner in the nightly pipeline:

| Parameter       | Value                                     | Reason                                                      |
| --------------- | ----------------------------------------- | ----------------------------------------------------------- |
| `priority`      | 1 (Urgent)                                | Sonar findings must be resolved before other work           |
| `resolveStale`  | true                                      | Close Linear issues whose findings disappeared              |
| `requeueToTodo` | true                                      | Move stale issues (Backlog, In Progress, etc.) back to Todo |
| Exit code       | 0 = clean, 1 = findings, 2 = config error | Blocking gate in nightly pipeline                           |

The nightly audit also **promotes** existing issues: if the runner created an issue at P2 (High) during the day, the nightly promotes it to P1 (Urgent) with an explanatory comment.

Notifications include counts for: created, promoted, requeued, resolved.

### Runner Post-Commit Scan (non-blocking)

After each successful commit, the Symphony runner runs sonar-scanner and syncs findings:

| Parameter       | Value    | Reason                                                           |
| --------------- | -------- | ---------------------------------------------------------------- |
| `priority`      | 2 (High) | New findings discovered during the day                           |
| `resolveStale`  | true     | Close collateral issues (fixing one finding may resolve another) |
| `requeueToTodo` | false    | Requeue is nightly-only behavior                                 |

The post-commit scan is non-blocking — failures are logged but don't affect the current issue's completion. Notifications are sent when collateral issues are resolved.

### Runner Hard Gate

The runner's `pickIssue()` function enforces a hard gate: **open `[Sonar]` issues must be resolved before any other work**.

1. Query Linear for all open `[Sonar]` issues
2. Filter out Backlog state (prevents deadlock when max-retry demotion sends issues there)
3. If actionable sonar issues exist (Todo, In Progress, In Review, etc.):
   - Only pick `[Sonar]` issues from the Todo queue
   - If no `[Sonar]` issues are in Todo, skip the cycle entirely (blocks all work)
4. If no actionable sonar issues exist, proceed with normal issue selection

This ensures the runner prioritizes code quality fixes before feature work.

### Memory Configuration

Sonar-scanner spawns both a JVM process and an internal Node.js process for JS/TS analysis. Memory must be carefully managed within the systemd cgroup:

| Component                | Cap       | Set by                                                   |
| ------------------------ | --------- | -------------------------------------------------------- |
| systemd cgroup           | 4 GB      | `MemoryMax=4G` in service unit                           |
| Node.js (runner)         | 512 MB    | `NODE_OPTIONS=--max-old-space-size=512` in service env   |
| Java (sonar-scanner)     | 256 MB    | `SONAR_SCANNER_OPTS="-Xms128m -Xmx256m"` in execSync env |
| Node.js (sonar internal) | unlimited | `NODE_OPTIONS=""` in execSync env (clears inherited cap) |

The `NODE_OPTIONS=""` override is critical: without it, sonar-scanner's internal Node.js inherits the 512MB cap from the service environment and OOM-kills during JS/TS analysis.

## Scheduled Operations

### Symphony Runner (continuous, every 2 min)

The Symphony runner is delivered exclusively via the worktree template units (`anqr-symphony-runner@.service` / `.timer`). Instantiate one timer per worktree (`anqr-symphony-runner@1.timer`, `@2`, etc.).

Legacy single-runner units (`anqr-symphony-runner.service`/`.timer`) are retired and now act as no-op reminders; disable/remove them after migrating.

Each active timer kicks off the execution agent loop:

1. Acquires PID lock (prevents overlapping runs)
2. **Sonar gate**: checks for open `[Sonar]` issues — if any exist, only picks sonar work
3. Polls Linear for highest-priority automatable Todo issue
4. Moves issue to In Progress + comments start marker
5. Credit gate selects best available provider (tier-based dynamic scoring)
6. Runs tool-calling agent loop against the provider
7. Agent reads files, makes changes, calls task_complete
8. Validates: typecheck (`tsc --noEmit`) + unit tests (`vitest run`)
9. **Pass**: git commit + mark Done + post evidence to Linear + post-commit sonar scan (non-blocking)
10. **Fail**: git revert + comment failure detail + leave in Todo (or Backlog after max retries)
11. **Self-feed**: calls `feedQueue()` to immediately replenish the queue (zero idle gap)

Agent tools: `read_file`, `write_file`, `patch_file`, `run_command` (allowlisted), `list_directory`, `task_complete`.

System prompt loaded from `scripts/ops/symphony/WORKFLOW.md` (versioned in-repo, per OpenAI Symphony spec).

```bash
npm run symphony:run          # execute one issue
npm run symphony:run:dry-run   # preview without changes
npm run symphony:status        # show runner state
```

### Continuous Queue Feeder (every 15 min — safety net)

The queue feeder (`anqr-queue-feeder.timer`) runs `queue:all` every 15 minutes as a **safety net** for queue maintenance:

- **Primary feeding** is handled by the Symphony runner itself — it calls `feedQueue()` after each issue completion, ensuring zero idle time between issues
- **This timer** handles maintenance duties and backup feeding:
  - Backup feed if runner self-feed missed (crash, timeout, etc.)
  - Drains overflow when `queueDepth > target_max`
  - Enforces max concurrent agents
  - Detects stuck (>125min) and stale (>180min) work
  - Skips `[HUMAN]`-prefixed issues

Both feeds are idempotent — `feedQueue` checks depth before acting, so overlapping runs are safe.

```bash
npm run queue:continuous   # same as queue:all, for systemd
```

### Email Ingest (every 5 min)

The email ingest (`anqr-email-ingest.timer`) syncs mail via mbsync, searches for unprocessed emails, and creates Linear issues:

- Syncs Gmail via mbsync → indexes with notmuch
- Searches for unprocessed emails from/to email@anqr.link
- Allowed senders: `matthew.aldous@gmail.com`, `alexander.emmalyn.thomas@gmail.com`
- Creates `[EMAIL]` prefixed issues assigned to matthewaldous
- Tags processed emails to prevent re-ingestion
- Sends confirmation email after creating issues

Requires: mbsync, notmuch, msmtp (all installed via system packages).

```bash
node scripts/ops/email-ingest.mjs           # process emails
node scripts/ops/email-ingest.mjs --dry-run  # preview
```

### Nightly Pipeline (02:00 daily)

The nightly pipeline (`scripts/ops/nightly-ops-pass.mjs`) runs all operations in sequence:

```
1. harness-report (full)     → reports/latest.json
2. symphony-queue-control    → feed, drain, enforce
3. linear-guardian           → create/update issues from failures
4. sonar-scanner             → upload findings to SonarQube server
5. sonar-linear-audit        → sync findings to Linear (create/promote/requeue/resolve)
6. notify                    → stdout summary + email notification
7. archive                   → reports/archive/report-YYYY-MM-DD_HH-MM-SS.json
```

Steps 4–5 are the SonarQube integration gate. If sonar-linear-audit exits with code 1 (findings exist), the nightly is considered failing — all findings must be resolved.

### systemd Setup

```bash
# Copy unit files
cp services/systemd/anqr-nightly.service ~/.config/systemd/user/
cp services/systemd/anqr-nightly.timer ~/.config/systemd/user/
cp services/systemd/anqr-queue-feeder.service ~/.config/systemd/user/
cp services/systemd/anqr-queue-feeder.timer ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.timer ~/.config/systemd/user/
cp services/systemd/anqr-email-ingest.service ~/.config/systemd/user/
cp services/systemd/anqr-email-ingest.timer ~/.config/systemd/user/
cp services/systemd/anqr-ops.env ~/.config/systemd/user/

# Remove/disable retired single-runner units if they were previously installed
systemctl --user disable --now anqr-symphony-runner.timer || true
rm -f ~/.config/systemd/user/anqr-symphony-runner.service ~/.config/systemd/user/anqr-symphony-runner.timer

# Edit env file with real LINEAR_API_KEY
nano ~/.config/systemd/user/anqr-ops.env

# Enable and start
systemctl --user daemon-reload
systemctl --user enable --now anqr-nightly.timer
systemctl --user enable --now anqr-queue-feeder.timer
systemctl --user enable --now anqr-symphony-runner@{1..4}.timer
systemctl --user enable --now anqr-email-ingest.timer

# Verify
systemctl --user list-timers
journalctl --user -u anqr-nightly.service --since today
journalctl --user -u anqr-queue-feeder.service --since today
journalctl --user -u 'anqr-symphony-runner@*.service' --since today
```

### Environment Handling

Legacy lesson: PATH under systemd differs from interactive shells. The service unit sets explicit paths:

| Variable          | Value                      | Reason                                 |
| ----------------- | -------------------------- | -------------------------------------- |
| `PATH`            | includes nvm Node bin      | nvm not on default systemd PATH        |
| `HOME`            | `/home/user`               | required for nvm and npm               |
| `NODE_PATH`       | nvm lib/node_modules       | global module resolution               |
| `OLLAMA_API_BASE` | `http://localhost:11434`   | Ollama default                         |
| `LINEAR_API_KEY`  | from `anqr-ops.env`        | secrets kept outside repo              |
| `NODE_OPTIONS`    | `--max-old-space-size=512` | caps Node.js heap within cgroup budget |
| `SONAR_TOKEN`     | from `anqr-ops.env`        | SonarQube authentication               |
| `SONAR_HOST_URL`  | `http://localhost:9000`    | local SonarQube instance               |

### Notification Channels

| Channel  | Flag               | Behavior                                      |
| -------- | ------------------ | --------------------------------------------- |
| `stdout` | `--channel=stdout` | Always available, captured by systemd journal |
| `email`  | `--channel=email`  | Send via msmtp to matthew.aldous@gmail.com    |
| `all`    | `--channel=all`    | Both stdout and email (default for nightly)   |

Nightly reports are sent via email and archived to `reports/archive/`. They are **not** posted to Linear issues — issue comments grow unboundedly and become unreadable.

The Symphony runner also sends email notifications when:

- An issue moves to In Progress (agent starting)
- Agent execution errors occur
- Validation fails

Email delivery uses msmtp with rate limiting (10/hour, 30/day) and deduplication (1-hour window). See `scripts/ops/lib/notify.mjs`.

## Guardian Rules

The guardian is deterministic, not AI-driven:

1. Read `reports/latest.json`
2. For each failing check, search for existing open issue
3. If no duplicate found, create issue with required labels
4. If duplicate found, add comment with latest evidence
5. If queue exceeds `target_max`, stop creating new issues
6. If execution is stale (>30min), escalate
7. Enforce label baseline on all touched issues

## Files

| File                                                   | Purpose                                                | Implemented in    |
| ------------------------------------------------------ | ------------------------------------------------------ | ----------------- |
| `scripts/ops/harness-report.mjs`                       | Deterministic checks                                   | ANQ-371 (Phase 3) |
| `scripts/ops/linear-guardian.mjs`                      | Rule-based issue management                            | ANQ-366 (Phase 4) |
| `scripts/ops/linear-client.mjs`                        | Linear API helpers                                     | ANQ-366 (Phase 4) |
| `scripts/ops/ollama-local-audit.mjs`                   | Model health verification                              | ANQ-370 (Phase 2) |
| `scripts/ops/litellm-config.yaml`                      | Local model aliases                                    | ANQ-370 (Phase 2) |
| `scripts/ops/model-injector-proxy.py`                  | Request normalization                                  | ANQ-370 (Phase 2) |
| `scripts/ops/symphony-config.mjs`                      | Centralized queue/execution config                     | ANQ-368 (Phase 5) |
| `scripts/ops/symphony-queue-control.mjs`               | Queue feeder, drain, enforcement                       | ANQ-368 (Phase 5) |
| `scripts/ops/nightly-ops-pass.mjs`                     | Nightly orchestration                                  | ANQ-367 (Phase 6) |
| `scripts/ops/notify.mjs`                               | Notification dispatch                                  | ANQ-367 (Phase 6) |
| `services/systemd/anqr-nightly.service`                | systemd user service unit                              | ANQ-367 (Phase 6) |
| `services/systemd/anqr-nightly.timer`                  | systemd nightly timer (02:00)                          | ANQ-367 (Phase 6) |
| `services/systemd/anqr-queue-feeder.service`           | systemd queue maintenance + backup feed                | ANQ-373, ANQ-376  |
| `services/systemd/anqr-queue-feeder.timer`             | systemd queue maintenance timer (15min)                | ANQ-373, ANQ-376  |
| `scripts/ops/symphony-runner.mjs`                      | Execution orchestrator (self-feeding)                  | ANQ-374, ANQ-376  |
| `scripts/ops/symphony-agent.mjs`                       | Tool-calling AI agent                                  | ANQ-374           |
| `scripts/ops/symphony-credit-gate.mjs`                 | Provider cascade (credit gate)                         | ANQ-374           |
| `scripts/ops/symphony/WORKFLOW.md`                     | Agent system prompt (versioned)                        | ANQ-374           |
| `services/systemd/anqr-symphony-runner.service`        | systemd runner service                                 | ANQ-374           |
| `services/systemd/anqr-symphony-runner.timer`          | systemd runner timer (2min)                            | ANQ-374           |
| `scripts/ops/lib/notify.mjs`                           | Email notification helper (msmtp + rate limiting)      | ANQ-377           |
| `scripts/ops/email-ingest.mjs`                         | Email ingest (mbsync + notmuch → Linear issues)        | ANQ-377           |
| `services/systemd/anqr-email-ingest.service`           | systemd email ingest service                           | ANQ-377           |
| `services/systemd/anqr-email-ingest.timer`             | systemd email ingest timer (5min)                      | ANQ-377           |
| `services/systemd/anqr-ops.env`                        | Environment template for secrets                       | ANQ-367 (Phase 6) |
| `scripts/ops/integrations/sonar/sonar-linear-sync.mjs` | SonarQube ↔ Linear per-finding sync (canonical module) | ANQ-378           |
| `scripts/ops/sonar-linear-audit.mjs`                   | Nightly sonar audit root compatibility shim            | ANQ-378           |
