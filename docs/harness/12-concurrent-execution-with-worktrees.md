# Concurrent Execution with Git Worktrees

## Overview

Git worktrees enable multiple concurrent Symphony runner instances to operate independently on the same repository without conflicts. This multiplies throughput while maintaining the safety guarantees of the lease-based state management system.

**Status:** Canonical execution model for Symphony runners on `main` (updated 2026-03-30)

## Why Worktrees Are Required

### The Single Working Tree Problem

Without worktrees, only one Symphony runner instance can operate at a time because:

1. **File system conflicts:** Two runners modifying the same working directory would corrupt each other's changes
2. **Git index contention:** Multiple `git add` operations would race on the shared index
3. **Commit atomicity:** Concurrent commits would create unpredictable git state
4. **Validation interference:** One runner's changes would affect another runner's typecheck/lint results

### Why Not Just Clone Multiple Times?

While you could create multiple full repository clones, this approach has significant downsides:

- **Disk waste:** Each clone duplicates the entire `.git/objects` store (~500 MB per clone)
- **Network overhead:** Each clone must fetch updates independently
- **Synchronization complexity:** Keeping clones in sync requires manual coordination
- **Resource bloat:** Multiple copies of `node_modules` and build artifacts

### The Worktree Solution

Git worktrees provide **isolated working directories that share a single git object store**:

```
Main repository:
/home/user/src/anqr/
  .git/               ← Shared object store
  packages/
  src/
  ...

Worktree 1:
/home/user/src/anqr-wt1/
  .git                ← Pointer to main .git
  packages/           ← Independent working files
  src/
  ...

Worktree 2:
/home/user/src/anqr-wt2/
  .git                ← Pointer to main .git
  packages/           ← Independent working files
  src/
  ...
```

**Benefits:**

- ✅ **Disk efficient:** ~200 MB per worktree (working files only), shared object store
- ✅ **Git isolation:** Each worktree has its own `HEAD`, `index`, and working directory
- ✅ **Branch safety:** Git prevents checking out the same branch in multiple worktrees
- ✅ **Shared refs:** All worktrees see the same branches, tags, and commits instantly
- ✅ **Simple cleanup:** Remove worktrees without affecting main repository

The main repository remains the control-plane checkout for services, docs, and shared configuration. Runner execution should happen from worktrees.

## What Worktrees Enable

### Throughput Multiplication

**Current (single runner):**

- Pick issue → execute → validate → commit → push → pick next issue
- **Throughput:** 2-3 issues/hour (with 20-40 min execution time per issue)
- **Idle time:** High (runner waits for AI provider, validation, git operations)

**With concurrent worktrees (2-4 runners):**

- Multiple runners execute different issues simultaneously
- **Expected throughput:** 4-8 issues/hour (75-150% increase)
- **Idle time:** Low (one runner's wait time is another runner's execution time)

### Resource Utilization

Symphony execution is **network-bound** (waiting for LLM API calls), not CPU-bound:

```
Typical issue execution timeline:
  5% — Git sync, file reading
 70% — LLM API calls (network wait)
 10% — Validation (typecheck, lint, tests)
 10% — Git commit and push (network wait)
  5% — State management and logging
```

**With concurrent worktrees, unused CPU/memory during network waits can execute other issues.**

### Safety Guarantees

The existing `symphony-state.mjs` lease system ensures:

- ✅ **No duplicate work:** Only one runner can acquire a lease on an issue
- ✅ **Automatic recovery:** Expired leases are recovered if runner crashes
- ✅ **Heartbeat liveness:** Active runners keep leases alive via background heartbeat
- ✅ **Atomic state updates:** File-based locking prevents concurrent state corruption

**Worktrees add an additional layer:**

- ✅ **Working tree isolation:** Runners cannot interfere with each other's file changes
- ✅ **Lock separation:** Each worktree has its own PID lock file
- ✅ **Branch isolation:** Each worktree operates on a unique branch

## How Git Worktrees Work

### Shared vs Per-Worktree State

**Shared across all worktrees:**

- `.git/objects/` — All commits, trees, and blobs
- `.git/refs/` — Branches, tags, and remotes
- `.git/config` — Repository configuration
- `.git/packed-refs` — Packed reference data

