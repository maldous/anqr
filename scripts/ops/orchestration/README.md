# Symphony Orchestration

This directory contains the core Symphony harness orchestration scripts.

## Components

### symphony-runner.mjs

Main execution agent that picks up Linear issues and implements them via AI agent.

**Features:**

- Lease-based concurrency control
- Validation and commit workflow
- Provider routing via Symphony bridge
- Worktree-aware for concurrent execution

**Usage:**

```bash
# Single execution cycle
node scripts/ops/orchestration/symphony-runner.mjs --once

# Dry run (no changes)
node scripts/ops/orchestration/symphony-runner.mjs --once --dry-run

# Show status
node scripts/ops/orchestration/symphony-runner.mjs --status
```

**Worktree support:**
Set `ANQR_WORKTREE_ID` and `ANQR_WORKTREE_PATH` environment variables to run in a worktree.

### symphony-queue-control.mjs

Queue management for Symphony execution pipeline.

**Usage:**

```bash
# Check queue health
node scripts/ops/orchestration/symphony-queue-control.mjs --check

# Feed issues from Backlog to Todo
node scripts/ops/orchestration/symphony-queue-control.mjs --feed

# Drain overflow issues from Todo to Backlog
node scripts/ops/orchestration/symphony-queue-control.mjs --drain

# Enforce concurrent limits and detect stuck work
node scripts/ops/orchestration/symphony-queue-control.mjs --enforce

# Run all operations
node scripts/ops/orchestration/symphony-queue-control.mjs --all

# Dry run (no changes)
node scripts/ops/orchestration/symphony-queue-control.mjs --all --dry-run
```

### symphony-worktree-pool.mjs

Git worktree pool management for concurrent Symphony execution.

**Features:**

- Create/destroy Symphony worktrees
- List and monitor worktree status
- Repair corrupted worktrees
- Automatic cleanup

**Usage:**

```bash
# Initialize worktree pool (default: 2 worktrees)
node scripts/ops/orchestration/symphony-worktree-pool.mjs init [count]

# Initialize with 4 worktrees
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 4

# Show worktree status (human-readable)
node scripts/ops/orchestration/symphony-worktree-pool.mjs status

# List worktrees (JSON output)
node scripts/ops/orchestration/symphony-worktree-pool.mjs list

# Repair corrupted worktrees
node scripts/ops/orchestration/symphony-worktree-pool.mjs repair

# Cleanup all Symphony worktrees
node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup
```

**Worktree naming:**

- Worktrees: `/home/user/src/anqr-wt1`, `/home/user/src/anqr-wt2`, etc.
- Branches: `symphony/wt1`, `symphony/wt2`, etc.

## Concurrent Execution with Worktrees

### Setup

1. **Initialize worktree pool:**

   ```bash
   node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2
   ```

2. **Install systemd template services:**

   ```bash
   cp services/systemd/anqr-symphony-runner@.service ~/.config/systemd/user/
   cp services/systemd/anqr-symphony-runner@.timer ~/.config/systemd/user/
   systemctl --user daemon-reload
   ```

3. **Enable multiple runner instances:**
   ```bash
   systemctl --user enable --now anqr-symphony-runner@1.timer
   systemctl --user enable --now anqr-symphony-runner@2.timer
   ```

### Monitoring

```bash
# Check timer status
systemctl --user list-timers | grep symphony

# Check service status
systemctl --user status anqr-symphony-runner@1.service
systemctl --user status anqr-symphony-runner@2.service

# View logs
journalctl --user -u anqr-symphony-runner@1.service -f
journalctl --user -u anqr-symphony-runner@2.service -f

# Check worktree status
node scripts/ops/orchestration/symphony-worktree-pool.mjs status
```

### Scaling

**Scale up (add more concurrent runners):**

```bash
# Create additional worktree
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 3

# Enable new instance
systemctl --user enable --now anqr-symphony-runner@3.timer
```

**Scale down (reduce concurrent runners):**

```bash
# Stop and disable instance
systemctl --user stop anqr-symphony-runner@3.timer
systemctl --user disable anqr-symphony-runner@3.timer

# Remove worktree (optional)
# Note: Can keep worktree for future use
```

### Troubleshooting

**Worktree corruption:**

```bash
# Repair all worktrees
node scripts/ops/orchestration/symphony-worktree-pool.mjs repair

# If repair fails, recreate:
node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2
```

**Stuck runner:**

```bash
# Check for stuck work
node scripts/ops/orchestration/symphony-queue-control.mjs --enforce

# Restart specific instance
systemctl --user restart anqr-symphony-runner@1.service
```

**Lock issues:**

```bash
# Check lock status
node scripts/ops/orchestration/symphony-runner.mjs --status

# Locks are worktree-specific: /run/user/${UID}/symphony-runner/lock-wt1
# Main worktree uses: /run/user/${UID}/symphony-runner/lock-main
```

## Architecture

### Concurrency Model

- Each worktree runs independently with its own:
  - Working directory (e.g., `/home/user/src/anqr-wt1`)
  - Git branch (e.g., `symphony/wt1`)
  - Lock file (e.g., `/run/user/${UID}/symphony-runner/lock-wt1`)

- Shared state:
  - `reports/symphony/state.json` — file-based locking ensures atomicity
  - Symphony bridge (HTTP service on port 4319)
  - Linear API

### Lease System

The `symphony-state.mjs` lease system prevents concurrent work on the same issue:

- Each runner attempts to acquire a lease before starting work
- Leases expire after inactivity (default: 20 minutes)
- Background heartbeat keeps leases alive during execution
- Queue control detects and recovers expired leases

### Worktree Lifecycle

```
┌─────────────┐
│  AVAILABLE  │ ← Worktree exists, no active runner
└──────┬──────┘
       │ Runner acquires lock
       ▼
┌─────────────┐
│   ACTIVE    │ ← Runner executing issue
└──────┬──────┘
       │ Issue completes
       ▼
┌─────────────┐
│   SYNCING   │ ← Sync with main, cleanup
└──────┬──────┘
       │ Ready for next issue
       ▼
┌─────────────┐
│  AVAILABLE  │
└─────────────┘
```

## Configuration

Edit `scripts/ops/core/symphony-config.mjs` to adjust:

- `MAX_CONCURRENT_AGENTS` — maximum concurrent issue executions (default: 1)
- `TARGET_MIN` / `TARGET_MAX` — queue depth targets
- `RUNNER_MAX_EXECUTION_MS` — hard timeout per issue
- `HEARTBEAT_INTERVAL_MS` — lease renewal frequency
- `RECOVERY_GRACE_MS` — grace period before recovering stuck work

## Documentation

**Quick Start:**

- [WORKTREE-QUICKSTART.md](/home/user/src/anqr/docs/harness/WORKTREE-QUICKSTART.md) — 10-minute setup guide

**Comprehensive Guides:**

- [12-concurrent-execution-with-worktrees.md](/home/user/src/anqr/docs/harness/12-concurrent-execution-with-worktrees.md) — complete worktree documentation
- [ANQ-1099-worktree-investigation.md](/home/user/src/anqr/docs/harness/evidence/ANQ-1099-worktree-investigation.md) — investigation and design decisions
