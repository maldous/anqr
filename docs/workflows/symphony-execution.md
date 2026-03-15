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
│                  │  single agent, single thread, <5min per task
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
Ollama ← credit-gate.mjs (provider selection)
  ↑
symphony-agent.mjs (tool-calling loop)
  ↑
symphony-runner.mjs (orchestrator)
  ↑
Linear (Todo issues)
```

**Pinned model:** `qwen3.5:35b-a3b-32t` (Qwen 3.5 MoE, 36B, Q4_K_M)
**Credit gate:** `scripts/ops/symphony-credit-gate.mjs` (Ollama-first, extensible)

- LiteLLM config: `scripts/ops/litellm-config.yaml`
- Health audit: `scripts/ops/ollama-local-audit.mjs`

## Execution Constraints

| Parameter | Value | Reason |
|---|---|---|
| `max_concurrent_agents` | 1 | Ollama is single-slot |
| `target_min` | 1 | Minimum queue depth |
| `target_max` | 2 | Maximum queue depth |
| `RUNNER_MAX_TURNS` | 600 | Max tool-calling rounds per issue |
| `RUNNER_MAX_EXECUTION_MS` | 3,600,000 (60 min) | Hard wall-time timeout |
| `RUNNER_MAX_RETRIES` | 2 | Attempts before demotion to Backlog |
| `RUNNER_AUTO_PUSH` | false | Git push disabled by default |

## Issue Sizing Rules

All Symphony-automatable issues must be Ollama-sized:

- 1–2 files changed
- 1–3 acceptance criteria
- Single run, under ~5 minutes
- Split failing work into subtasks
- Mark non-automatable work `[HUMAN]`

## Issue Decomposition Rules

When breaking down work for Symphony execution:

### Decompose when

- Issue touches >2 files
- Issue has >3 acceptance criteria
- Estimated execution time exceeds 5 minutes
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
- If a task times out (>5min), mark as needs-decomposition
- If a task produces lint/typecheck/test failures, revert and re-slice
- Never retry the same failing task more than twice

## Descriptor Taxonomy

| Prefix | Meaning |
|---|---|
| `[CHILD]` | Auto-created child of a parent issue |
| `[HUMAN]` | Requires human/manual action, excluded from automation |
| `[LOCAL-SLICE]` | Ollama-sized slice of larger work |

## Queue Control

The queue controller (`scripts/ops/symphony-queue-control.mjs`) enforces execution constraints:

### Operations

| Operation | Trigger | Action |
|---|---|---|
| **Feed** | `queueDepth < target_min` | Promote highest-priority Backlog → Todo |
| **Drain** | `queueDepth > target_max` | Demote lowest-priority Todo → Backlog with comment |
| **Concurrent** | `inProgress > max_concurrent_agents` | Keep highest-priority, demote rest to Todo |
| **Stuck** | In Progress > 5min without update | Comment with split recommendation |
| **Stale** | In Progress > 30min without update | Move to Todo with escalation comment |

### Configuration

All parameters are centralized in `scripts/ops/symphony-config.mjs`:

```javascript
TARGET_MIN = 1
TARGET_MAX = 2
MAX_CONCURRENT_AGENTS = 1
STALE_THRESHOLD_MS = 30 * 60 * 1000   // 30 min
TASK_TIMEOUT_MS = 5 * 60 * 1000       // 5 min
```

### Usage

```bash
npm run queue:check       # report queue health
npm run queue:feed        # promote from backlog
npm run queue:enforce     # enforce concurrent + stuck + stale
npm run queue:all         # full pass (check + feed + drain + enforce)
npm run queue:all:dry-run # preview without changes
```

## Scheduled Operations

### Symphony Runner (continuous, every 2 min)

The Symphony runner (`anqr-symphony-runner.timer`) is the execution agent that picks up Todo issues and implements them:

1. Acquires PID lock (prevents overlapping runs)
2. Polls Linear for highest-priority automatable Todo issue
3. Moves issue to In Progress + comments start marker
4. Credit gate selects best available provider (Ollama-first)
5. Runs tool-calling agent loop against the provider
6. Agent reads files, makes changes, calls task_complete
7. Validates: typecheck (`tsc --noEmit`) + unit tests (`vitest run`)
8. **Pass**: git commit + mark Done + post evidence to Linear
9. **Fail**: git revert + comment failure detail + leave in Todo (or Backlog after max retries)
10. **Self-feed**: calls `feedQueue()` to immediately replenish the queue (zero idle gap)

Agent tools: `read_file`, `write_file`, `patch_file`, `run_command` (allowlisted), `list_directory`, `task_complete`.

System prompt loaded from `tools/harness/symphony/WORKFLOW.md` (versioned in-repo, per OpenAI Symphony spec).

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
  - Detects stuck (>5min) and stale (>30min) work
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
4. notify                    → stdout summary + email notification
5. archive                   → reports/archive/report-YYYY-MM-DD_HH-MM-SS.json
```

### systemd Setup