**Per-worktree (isolated):**

- `HEAD` — Current branch or commit
- `index` — Staging area for `git add`
- Working directory files — The actual source code
- `.git/worktrees/<name>/` — Worktree-specific metadata

### Branch Locking Mechanism

Git prevents the same branch from being checked out in multiple worktrees:

```bash
# In main repository
git checkout main  # ✅ OK

# In worktree 1
git checkout main  # ❌ ERROR: 'main' is already checked out at '/home/user/src/anqr'
```

**Solution:** Each worktree uses a unique branch tracking `main`:

```
Main repository → main
Worktree 1 → symphony/wt1 (tracks origin/main)
Worktree 2 → symphony/wt2 (tracks origin/main)
Worktree 3 → symphony/wt3 (tracks origin/main)
```

### Worktree Operations

**Centralized path configuration:**

Worktree paths are calculated via `scripts/ops/core/worktree-config.mjs`:

- `getWorktreePath(id)` — Returns absolute path to worktree directory
- `getWorktreeBranch(id)` — Returns branch name for worktree

This ensures consistency across Symphony runner, worktree pool manager, and systemd services.

**Create worktree:**

```bash
git fetch origin main
git worktree add /home/user/src/anqr-wt1 -b symphony/wt1 origin/main
```

This creates:

- New directory `/home/user/src/anqr-wt1`
- New branch `symphony/wt1` pointing to `main`
- Pointer file `.git` in worktree directory

**List worktrees:**

```bash
git worktree list
# /home/user/src/anqr       abc1234 [main]
# /home/user/src/anqr-wt1   abc1234 [symphony/wt1]
# /home/user/src/anqr-wt2   abc1234 [symphony/wt2]
```

**Remove worktree:**

```bash
git worktree remove /home/user/src/anqr-wt1
git branch -D symphony/wt1  # Clean up branch
```

**Repair corrupted worktree:**

```bash
git worktree repair  # Fix broken worktree links
git worktree prune   # Remove stale worktree metadata
```

## Architecture

### Concurrency Model

```
┌──────────────────────────────────────────────────────┐
│                   Symphony Queue                      │
│              (Linear "Todo" state issues)             │
└────────────┬─────────────┬─────────────┬─────────────┘
             │             │             │
   ┌─────────▼──────┐  ┌──▼──────────┐ ┌▼────────────┐
   │  Symphony      │  │  Discord    │ │ Discord     │
   │  Runners       │  │  Runners    │ │ Router      │
   │  (wt1-wt4)     │  │  (wt5-wt8)  │ │ (port 18790)│
   │                │  │             │ │             │
   │ Non-Discord    │  │ Discord-    │ │ Load        │
   │ issues only    │  │ sourced     │ │ balances    │
   │                │  │ issues only │ │ OpenClaw    │
   └────────┬───────┘  └──────┬──────┘ └─────────────┘
            │                 │
            │    ┌────────────▼─────────┐
            └────►  Lease System        │
                 │  (state.json)        │
                 │  - Routes Discord    │
                 │    issues → wt5-wt8  │
                 │  - Routes others     │
                 │    → wt1-wt4         │
                 └──────────────────────┘
                          │
                 ┌────────▼─────────┐
                 │  Symphony Bridge │
                 │  (port 4319)     │
                 └──────────────────┘
```

**Key components:**

1. **Queue control** — Maintains "Todo" issue queue depth
2. **Lease system** — Prevents duplicate work across runners AND routes issues by source
3. **Worktree runners** — Independent execution environments with source-based routing:
   - **Symphony worktrees (wt1-wt4, main)**: Handle non-Discord issues (general Symphony work)
   - **Discord worktrees (wt5-wt8)**: Handle ONLY Discord-sourced issues to prevent concurrent conflicts
4. **Discord router** — Load balances Discord OpenClaw Gateway requests across wt5-wt8
5. **Symphony bridge** — Shared LLM provider routing service

### Worktree Routing by Issue Source

**Automatic source-based routing prevents concurrent execution conflicts:**

When issues are created from Discord interactions, they must be tagged with `source: "discord"` in the shared state management system. The symphony-runner routes issues based on that state field:

**Discord worktrees (wt5-wt8):**
- Handle ONLY issues with `source` containing "discord"
- Skip all non-Discord issues
- Dedicated to Discord bot interactions to prevent conflicts
- Logs: `🎮 Discord worktree mode: handling ONLY Discord-sourced issues`

**Symphony worktrees (wt1-wt4, main):**
- Handle all issues EXCEPT Discord-sourced ones
- Skip Discord issues entirely
- General Symphony work (Linear issues, email, manual)
- Logs: `🎼 Symphony worktree mode: handling non-Discord issues`

**How it works:**

```javascript
// In symphony-runner.mjs pickIssue() function
function isDiscordIssue(issue) {
  const state = getIssueState(issue.identifier);
  return (state.source || "").toLowerCase().includes("discord");
}

// Filter issues based on worktree type
const candidates = todoIssues
  .filter((issue) => {
    const fromDiscord = isDiscordIssue(issue);
    
    // Discord worktrees only handle Discord issues
    if (isDiscordWorktree() && !fromDiscord) return false;
    
    // Symphony worktrees only handle non-Discord issues
    if (isSymphonyWorktree() && fromDiscord) return false;
    
    return true;
  });
```

**Why this matters:**

Without source-based routing, any worktree could pick up any issue, leading to:
- Discord issues executed in Symphony worktrees (wt1-wt4)
- Symphony issues executed in Discord worktrees (wt5-wt8)
- Potential conflicts when Discord-specific environment differs from Symphony environment
- Confusion in logs and debugging

With routing, each issue goes to the appropriate execution environment based on its origin.

### Execution Flow

**Per-worktree runner cycle:**

```
1. Acquire PID lock (/run/user/${UID}/symphony-runner/lock-wt1)
   ├─ If locked by active process → exit (other instance running)
   └─ If stale lock → clean up and continue

2. Sync with main branch (initial)
   ├─ git fetch origin main
   └─ git merge origin/main --ff-only
   ├─ This brings in all work from other worktrees that has been pushed to origin/main
   ├─ IMPORTANT: Work committed in other worktrees but not yet pushed won't be visible
   └─ Agents push completed work immediately to make it available to other worktrees

3. Acquire issue lease (via symphony-state.mjs)
   ├─ Read state.json with file lock
   ├─ Check if any issue lease is available
   ├─ Acquire lease with nonce and expiry
   └─ Start heartbeat to keep lease alive

4. Execute issue (via symphony-agent.mjs)
   ├─ Read issue context and workflow
   ├─ Call LLM via Symphony bridge
   ├─ Apply file changes
   └─ **Replay local changes onto latest main before validation**
      ├─ git diff --binary --full-index HEAD -- <changed files>
      ├─ git reset --hard HEAD && git clean -fd
      ├─ git fetch origin main
      ├─ git merge origin/main --ff-only
      ├─ git apply --index --3way <saved patch>
      ├─ If patch replay conflicts: restore local state, return to Todo/Backlog
      └─ If clean: proceed to validation without creating a merge commit

5. Run validation gates
   ├─ Now validates against latest code from all worktrees
   └─ Reduces validation failures from stale dependencies

6. Commit and push
   ├─ git add changed files
   ├─ git commit with evidence
   └─ git push origin HEAD:main (with retry + rebase)
      ├─ Retry up to 3 times on push rejection
      ├─ If rejected: fetch + rebase + retry
      └─ Handles race conditions when multiple worktrees push simultaneously

7. Release lease and notify
   ├─ Update state.json (issue → Done)
   ├─ Post Discord notification
   └─ Release PID lock

8. Cleanup and sync
   ├─ git fetch origin main
   ├─ git reset --hard origin/main
   └─ git clean -fd

9. Wait for timer (2 minutes) and repeat
```

### Lock Hierarchy

**Three levels of locking prevent conflicts:**

**Level 1: PID lock** (per-worktree)

- **File:** `/run/user/${UID}/symphony-runner/lock-wt1`
- **Purpose:** Prevent multiple systemd instances of same worktree runner
- **Scope:** Single worktree only

**Level 2: Issue lease** (cross-worktree)