```bash
# Copy unit files
cp services/systemd/anqr-nightly.service ~/.config/systemd/user/
cp services/systemd/anqr-nightly.timer ~/.config/systemd/user/
cp services/systemd/anqr-queue-feeder.service ~/.config/systemd/user/
cp services/systemd/anqr-queue-feeder.timer ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner.timer ~/.config/systemd/user/
cp services/systemd/anqr-email-ingest.service ~/.config/systemd/user/
cp services/systemd/anqr-email-ingest.timer ~/.config/systemd/user/
cp services/systemd/anqr-ops.env ~/.config/systemd/user/

# Edit env file with real LINEAR_API_KEY
nano ~/.config/systemd/user/anqr-ops.env

# Enable and start
systemctl --user daemon-reload
systemctl --user enable --now anqr-nightly.timer
systemctl --user enable --now anqr-queue-feeder.timer
systemctl --user enable --now anqr-symphony-runner.timer
systemctl --user enable --now anqr-email-ingest.timer

# Verify
systemctl --user list-timers
journalctl --user -u anqr-nightly.service --since today
journalctl --user -u anqr-queue-feeder.service --since today
journalctl --user -u anqr-symphony-runner.service --since today
```

### Environment Handling

Legacy lesson: PATH under systemd differs from interactive shells. The service unit sets explicit paths:

| Variable | Value | Reason |
|---|---|---|
| `PATH` | includes nvm Node bin | nvm not on default systemd PATH |
| `HOME` | `/home/user` | required for nvm and npm |
| `NODE_PATH` | nvm lib/node_modules | global module resolution |
| `OLLAMA_API_BASE` | `http://localhost:11434` | Ollama default |
| `LINEAR_API_KEY` | from `anqr-ops.env` | secrets kept outside repo |

### Notification Channels

| Channel | Flag | Behavior |
|---|---|---|
| `stdout` | `--channel=stdout` | Always available, captured by systemd journal |
| `email` | `--channel=email` | Send via msmtp to matthew.aldous@gmail.com |
| `all` | `--channel=all` | Both stdout and email (default for nightly) |

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

| File | Purpose | Implemented in |
|---|---|---|
| `scripts/ops/harness-report.mjs` | Deterministic checks | ANQ-371 (Phase 3) |
| `scripts/ops/linear-guardian.mjs` | Rule-based issue management | ANQ-366 (Phase 4) |
| `scripts/ops/linear-client.mjs` | Linear API helpers | ANQ-366 (Phase 4) |
| `scripts/ops/ollama-local-audit.mjs` | Model health verification | ANQ-370 (Phase 2) |
| `scripts/ops/litellm-config.yaml` | Local model aliases | ANQ-370 (Phase 2) |
| `scripts/ops/model-injector-proxy.py` | Request normalization | ANQ-370 (Phase 2) |
| `scripts/ops/symphony-config.mjs` | Centralized queue/execution config | ANQ-368 (Phase 5) |
| `scripts/ops/symphony-queue-control.mjs` | Queue feeder, drain, enforcement | ANQ-368 (Phase 5) |
| `scripts/ops/nightly-ops-pass.mjs` | Nightly orchestration | ANQ-367 (Phase 6) |
| `scripts/ops/notify.mjs` | Notification dispatch | ANQ-367 (Phase 6) |
| `services/systemd/anqr-nightly.service` | systemd user service unit | ANQ-367 (Phase 6) |
| `services/systemd/anqr-nightly.timer` | systemd nightly timer (02:00) | ANQ-367 (Phase 6) |
| `services/systemd/anqr-queue-feeder.service` | systemd queue maintenance + backup feed | ANQ-373, ANQ-376 |
| `services/systemd/anqr-queue-feeder.timer` | systemd queue maintenance timer (15min) | ANQ-373, ANQ-376 |
| `scripts/ops/symphony-runner.mjs` | Execution orchestrator (self-feeding) | ANQ-374, ANQ-376 |
| `scripts/ops/symphony-agent.mjs` | Tool-calling AI agent | ANQ-374 |
| `scripts/ops/symphony-credit-gate.mjs` | Provider cascade (credit gate) | ANQ-374 |
| `tools/harness/symphony/WORKFLOW.md` | Agent system prompt (versioned) | ANQ-374 |
| `services/systemd/anqr-symphony-runner.service` | systemd runner service | ANQ-374 |
| `services/systemd/anqr-symphony-runner.timer` | systemd runner timer (2min) | ANQ-374 |
| `scripts/ops/lib/notify.mjs` | Email notification helper (msmtp + rate limiting) | ANQ-377 |
| `scripts/ops/email-ingest.mjs` | Email ingest (mbsync + notmuch → Linear issues) | ANQ-377 |
| `services/systemd/anqr-email-ingest.service` | systemd email ingest service | ANQ-377 |
| `services/systemd/anqr-email-ingest.timer` | systemd email ingest timer (5min) | ANQ-377 |
| `services/systemd/anqr-ops.env` | Environment template for secrets | ANQ-367 (Phase 6) |