- **File:** `reports/symphony/state.json` (with `state.json.lock`)
- **Purpose:** Prevent multiple runners from picking same issue
- **Scope:** All worktrees share this state

**Level 3: Git branch lock** (git-enforced)

- **Mechanism:** Git prevents same branch checkout in multiple worktrees
- **Purpose:** Prevent branch-level conflicts
- **Scope:** All worktrees in repository

### State Synchronization

**Shared state (atomic via file lock):**

```javascript
// reports/symphony/state.json
{
  "issues": {
    "ANQ-1234": {
      "issueIdentifier": "ANQ-1234",
      "lease": {
        "owner": "ubuntu-symphony-wt1",
        "nonce": "ubuntu-symphony-wt1-1711234567890",
        "expires_at": "2026-03-27T12:34:56.789Z"
      },
      "lastAttempt": "2026-03-27T12:14:56.789Z",
      "attempts": 1
    }
  }
}
```

**Per-worktree state (isolated):**

- Working directory files
- Git index (staging area)
- Local lock file
- Logs and temporary files

## Setup and Configuration

### Prerequisites

1. **Git worktree support** — Git 2.5+ (standard in modern distributions)
2. **Systemd user services** — For timer-based runner scheduling
3. **Symphony harness** — Full harness capability (see `AGENTS.md`)
4. **Disk space** — ~200 MB per worktree + shared object store

### Initial Setup

**Step 1: Initialize worktree pool**

```bash
# Create 2 worktrees (recommended starting point)
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2

# Verify creation
node scripts/ops/orchestration/symphony-worktree-pool.mjs status
```

**Expected output:**

```
=== Worktree Status ===

Total worktrees: 3
Symphony worktrees: 2

Symphony worktrees:
  [1] ✅ OK
      Path:   /home/user/src/anqr-wt1
      Branch: symphony/wt1
      HEAD:   a1b2c3d4e5f6

  [2] ✅ OK
      Path:   /home/user/src/anqr-wt2
      Branch: symphony/wt2
      HEAD:   a1b2c3d4e5f6
```

**Step 2: Install systemd template services**

```bash
# Copy template services to user systemd directory
cp services/systemd/anqr-symphony-runner@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.timer ~/.config/systemd/user/

# Reload systemd to recognize new services
systemctl --user daemon-reload
```

**Step 3: Enable concurrent runners**

```bash
# Enable and start runner instances
systemctl --user enable --now anqr-symphony-runner@1.timer
systemctl --user enable --now anqr-symphony-runner@2.timer

# Verify timers are active
systemctl --user list-timers | grep symphony
```

**Expected output:**

```
NEXT                         LEFT        LAST PASSED UNIT                              ACTIVATES
Thu 2026-03-27 12:36:00 UTC  1min 30s    -    -      anqr-symphony-runner@1.timer     anqr-symphony-runner@1.service
Thu 2026-03-27 12:36:10 UTC  1min 40s    -    -      anqr-symphony-runner@2.timer     anqr-symphony-runner@2.service
```

### Configuration Parameters

**symphony-config.mjs:**

```javascript
// Maximum concurrent issue executions
// Should match number of enabled worktree runners
export const MAX_CONCURRENT_AGENTS = 1; // ← Update to 2, 3, or 4 when enabling worktrees

// Queue depth targets (concurrent runners may increase consumption rate)
export const TARGET_MIN = 3; // Feed more issues when queue drops below this
export const TARGET_MAX = 8; // Drain issues when queue exceeds this

// Timeouts and grace periods
export const RUNNER_MAX_EXECUTION_MS = 120 * 60 * 1000; // 120 minutes
export const HEARTBEAT_INTERVAL_MS = 60 * 1000; // 1 minute
export const RECOVERY_GRACE_MS = 10 * 60 * 1000; // 10 minutes
```

**Systemd template service:**

```ini
# services/systemd/anqr-symphony-runner@.service

[Service]
WorkingDirectory=/home/user/src/anqr-wt%i  # %i replaced with instance number
Environment=ANQR_WORKTREE_ID=wt%i
Environment=ANQR_WORKTREE_PATH=/home/user/src/anqr-wt%i
TimeoutStartSec=7500  # 125 minutes (runner timeout + 5 min buffer)
MemoryMax=4G          # Limit per instance
```

## Operations

### Monitoring

**Check runner status:**

```bash
# View timer schedule
systemctl --user list-timers | grep symphony

# Check service status
systemctl --user status anqr-symphony-runner@1.service
systemctl --user status anqr-symphony-runner@2.service

# View real-time logs
journalctl --user -u anqr-symphony-runner@1.service -f
journalctl --user -u anqr-symphony-runner@2.service -f

# Combined logs from all instances
journalctl --user -u 'anqr-symphony-runner@*.service' -f
```

**Check worktree health:**

```bash
# Human-readable status
node scripts/ops/orchestration/symphony-worktree-pool.mjs status

# JSON output for scripting
node scripts/ops/orchestration/symphony-worktree-pool.mjs list

# Check for stuck work
node scripts/ops/orchestration/symphony-queue-control.mjs --enforce
```

**Monitor state:**

```bash
# Show current leases and queue
node scripts/ops/orchestration/symphony-runner.mjs --status

# Queue health
node scripts/ops/orchestration/symphony-queue-control.mjs --check
```

### Scaling

**Scale up (add concurrent capacity):**

```bash
# Create additional worktree
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 3

# Enable new runner instance
systemctl --user enable --now anqr-symphony-runner@3.timer

# Update config
# Edit scripts/ops/core/symphony-config.mjs:
# MAX_CONCURRENT_AGENTS = 3
```

**Scale down (reduce concurrent capacity):**

```bash
# Stop and disable instance
systemctl --user stop anqr-symphony-runner@3.timer
systemctl --user disable anqr-symphony-runner@3.timer

# Optionally remove worktree (or keep for future use)
# Note: Worktree can remain dormant without harm
```

**Temporary pause:**

```bash
# Pause specific instance
systemctl --user stop anqr-symphony-runner@2.timer

# Resume
systemctl --user start anqr-symphony-runner@2.timer
```

### Troubleshooting

**Problem: Worktree shows "prunable" status**

```bash
# Repair worktree links
node scripts/ops/orchestration/symphony-worktree-pool.mjs repair

# If repair fails, recreate:
node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2
```

**Problem: Runner stuck on same issue**

```bash
# Check for expired leases
node scripts/ops/orchestration/symphony-queue-control.mjs --enforce

# Manually inspect state
cat reports/symphony/state.json | jq '.issues'

# Force restart runner
systemctl --user restart anqr-symphony-runner@1.service
```

**Problem: Git merge conflicts**

```bash
# View conflict status
cd /home/user/src/anqr-wt1
git status

# Resolution options:
# Option A: Reset to main (discard worktree changes)
git fetch origin main
git reset --hard origin/main
git clean -fd

# Option B: Manual conflict resolution
git fetch origin main
git rebase origin/main
# ... resolve conflicts ...
git add .
git rebase --continue
```

**Problem: Lock file issues**

```bash
# Check for stale locks
ls -la /run/user/$(id -u)/symphony-runner/

# Remove stale lock (only if runner is NOT active)
rm /run/user/$(id -u)/symphony-runner/lock-wt1

# Verify no runner is active first:
systemctl --user status anqr-symphony-runner@1.service
```

**Problem: Disk space issues**

```bash
# Check worktree disk usage
du -sh /home/user/src/anqr-wt*

# Garbage collect shared object store
cd /home/user/src/anqr
git gc --aggressive --prune=now

# Clean node_modules in worktrees (can regenerate)
rm -rf /home/user/src/anqr-wt*/node_modules
```

### Maintenance

**Daily maintenance (automated via nightly-ops-pass):**

```bash
# Prune stale worktree metadata
git worktree prune

# Repair worktree links
git worktree repair

# Garbage collect object store
git gc --auto
```

**Weekly maintenance (manual):**

```bash
# Verify worktree integrity
node scripts/ops/orchestration/symphony-worktree-pool.mjs status

# Review runner performance
journalctl --user -u 'anqr-symphony-runner@*.service' --since '7 days ago' | grep 'completed'

# Check queue health
node scripts/ops/orchestration/symphony-queue-control.mjs --check
```

**Emergency recovery (single worktree corrupted):**

```bash
# Stop all runners
systemctl --user stop 'anqr-symphony-runner@*.timer'

# Reset all worktrees to clean state
for i in 1 2 3; do
  cd /home/user/src/anqr-wt$i
  git fetch origin main
  git reset --hard origin/main
  git clean -fd
done

# Restart runners
systemctl --user start 'anqr-symphony-runner@*.timer'
```

### Total Worktree Corruption Recovery

If all worktrees are corrupted (e.g., disk full scenario):

```bash
# Step 1: Stop all runners
systemctl --user stop 'anqr-symphony-runner@*.timer'

# Step 2: Remove all worktrees
node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup

# Step 3: Recreate fresh pool
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2

# Step 4: Restart runners
systemctl --user start 'anqr-symphony-runner@*.timer'
```

**No data loss** — all state preserved in `reports/symphony/state.json`.

## Performance and Resource Impact

### Resource Usage

**Per worktree:**

| Resource | Idle   | Active (execution) | Peak (validation) |
| -------- | ------ | ------------------ | ----------------- |
| Disk     | 200 MB | 200 MB             | 250 MB            |
| Memory   | 50 MB  | 300-500 MB         | 1-2 GB            |
| CPU      | 0%     | 5-10%              | 50-100%           |
| Network  | 0 KB/s | 10-50 KB/s (LLM)   | 100-500 KB/s      |

**Shared resources:**

- Git object store: ~500 MB (shared across all worktrees)
- Symphony bridge: ~200 MB memory (shared service)
- Linear API: Minimal (rate-limited to 1 req/sec)

### Expected Throughput

**Baseline (single runner):**

- **Throughput:** 2-3 issues/hour
- **Idle time:** 40-60% (waiting for LLM, validation, git push)
- **Bottleneck:** Serial execution, unused CPU during network waits

**With 2 concurrent worktrees:**

- **Expected throughput:** 4-5 issues/hour (75% increase)
- **Idle time:** 20-30% (better resource utilization)
- **Bottleneck:** LLM provider rate limits, queue depth

**With 4 concurrent worktrees:**

- **Expected throughput:** 6-8 issues/hour (150% increase)
- **Idle time:** 10-20% (near-optimal resource utilization)
- **Bottleneck:** Queue feeding, provider credits

### Benchmark Validation

**Phase 2 validation plan (not yet executed):**

```bash
# 4-hour benchmark test
# Measure: throughput, idle time, conflict rate, resource usage

# Baseline (1 worktree)
systemctl --user stop 'anqr-symphony-runner@*.timer'
systemctl --user start anqr-symphony-runner@1.timer
# ... run for 4 hours, capture metrics ...

# 2 concurrent worktrees
systemctl --user start anqr-symphony-runner@2.timer
# ... run for 4 hours, capture metrics ...

# 4 concurrent worktrees
systemctl --user start anqr-symphony-runner@3.timer
systemctl --user start anqr-symphony-runner@4.timer
# ... run for 4 hours, capture metrics ...

# Analyze results
node scripts/ops/symphony-benchmark-report.mjs
```

## Benefits Realization

### Immediate Benefits

1. **Increased throughput** — 75-150% more issues completed per day
2. **Better resource utilization** — CPU idle during network waits now executes other issues
3. **Reduced queue buildup** — Faster consumption prevents "Todo" overflow
4. **Faster feedback cycles** — Issues complete sooner, bugs caught earlier

### Operational Benefits

1. **Graceful degradation** — If one worktree corrupts, others continue operating
2. **Easy scaling** — Add/remove worktrees without downtime
3. **Independent monitoring** — Each worktree has isolated logs and status
4. **Safe experimentation** — Test changes in one worktree without affecting others

### Long-Term Benefits

1. **Foundation for horizontal scaling** — Worktree model can extend to multiple machines
2. **Improved test coverage velocity** — Faster execution enables more test iterations
3. **Reduced operator intervention** — Higher throughput means more autonomous progress
4. **Cost efficiency** — Better resource utilization per dollar of infrastructure

## Limitations and Constraints

### When NOT to Use Worktrees

**Don't use concurrent worktrees if:**

- ✗ System has <4 GB RAM (not enough for multiple runners)
- ✗ Single-core CPU (concurrency won't help)
- ✗ Disk space constrained (<2 GB free)
- ✗ Testing/debugging (single runner easier to monitor)
- ✗ Queue is consistently empty (no work to parallelize)

### Known Limitations

1. **Branch proliferation** — Each worktree creates a branch (cleanup required)
2. **Complexity overhead** — More moving parts to monitor and debug
3. **Merge conflicts possible** — If multiple runners modify same files (rare due to lease system)
4. **Provider rate limits** — Concurrent runners may hit API rate limits faster
5. **Memory scaling** — 4+ concurrent runners requires 8+ GB RAM

### Conflict Scenarios

**Lease system prevents most conflicts:**

- ✅ Two runners picking same issue → **Prevented** (lease system)
- ✅ Two runners modifying same files → **Prevented** (lease ensures different issues)
- ⚠️ Two runners pushing simultaneously → **Possible** (git handles gracefully)
- ⚠️ Two runners modifying shared config → **Possible** (rare, requires manual merge)

**When conflicts occur:**

```bash
# Conflict during push
! [rejected]        symphony/wt1 -> main (non-fast-forward)

# Resolution (automatic in runner):
git fetch origin main
git rebase origin/main
git push origin symphony/wt1:main
```

## Rollback and Safety

### Rollback to Single Runner

If concurrent execution causes issues:

```bash
# Step 1: Stop all worktree runners
systemctl --user stop 'anqr-symphony-runner@*.timer'
systemctl --user disable 'anqr-symphony-runner@*.timer'

# Step 2: Start original single runner
systemctl --user start anqr-symphony-runner.timer

# Step 3: Update config
# Edit scripts/ops/core/symphony-config.mjs:
# MAX_CONCURRENT_AGENTS = 1

# Step 4: Optionally clean up worktrees
node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup
```

**Data safety:** All state is in `reports/symphony/state.json` — no data loss on rollback.

### Safety Guarantees

**What worktrees preserve:**

- ✅ Issue execution history (state.json)
- ✅ Git commit history (all in main branch)
- ✅ Discord notifications (already sent)
- ✅ Evidence artifacts (committed to repo)

**What worktrees cannot corrupt:**

- ✅ Main repository working directory (isolated)
- ✅ Shared git objects (append-only)
- ✅ Linear issue state (API-managed)
- ✅ Provider credits (rate-limited per account)

## Future Enhancements

### Potential Improvements

1. **Dynamic scaling** — Auto-adjust worktree count based on queue depth
2. **Load balancing** — Assign complex issues to dedicated worktrees
3. **Distributed worktrees** — Extend model to multiple machines
4. **Resource affinity** — Pin worktrees to specific CPU cores
5. **Metrics dashboard** — Real-time worktree performance visualization

### Migration to Multi-Machine

Worktree model can extend to horizontal scaling:

```
Machine 1: /home/user/src/anqr (main repo + 2 worktrees)
Machine 2: /home/user/src/anqr (clone + 2 worktrees)
Machine 3: /home/user/src/anqr (clone + 2 worktrees)
```

**Requirements:**

- Shared `state.json` (via NFS or distributed lock service)
- Coordinated git fetch/push
- Unique HOST_ID per machine

## Conclusion

Git worktrees provide **clean, disk-efficient isolation** for concurrent Symphony execution:

- ✅ **Proven feasibility** — Implementation complete, ready for validation
- ✅ **Minimal changes** — Existing architecture already supports concurrency
- ✅ **Predictable gains** — 75-150% throughput increase expected
- ✅ **Safe rollback** — Can revert to single runner without data loss
- ✅ **Foundation for scaling** — Enables future horizontal expansion

**Next phase:** Phase 2 validation with 4-hour benchmark testing.

## References

- [ANQ-1099 Investigation Evidence](/home/user/src/anqr/docs/harness/evidence/ANQ-1099-worktree-investigation.md)
- [Symphony Orchestration README](/home/user/src/anqr/scripts/ops/orchestration/README.md)
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Symphony State Management](/home/user/src/anqr/scripts/ops/core/symphony-state.mjs)
- [Symphony Runner](/home/user/src/anqr/scripts/ops/orchestration/symphony-runner.mjs)
